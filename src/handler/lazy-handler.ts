import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';

export const createLazyHandler = (container: Container, id: string): Handler => {
  return async (request: ServerRequest): Promise<Response> => (await container.get<Promise<Handler>>(id))(request);
};
