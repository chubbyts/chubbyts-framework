import type { MiddlewareDispatcher } from '../middleware/middleware-dispatcher';
import { isRoute } from '../router/route';
import type { Response, ServerRequest } from '../vendor/chubbyts-types/message';
import { Handler } from '../vendor/chubbyts-types/handler';

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
