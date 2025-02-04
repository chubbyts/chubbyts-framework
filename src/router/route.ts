import type { Method } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import type { RequiredProperties } from '../types';

/**
 * ```ts
 * import type { PathOptions } from '@chubbyts/chubbyts-framework/dist/router/route';
 *
 * const pathOptions: PathOptions = { key: 'value' };
 * ```
 */
export type PathOptions = { [key: string]: unknown };

export type RouteWithGivenMethodArgument = {
  path: string;
  name: string;
  handler: Handler;
  middlewares?: Array<Middleware>;
  pathOptions?: PathOptions;
};

export type RouteArgument = {
  method: Method;
} & RouteWithGivenMethodArgument;

/**
 * ```ts
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 *
 * const route: Route = {
 *   method: 'POST'
 *   path: '/api/users',
 *   handler: userCreateHandler,
 *   middlewares: [],
 *   pathOptions: {},
 *   attributes: {},
 *   _route: 'Route',
 * }
 * ```
 */
export type Route = RequiredProperties<RouteArgument, 'middlewares' | 'pathOptions'> & {
  attributes: Record<string, string>;
  _route: string;
};

/**
 * ```ts
 * import type { Group } from '@chubbyts/chubbyts-framework/dist/router/group';
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 *
 * const group: Group = { ...,  _group: 'Group' };
 * const route: Route = { ...,  _route: 'Route' };
 *
 * isRoute(group) // false
 * isRoute(route) // true
 * ```
 */
export const isRoute = (route: unknown): route is Route => {
  return typeof route === 'object' && null !== route && '_route' in route;
};

/**
 * ```ts
 * import type { ResponseFactory } from '@chubbyts/chubbyts-http-types/dist/message-factory';
 * import type { Method, Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 * import { createRoute } from '@chubbyts/chubbyts-framework/dist/router/route';
 *
 * const responseFactory: ResponseFactory = ...;
 *
 * const route: Route = createRoute({
 *   method: 'GET'
 *   path: '/hello/:name([a-z]+)',
 *   name: 'hello',
 *   handler: async (request: ServerRequest): Promise<Response> => {
 *     const response = responseFactory(200);
 *     response.body.end(`Hello, ${request.attributes.name}`);
 *
 *     return {
 *       ...response,
 *       headers: { ...response.headers, 'content-type': ['text/plain'] }
 *     };
 *   },
 * });
 * ```
 */
export const createRoute = ({ method, path, name, handler, middlewares, pathOptions }: RouteArgument): Route => {
  return {
    method,
    path,
    name,
    handler,
    middlewares: middlewares ?? [],
    pathOptions: pathOptions ?? {},
    attributes: {},
    _route: 'Route',
  };
};

/**
 * ```ts
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 * import { createDeleteRoute } from '@chubbyts/chubbyts-framework/dist/router/route';
 *
 * const route: Route = createDeleteRoute({
 *   path: '/api/users/:id',
 *   handler: userDeleteHandler,
 * });
 * ```
 */
export const createDeleteRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: 'DELETE' as Method });
};

/**
 * ```ts
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 * import { createGetRoute } from '@chubbyts/chubbyts-framework/dist/router/route';
 *
 * const route: Route = createGetRoute({
 *   path: '/api/users/:id',
 *   handler: userReadHandler,
 * });
 * ```
 */
export const createGetRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: 'GET' as Method });
};

/**
 * ```ts
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 * import { createHeadRoute } from '@chubbyts/chubbyts-framework/dist/router/route';
 *
 * const route: Route = createHeadRoute({
 *   path: '/api/users/:id',
 *   handler: userExistsHandler,
 * });
 * ```
 */
export const createHeadRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: 'HEAD' as Method });
};

/**
 * ```ts
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 * import { createOptionsRoute } from '@chubbyts/chubbyts-framework/dist/router/route';
 *
 * const route: Route = createOptionsRoute({
 *   path: '/api/users/:id',
 *   handler: corsHandler,
 * });
 * ```
 */
export const createOptionsRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: 'OPTIONS' as Method });
};

/**
 * ```ts
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 * import { createPatchRoute } from '@chubbyts/chubbyts-framework/dist/router/route';
 *
 * const route: Route = createPatchRoute({
 *   path: '/api/users/:id',
 *   handler: userUpdateHandler,
 * });
 * ```
 */
export const createPatchRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: 'PATCH' as Method });
};

/**
 * ```ts
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 * import { createPostRoute } from '@chubbyts/chubbyts-framework/dist/router/route';
 *
 * const route: Route = createPostRoute({
 *   path: '/api/users',
 *   handler: userCreateHandler,
 * });
 * ```
 */
export const createPostRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: 'POST' as Method });
};

/**
 * ```ts
 * import type { Route } from '@chubbyts/chubbyts-framework/dist/router/route';
 * import { createPutRoute } from '@chubbyts/chubbyts-framework/dist/router/route';
 *
 * const route: Route = createPutRoute({
 *   path: '/api/users/:id',
 *   handler: userReplaceHandler,
 * });
 * ```
 */
export const createPutRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: 'PUT' as Method });
};
