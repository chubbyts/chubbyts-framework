import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Attributes, Response, ServerRequest } from '@chubbyts/chubbyts-http-types/message';
import type { Middleware } from '@chubbyts/chubbyts-http-types/middleware';
import type { Route } from '../router/route.js';
import type { Match } from '../router/route-matcher.js';

export type RouteMatcherAttributes = Attributes & { route: Route };

export const createRouteMatcherMiddleware = (match: Match): Middleware<Attributes, RouteMatcherAttributes> => {
  return async (serverRequest: ServerRequest, handler: Handler<RouteMatcherAttributes>): Promise<Response> => {
    const route = match(serverRequest);

    // route last: a path attribute named "route" must not replace the matched route
    return handler({ ...serverRequest, attributes: { ...serverRequest.attributes, ...route.attributes, route } });
  };
};
