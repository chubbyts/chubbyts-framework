import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Attributes, Method } from '@chubbyts/chubbyts-http-types/message';
import type { BodyFactory, ResponseFactory } from '@chubbyts/chubbyts-http-types/message-factory';
import type { Middleware } from '@chubbyts/chubbyts-http-types/middleware';
import type { Logger } from '@chubbyts/chubbyts-log-types/dist/log';
import type { MapToHttpError } from '@chubbyts/chubbyts-http-error/dist/http-error';
import { createApplication } from './application.js';
import { createErrorMiddleware } from './middleware/error-middleware.js';
import { createUrlGeneratorMiddleware } from './middleware/url-generator-middleware.js';
import { createRouteMatcherMiddleware } from './middleware/route-matcher-middleware.js';
import type { PathOptions, Route } from './router/route.js';
import { createRoute } from './router/route.js';
import type { Group } from './router/group.js';
import { createGroup, getRoutes } from './router/group.js';
import { createRoutesByName } from './router/routes-by-name.js';
import type { CreateMatch } from './router/route-matcher.js';
import type { CreateGeneratePath, CreateGenerateUrl } from './router/url-generator.js';

type AddRoute<Self> = {
  <A extends Attributes = Attributes>(path: string, name: string, handler: Handler<A>, pathOptions?: PathOptions): Self;
  <A extends Attributes = Attributes>(
    path: string,
    name: string,
    middlewares: Array<Middleware>,
    handler: Handler<A>,
    pathOptions?: PathOptions,
  ): Self;
};

type AddRouteWithMethod<Self> = {
  <A extends Attributes = Attributes>(
    method: Method,
    path: string,
    name: string,
    handler: Handler<A>,
    pathOptions?: PathOptions,
  ): Self;
  <A extends Attributes = Attributes>(
    method: Method,
    path: string,
    name: string,
    middlewares: Array<Middleware>,
    handler: Handler<A>,
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

export type ApplicationBuilderDependencies = {
  createMatch: CreateMatch;
  responseFactory: ResponseFactory;
  bodyFactory: BodyFactory;
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
    method: Method,
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
    (method: Method): AddRoute<Self> =>
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

const createApplicationBuilderFromChildren = (
  dependencies: ApplicationBuilderDependencies,
  middlewares: Array<Middleware>,
  children: ReadonlyArray<Group | Route>,
): ApplicationBuilder => ({
  ...createRouteCollector(children, (newChildren) =>
    createApplicationBuilderFromChildren(dependencies, middlewares, newChildren),
  ),
  build: () => {
    const {
      createMatch,
      responseFactory,
      bodyFactory,
      debug,
      logger,
      mapToHttpError,
      createGeneratePath,
      createGenerateUrl,
    } = dependencies;

    const routesByName = createRoutesByName(getRoutes(createGroup({ path: '', children: [...children] })));

    const generatePath = createGeneratePath ? createGeneratePath(routesByName) : undefined;
    const generateUrl = createGenerateUrl ? createGenerateUrl(routesByName) : undefined;

    return createApplication([
      createErrorMiddleware(responseFactory, bodyFactory, debug, logger, mapToHttpError),
      ...(generatePath || generateUrl ? [createUrlGeneratorMiddleware({ generatePath, generateUrl })] : []),
      ...middlewares,
      createRouteMatcherMiddleware(createMatch(routesByName)),
    ]);
  },
});

export const createApplicationBuilder = (
  dependencies: ApplicationBuilderDependencies,
  middlewares: Array<Middleware>,
): ApplicationBuilder => createApplicationBuilderFromChildren(dependencies, [...middlewares], []);
