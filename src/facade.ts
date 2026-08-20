import type { Handler, Middleware } from '@chubbyts/chubbyts-undici-server/dist/server';
import { ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { Logger } from '@chubbyts/chubbyts-log-types/dist/log';
import type { MapToHttpError } from '@chubbyts/chubbyts-http-error/dist/http-error';
import { createApplication } from './application.js';
import { createErrorMiddleware } from './middleware/error-middleware.js';
import { createRouteMatcherMiddleware } from './middleware/route-matcher-middleware.js';
import type { PathOptions, Route } from './router/route.js';
import { createRoute } from './router/route.js';
import type { Group } from './router/group.js';
import { createGroup, getRoutes } from './router/group.js';
import { createRoutesByName } from './router/routes-by-name.js';
import type { CreateMatch } from './router/route-matcher.js';
import type { CreateGeneratePath, CreateGenerateUrl, GeneratePath, GenerateUrl } from './router/url-generator.js';

type AddRoute<Self> = {
  (path: string, name: string, handler: Handler, pathOptions?: PathOptions): Self;
  (path: string, name: string, middlewares: Array<Middleware>, handler: Handler, pathOptions?: PathOptions): Self;
};

type AddRouteWithMethod<Self> = {
  (method: string, path: string, name: string, handler: Handler, pathOptions?: PathOptions): Self;
  (
    method: string,
    path: string,
    name: string,
    middlewares: Array<Middleware>,
    handler: Handler,
    pathOptions?: PathOptions,
  ): Self;
};

type Configure = (group: GroupCollector) => GroupCollector;

type AddGroup<Self> = {
  (path: string, configure: Configure, pathOptions?: PathOptions): Self;
  (path: string, middlewares: Array<Middleware>, configure: Configure, pathOptions?: PathOptions): Self;
};

type Collector<Extra> = Extra & {
  route: AddRouteWithMethod<Collector<Extra>>;
  delete: AddRoute<Collector<Extra>>;
  get: AddRoute<Collector<Extra>>;
  head: AddRoute<Collector<Extra>>;
  options: AddRoute<Collector<Extra>>;
  patch: AddRoute<Collector<Extra>>;
  post: AddRoute<Collector<Extra>>;
  put: AddRoute<Collector<Extra>>;
  group: AddGroup<Collector<Extra>>;
};

type GroupCollector = Collector<{ children: ReadonlyArray<Group | Route> }>;

type ApplicationBuilder = Collector<{ build: () => Handler }>;

type ApplicationBuilderOptions = {
  debug?: boolean;
  logger?: Logger;
  mapToHttpError?: MapToHttpError;
  createGeneratePath?: CreateGeneratePath;
  createGenerateUrl?: CreateGenerateUrl;
};

const createRouteCollector = <Self>(
  children: ReadonlyArray<Group | Route>,
  next: (children: ReadonlyArray<Group | Route>) => Self,
) => {
  const addRoute = (
    method: string,
    path: string,
    name: string,
    middlewaresOrHandler: Array<Middleware> | Handler,
    handlerOrPathOptions?: Handler | PathOptions,
    pathOptions?: PathOptions,
  ): Self => {
    const [middlewares, handler, resolvedPathOptions] = Array.isArray(middlewaresOrHandler)
      ? [[...middlewaresOrHandler], handlerOrPathOptions as Handler, pathOptions]
      : [[], middlewaresOrHandler, handlerOrPathOptions as PathOptions | undefined];

    return next([
      ...children,
      createRoute({ method, path, name, middlewares, handler, pathOptions: resolvedPathOptions }),
    ]);
  };

  const route: AddRouteWithMethod<Self> = addRoute;

  const add =
    (method: string): AddRoute<Self> =>
    (
      path: string,
      name: string,
      middlewaresOrHandler: Array<Middleware> | Handler,
      handlerOrPathOptions?: Handler | PathOptions,
      pathOptions?: PathOptions,
    ) =>
      addRoute(method, path, name, middlewaresOrHandler, handlerOrPathOptions, pathOptions);

  const group: AddGroup<Self> = (
    path: string,
    middlewaresOrConfigure: Array<Middleware> | Configure,
    configureOrPathOptions?: Configure | PathOptions,
    pathOptions?: PathOptions,
  ) => {
    const [middlewares, configure, resolvedPathOptions] = Array.isArray(middlewaresOrConfigure)
      ? [[...middlewaresOrConfigure], configureOrPathOptions as Configure, pathOptions]
      : [[], middlewaresOrConfigure, configureOrPathOptions as PathOptions | undefined];

    return next([
      ...children,
      createGroup({
        path,
        middlewares,
        children: [...configure(createGroupCollector([])).children],
        pathOptions: resolvedPathOptions,
      }),
    ]);
  };

  return {
    route,
    delete: add('DELETE'),
    get: add('GET'),
    head: add('HEAD'),
    options: add('OPTIONS'),
    patch: add('PATCH'),
    post: add('POST'),
    put: add('PUT'),
    group,
  };
};

const createGroupCollector = (children: ReadonlyArray<Group | Route>): GroupCollector => ({
  ...createRouteCollector(children, createGroupCollector),
  children,
});

const createGeneratorsMiddleware =
  ({ generatePath, generateUrl }: { generatePath?: GeneratePath; generateUrl?: GenerateUrl }): Middleware =>
  async (serverRequest: ServerRequest, handler: Handler) =>
    handler(
      new ServerRequest(serverRequest, {
        attributes: {
          ...serverRequest.attributes,
          ...(generatePath ? { generatePath } : {}),
          ...(generateUrl ? { generateUrl } : {}),
        },
      }),
    );

const createApplicationBuilderFromChildren = (
  createMatch: CreateMatch,
  middlewares: Array<Middleware>,
  options: ApplicationBuilderOptions,
  children: ReadonlyArray<Group | Route>,
): ApplicationBuilder => ({
  ...createRouteCollector(children, (newChildren) =>
    createApplicationBuilderFromChildren(createMatch, middlewares, options, newChildren),
  ),
  build: () => {
    const routesByName = createRoutesByName(getRoutes(createGroup({ path: '', children: [...children] })));

    const generatePath = options.createGeneratePath ? options.createGeneratePath(routesByName) : undefined;
    const generateUrl = options.createGenerateUrl ? options.createGenerateUrl(routesByName) : undefined;

    return createApplication([
      createErrorMiddleware(options.debug, options.logger, options.mapToHttpError),
      ...(generatePath || generateUrl ? [createGeneratorsMiddleware({ generatePath, generateUrl })] : []),
      ...middlewares,
      createRouteMatcherMiddleware(createMatch(routesByName)),
    ]);
  },
});

/**
 * A facade around createApplication / createErrorMiddleware / createRouteMatcherMiddleware / createRoute /
 * createGroup: pure construction sugar, the returned handler is the very same middleware pipe as with the
 * explicit composition: error middleware first, app middlewares, route matcher middleware last.
 *
 * The facade is agnostic to the router implementation: the matcher factory is given as the first parameter,
 * for example createPathToRegexpRouteMatcher from `@chubbyts/chubbyts-framework-router-path-to-regexp`.
 *
 * The application builder is immutable: every route / group call returns a new application builder, so use
 * the return value (chaining or reassignment). Middlewares are given as an optional parameter directly
 * before the element content they wrap, and can be omitted entirely if there are none. Route names are
 * given as the required second parameter. Routes and groups accept pathOptions as an optional last
 * parameter, group pathOptions are merged into their children. Beside the seven method shortcuts
 * (delete / get / head / options / patch / post / put) there is a generic `route` accepting any method as
 * its first parameter: `.route('TRACE', '/trace', 'trace', traceHandler)`.
 *
 * With the createGeneratePath option (for example createPathToRegexpGeneratePath) a `generatePath` request
 * attribute becomes available within middlewares and handlers:
 * `(serverRequest.attributes.generatePath as GeneratePath)('pet_read', { id: '1' })`. With the
 * createGenerateUrl option (for example createPathToRegexpGenerateUrl) a `generateUrl` request attribute
 * becomes available as well. Both options are independent of each other.
 *
 * ```ts
 * import { createPathToRegexpMatch as createMatch }
 *   from '@chubbyts/chubbyts-framework-router-path-to-regexp/dist/path-to-regexp-router';
 * import { createApplicationBuilder } from '@chubbyts/chubbyts-framework/dist/facade';
 *
 * const application = createApplicationBuilder(createMatch, [corsMiddleware])
 *   .get('/ping', 'ping', pingHandler)
 *   .get('/openapi', 'openapi', openApiHandler)
 *   .group('/api/pets', [acceptNegotiationMiddleware, apiErrorMiddleware], (pets) =>
 *     pets
 *       .get('', 'pet_list', petListHandler)
 *       .post('', 'pet_create', [contentTypeNegotiationMiddleware], petCreateHandler)
 *       .get('/:id', 'pet_read', petReadHandler)
 *       .put('/:id', 'pet_update', [contentTypeNegotiationMiddleware], petUpdateHandler)
 *       .delete('/:id', 'pet_delete', petDeleteHandler),
 *   )
 *   .build();
 * ```
 */
export const createApplicationBuilder: {
  (createMatch: CreateMatch, options?: ApplicationBuilderOptions): ApplicationBuilder;
  (createMatch: CreateMatch, middlewares: Array<Middleware>, options?: ApplicationBuilderOptions): ApplicationBuilder;
} = (
  createMatch: CreateMatch,
  middlewaresOrOptions?: Array<Middleware> | ApplicationBuilderOptions,
  options?: ApplicationBuilderOptions,
): ApplicationBuilder => {
  const [middlewares, resolvedOptions] = Array.isArray(middlewaresOrOptions)
    ? [[...middlewaresOrOptions], options ?? {}]
    : [[], middlewaresOrOptions ?? {}];

  return createApplicationBuilderFromChildren(createMatch, middlewares, resolvedOptions, []);
};
