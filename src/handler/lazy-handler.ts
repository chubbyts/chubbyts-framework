import type { Container } from '../vendor/chubbyts-types/container';
import type { Response, ServerRequest } from '../vendor/chubbyts-types/message';
import type { Handler } from '../vendor/chubbyts-types/handler';

export const createLazyHandler = (container: Container, id: string): Handler => {
  return async (request: ServerRequest): Promise<Response> => (await container.get<Promise<Handler>>(id))(request);
};
