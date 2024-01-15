import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';

/**
 * ```ts
 * import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
 * import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
 * import { createMiddlewareHandler } from '@chubbyts/chubbyts-framework/dist/handler/middleware-handler';
 *
 * const middleware: Middleware = ...;
 * const handler: Handler = ...;
 *
 * const middlewareHandler: Handler = createMiddlewareHandler(middleware, handler);
 * ```
 */
export const createMiddlewareHandler = (middleware: Middleware, handler: Handler): Handler => {
  return async (request: ServerRequest): Promise<Response> => middleware(request, handler);
};
