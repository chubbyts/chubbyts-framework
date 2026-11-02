import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Attributes, Method } from '@chubbyts/chubbyts-http-types/message';
import type { Middleware } from '@chubbyts/chubbyts-http-types/middleware';
import type { RequiredProperties } from '../types.js';

export type PathOptions = { [key: string]: unknown };

export type RouteWithGivenMethodArgument<A extends Attributes = Attributes> = {
  path: string;
  name: string;
  handler: Handler<A>;
  middlewares?: Array<Middleware>;
  pathOptions?: PathOptions;
};

export type RouteArgument<A extends Attributes = Attributes> = {
  method: Method;
} & RouteWithGivenMethodArgument<A>;

export type Route = RequiredProperties<RouteArgument, 'middlewares' | 'pathOptions'> & {
  attributes: Record<string, string>;
  _route: string;
};

export const isRoute = (route: unknown): route is Route => {
  return typeof route === 'object' && null !== route && '_route' in route;
};

export const createRoute = <A extends Attributes = Attributes>({
  method,
  path,
  name,
  handler,
  middlewares,
  pathOptions,
}: RouteArgument<A>): Route => {
  return {
    method,
    path,
    name,
    // Handler<A> is contravariant in A, so it is not assignable to Handler. The router provides the matched route
    // attributes at runtime, so storing the handler with the wider type is safe.
    handler: handler as Handler,
    middlewares: middlewares ?? [],
    pathOptions: pathOptions ?? {},
    attributes: {},
    _route: 'Route',
  };
};

export const createDeleteRoute = <A extends Attributes = Attributes>(args: RouteWithGivenMethodArgument<A>): Route => {
  return createRoute({ ...args, method: 'DELETE' });
};

export const createGetRoute = <A extends Attributes = Attributes>(args: RouteWithGivenMethodArgument<A>): Route => {
  return createRoute({ ...args, method: 'GET' });
};

export const createHeadRoute = <A extends Attributes = Attributes>(args: RouteWithGivenMethodArgument<A>): Route => {
  return createRoute({ ...args, method: 'HEAD' });
};

export const createOptionsRoute = <A extends Attributes = Attributes>(args: RouteWithGivenMethodArgument<A>): Route => {
  return createRoute({ ...args, method: 'OPTIONS' });
};

export const createPatchRoute = <A extends Attributes = Attributes>(args: RouteWithGivenMethodArgument<A>): Route => {
  return createRoute({ ...args, method: 'PATCH' });
};

export const createPostRoute = <A extends Attributes = Attributes>(args: RouteWithGivenMethodArgument<A>): Route => {
  return createRoute({ ...args, method: 'POST' });
};

export const createPutRoute = <A extends Attributes = Attributes>(args: RouteWithGivenMethodArgument<A>): Route => {
  return createRoute({ ...args, method: 'PUT' });
};
