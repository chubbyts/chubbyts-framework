import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/message';
import { pipe } from '@chubbyts/chubbyts-http-types/pipe';
import { createRouteMatcherMiddleware } from '../middleware/route-matcher-middleware.js';
import { isRoute } from '../router/route.js';

export const createRouteHandler = (): Handler => {
  return (serverRequest: ServerRequest): Promise<Response> => {
    const route = serverRequest.attributes.route;

    if (isRoute(route)) {
      return pipe(route.middlewares)(serverRequest, route.handler);
    }

    throw new Error(
      `Request attribute "route" missing or wrong type "${typeof route}", please add the "${
        createRouteMatcherMiddleware.name
      }" middleware.`,
    );
  };
};
