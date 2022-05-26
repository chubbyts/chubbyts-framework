import { createMiddlewareDispatcher, MiddlewareDispatcher } from './middleware/middleware-dispatcher';
import { createRouteHandler } from './handler/route-handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';

export const createApplication = (
  middlewares: Array<Middleware>,
  middlewareDispatcher: MiddlewareDispatcher = createMiddlewareDispatcher(),
  handler: Handler = createRouteHandler(middlewareDispatcher),
): Handler => {
  return (request: ServerRequest): Promise<Response> => middlewareDispatcher(middlewares, handler, request);
};
