import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { createMiddlewareHandler } from '../handler/middleware-handler';

export type MiddlewareDispatcher = (
  middlewares: Array<Middleware>,
  handler: Handler,
  request: ServerRequest,
) => Promise<Response>;

export const createMiddlewareDispatcher = (): MiddlewareDispatcher => {
  return (middlewares: Array<Middleware>, handler: Handler, request: ServerRequest): Promise<Response> => {
    return middlewares.reduceRight(
      (middlewareHandler: Handler, middleware) => createMiddlewareHandler(middleware, middlewareHandler),
      handler,
    )(request);
  };
};
