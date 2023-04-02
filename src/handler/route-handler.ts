import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { MiddlewareDispatcher } from '../middleware/middleware-dispatcher';
import { isRoute } from '../router/route';

export const createRouteHandler = (middlewareDispatcher: MiddlewareDispatcher): Handler => {
  return (request: ServerRequest): Promise<Response> => {
    const route = request.attributes.route;

    if (isRoute(route)) {
      return middlewareDispatcher(route.middlewares, route.handler, request);
    }

    throw new Error(
      `Request attribute "route" missing or wrong type "${typeof route}", please add the "${
        createRouteHandler.name
      }" middleware.`,
    );
  };
};
