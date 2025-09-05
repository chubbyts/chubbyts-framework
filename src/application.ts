import type { Handler, Middleware, Response, ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import { pipe } from '@chubbyts/chubbyts-undici-server/dist/server';
import { createRouteHandler } from './handler/route-handler.js';

/**
 * ```ts
 * import type { Middleware } from '@chubbyts/chubbyts-undici-server/dist/server';
 * import { createErrorMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/error-middleware';
 * import { createRouteMatcherMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/route-matcher-middleware';
 * import { createApplication } from '@chubbyts/chubbyts-framework/dist/application';
 *
 * const errorMiddleware: Middleware = createErrorMiddleware(...);
 * const errorMiddleware: Middleware = createRouteMatcherMiddleware(...);
 *
 * const application = createApplication([ errorMiddleware, routeMatcherMiddleware ]);
 * ```
 */
export const createApplication = (middlewares: Array<Middleware>, handler: Handler = createRouteHandler()): Handler => {
  return (serverRequest: ServerRequest): Promise<Response> => pipe(middlewares)(serverRequest, handler);
};
