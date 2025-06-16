import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { createMiddlewareHandler } from '../handler/middleware-handler.js';

export type MiddlewareDispatcher = (
  middlewares: Array<Middleware>,
  handler: Handler,
  request: ServerRequest,
) => Promise<Response>;

/**
 * ```ts
 * import type { MiddlewareDispatcher } from '@chubbyts/chubbyts-framework/dist/middleware/middleware-dispatcher';
 * import { createMiddlewareDispatcher } from '@chubbyts/chubbyts-framework/dist/middleware/middleware-dispatcher';
 *
 * const middlewareDispatcher: MiddlewareDispatcher = createMiddlewareDispatcher();
 * ```
 */
export const createMiddlewareDispatcher = (): MiddlewareDispatcher => {
  return (middlewares: Array<Middleware>, handler: Handler, request: ServerRequest): Promise<Response> => {
    return middlewares.reduceRight(
      (middlewareHandler: Handler, middleware) => createMiddlewareHandler(middleware, middlewareHandler),
      handler,
    )(request);
  };
};
