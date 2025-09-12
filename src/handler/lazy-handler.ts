import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import type { Handler, Response, ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';

/**
 * ```ts
 * import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
 * import { createContainer } from '@chubbyts/chubbyts-dic/dist/container';
 * import type { Handler } from '@chubbyts/chubbyts-undici-server/dist/server';
 * import type { Logger } from 'some-logger/dist/logger';
 * import { createLazyHandler } from '@chubbyts/chubbyts-framework/dist/handler/lazy-handler';
 *
 * const container: Container = createContainer();
 *
 * container.set('handlerServiceId', (container: Container): Handler => {
 *   return createMyHandler(container.get<Logger>('logger'));
 * });
 *
 * const handler: Handler = createLazyHandler(container, 'handlerServiceId');
 * ```
 */
export const createLazyHandler = (container: Container, id: string): Handler => {
  return async (serverRequest: ServerRequest): Promise<Response> =>
    (await container.get<Promise<Handler>>(id))(serverRequest);
};
