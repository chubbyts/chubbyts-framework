import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';

/**
 * ```ts
 * import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
 * import { createContainer } from '@chubbyts/chubbyts-dic/dist/container';
 * import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
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
  return async (request: ServerRequest): Promise<Response> => (await container.get<Promise<Handler>>(id))(request);
};
