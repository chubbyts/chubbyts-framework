import { createMiddlewareDispatcher, MiddlewareDispatcher } from './middleware/middleware-dispatcher';
import { createRouteHandler } from './handler/route-handler';
import type { Response, ServerRequest } from './vendor/chubbyts-types/message';
import type { Handler } from './vendor/chubbyts-types/handler';
import type { Middleware } from './vendor/chubbyts-types/middleware';

export const createApplication = (
  middlewares: Array<Middleware>,
  middlewareDispatcher: MiddlewareDispatcher = createMiddlewareDispatcher(),
  handler: Handler = createRouteHandler(middlewareDispatcher),
) => {
  return (request: ServerRequest): Promise<Response> => middlewareDispatcher(middlewares, handler, request);
};
