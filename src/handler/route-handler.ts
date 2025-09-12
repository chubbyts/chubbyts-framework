import { pipe, type Handler, type Response, type ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { Route } from '../router/route.js';
import { isRoute } from '../router/route.js';

/**
 * ```ts
 * import type { Handler } from '@chubbyts/chubbyts-undici-for-server/dist/handler';
 * import { createRouteHandler } from '@chubbyts/chubbyts-framework/dist/handler/route-handler';
 *
 * const routeHandler: Handler = createRouteHandler();
 * ```
 */
export const createRouteHandler = (): Handler => {
  return (request: ServerRequest<{ route: Route }>): Promise<Response> => {
    const route = request.attributes.route;

    if (isRoute(route)) {
      return pipe(route.middlewares)(request, route.handler);
    }

    throw new Error(
      `Request attribute "route" missing or wrong type "${typeof route}", please add the "${
        createRouteHandler.name
      }" middleware.`,
    );
  };
};
