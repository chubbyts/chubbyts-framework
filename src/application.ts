import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { createMiddlewareDispatcher } from './middleware/middleware-dispatcher';
import type { MiddlewareDispatcher } from './middleware/middleware-dispatcher';
import { createRouteHandler } from './handler/route-handler';

/**
 * 
 * Create a web application framework similar to other popular frameworks using ChubbyTS Framework.
 *  
 * @param {Array<Middleware>} middlewares - An array of middleware functions to be applied in order.
 * @param {MiddlewareDispatcher} [middlewareDispatcher] - A custom middleware dispatcher (optional).
 * @param {Handler} [handler] - A custom route handler (optional).
 * @returns {Handler} A function that handles incoming HTTP requests.
 * 
 * @example
 * ```ts
 * import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
 * import { createErrorMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/error-middleware';
 * import { createRouteMatcherMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/route-matcher-middleware';
 * import { createApplication } from '@chubbyts/chubbyts-framework/dist/application';
 *
 * const errorMiddleware: Middleware = createErrorMiddleware(...);
 * const errorMiddleware: Middleware = createRouteMatcherMiddleware(...);
 *
 * const application = createApplication([ errorMiddleware, routeMatcherMiddleware ]);
 * ```
 * 
 * Creates an application that can be further customized to build a simple web application.
 * The `createApplication` function is a top-level function exported by the ChubbyTS Framework.
 */
export const createApplication = (
  middlewares: Array<Middleware>,
  middlewareDispatcher: MiddlewareDispatcher = createMiddlewareDispatcher(),
  handler: Handler = createRouteHandler(middlewareDispatcher),
): Handler => {
  return (request: ServerRequest): Promise<Response> => middlewareDispatcher(middlewares, handler, request);
};
