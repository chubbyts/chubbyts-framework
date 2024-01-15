import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import type { Match } from '../router/route-matcher';

/**
 * ```ts
 * import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
 * import type { Match } from '@chubbyts/chubbyts-framework/dist/router/route-matcher';
 * import { createRouteMatcherMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/route-matcher-middleware';
 *
 * const match: Match = ...;
 *
 * const routeMatcherMiddleware: Middleware = createRouteMatcherMiddleware(match);
 * ```
 */
export const createRouteMatcherMiddleware = (match: Match): Middleware => {
  return async (request: ServerRequest, handler: Handler): Promise<Response> => {
    const route = match(request);

    return handler({ ...request, attributes: { ...request.attributes, route, ...route.attributes } });
  };
};
