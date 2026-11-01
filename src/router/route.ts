import type { Handler, Middleware } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { RequiredProperties } from '../types.js';

export type PathOptions = { [key: string]: unknown };

export type RouteWithGivenMethodArgument = {
  path: string;
  name: string;
  handler: Handler;
  middlewares?: Array<Middleware>;
  pathOptions?: PathOptions;
};

export type RouteArgument = {
  method: string;
} & RouteWithGivenMethodArgument;

export type Route = RequiredProperties<RouteArgument, 'middlewares' | 'pathOptions'> & {
  attributes: Record<string, string>;
  _route: string;
};

export const isRoute = (route: unknown): route is Route => {
  return typeof route === 'object' && null !== route && '_route' in route;
};

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

export const createDeleteRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: 'DELETE' });
};

export const createGetRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: 'GET' });
};

export const createHeadRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: 'HEAD' });
};

export const createOptionsRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: 'OPTIONS' });
};

export const createPatchRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: 'PATCH' });
};

export const createPostRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: 'POST' });
};

export const createPutRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: 'PUT' });
};
