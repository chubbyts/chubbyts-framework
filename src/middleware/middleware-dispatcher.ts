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
