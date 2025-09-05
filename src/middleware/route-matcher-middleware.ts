import { ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { Handler, Middleware, Response } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { Match } from '../router/route-matcher.js';

/**
 * ```ts
 * import type { Middleware } from '@chubbyts/chubbyts-undici-server/dist/server';
 * import type { Match } from '@chubbyts/chubbyts-framework/dist/router/route-matcher';
 * import { createRouteMatcherMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/route-matcher-middleware';
 *
 * const match: Match = ...;
 *
 * const routeMatcherMiddleware: Middleware = createRouteMatcherMiddleware(match);
 * ```
 */
export const createRouteMatcherMiddleware = (match: Match): Middleware => {
  return async (serverRequest: ServerRequest, handler: Handler): Promise<Response> => {
    const route = match(serverRequest);

    return handler(
      new ServerRequest(serverRequest, { attributes: { ...serverRequest.attributes, route, ...route.attributes } }),
    );
  };
};
