import type { Response, ServerRequest } from '../vendor/chubbyts-types/message';
import type { Handler } from '../vendor/chubbyts-types/handler';
import type { Middleware } from '../vendor/chubbyts-types/middleware';
import { createMiddlewareHandler } from '../handler/middleware-handler';

export type MiddlewareDispatcher = (
  middlewares: Array<Middleware>,
  handler: Handler,
  request: ServerRequest,
) => Promise<Response>;

export const createMiddlewareDispatcher = (): MiddlewareDispatcher => {
  return (middlewares: Array<Middleware>, handler: Handler, request: ServerRequest): Promise<Response> => {
    if (0 === middlewares.length) {
      return handler(request);
    }

    const middlewaresToDispatch = [...middlewares];

    middlewaresToDispatch.reverse();

    const firstMiddleware = middlewaresToDispatch.pop() as Middleware;

    middlewaresToDispatch.forEach((middleware: Middleware) => {
      handler = createMiddlewareHandler(middleware, handler);
    });

    return firstMiddleware(request, handler);
  };
};
