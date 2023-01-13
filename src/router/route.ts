import { Method } from '@chubbyts/chubbyts-http-types/dist/message';
import { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { RequiredProperties } from '../types';

export type PathOptions = { [key: string]: unknown };

type RouteWithGivenMethodArgument = {
  path: string;
  name: string;
  handler: Handler;
  middlewares?: Array<Middleware>;
  pathOptions?: PathOptions;
};

type RouteArgument = {
  method: Method;
} & RouteWithGivenMethodArgument;

export type Route = RequiredProperties<RouteArgument, 'middlewares' | 'pathOptions'> & {
  attributes: Record<string, string>;
  _route: string;
};

export const isRoute = (route: unknown): route is Route => {
  return typeof route === 'object' && null !== route && typeof (route as Route)._route === 'string';
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
  return createRoute({ ...args, method: Method.DELETE });
};

export const createGetRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: Method.GET });
};

export const createHeadRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: Method.HEAD });
};

export const createOptionsRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: Method.OPTIONS });
};

export const createPatchRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: Method.PATCH });
};

export const createPostRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: Method.POST });
};

export const createPutRoute = (args: RouteWithGivenMethodArgument): Route => {
  return createRoute({ ...args, method: Method.PUT });
};
