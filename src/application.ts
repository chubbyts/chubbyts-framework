import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { createMiddlewareDispatcher } from './middleware/middleware-dispatcher';
import type { MiddlewareDispatcher } from './middleware/middleware-dispatcher';
import { createRouteHandler } from './handler/route-handler';

/**
 * 
 * Creates an application that can be further customized to build a simple web application.
 * The `createApplication` function is a top-level function exported by the chubbyts Framework.
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
 */
export const createApplication = (
  middlewares: Array<Middleware>,
  middlewareDispatcher: MiddlewareDispatcher = createMiddlewareDispatcher(),
  handler: Handler = createRouteHandler(middlewareDispatcher),
): Handler => {
  return (request: ServerRequest): Promise<Response> => middlewareDispatcher(middlewares, handler, request);
};
