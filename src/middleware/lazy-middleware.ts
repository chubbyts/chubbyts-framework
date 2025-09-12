import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import type { Handler, Middleware, Response, ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';

/**
 * ```ts
 * import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
 * import { createContainer } from '@chubbyts/chubbyts-dic/dist/container';
 * import type { Middleware } from '@chubbyts/chubbyts-undici-server/dist/server';
 * import type { Logger } from 'some-logger/dist/logger';
 * import { createLazyMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/lazy-middleware';
 *
 * const container: Container = createContainer();
 *
 * container.set('middlewareServiceId', (container: Container): Middleware => {
 *   return createMyMiddleware(container.get<Logger>('logger'));
 * });
 *
 * const middleware: Middleware = createLazyMiddleware(container, 'middlewareServiceId');
 * ```
 */
export const createLazyMiddleware = (container: Container, id: string): Middleware => {
  return async (serverRequest: ServerRequest, handler: Handler): Promise<Response> =>
    (await container.get<Promise<Middleware>>(id))(serverRequest, handler);
};
