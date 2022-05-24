import { Method } from '../vendor/chubbyts-types/message';
import { Handler } from '../vendor/chubbyts-types/handler';
import { Middleware } from '../vendor/chubbyts-types/middleware';

export type PathOptions = { [key: string]: unknown };

export type Route = {
  method: Method;
  path: string;
  name: string;
  handler: Handler;
  middlewares: Array<Middleware>;
  pathOptions: PathOptions;
  attributes: Record<string, any>;
  _route: string;
};

export const isRoute = (route: unknown): route is Route => {
  return typeof route === 'object' && null !== route && typeof (route as Route)._route === 'string';
};

type RouteArgument = {
  method: Method;
  path: string;
  name: string;
  handler: Handler;
  middlewares?: Array<Middleware>;
  pathOptions?: PathOptions;
};

type RouteWithGivenMethodArgument = Omit<RouteArgument, 'method'>;

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
  return createRoute({ method: Method.DELETE, ...args });
};

export const createGetRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ method: Method.GET, ...args });
};

export const createHeadRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ method: Method.HEAD, ...args });
};

export const createOptionsRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ method: Method.OPTIONS, ...args });
};

export const createPatchRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ method: Method.PATCH, ...args });
};

export const createPostRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ method: Method.POST, ...args });
};

export const createPutRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ method: Method.PUT, ...args });
};
