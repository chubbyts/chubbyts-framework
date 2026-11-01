import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import type { Handler, Response, ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';

export const createLazyHandler = (container: Container, id: string): Handler => {
  return async (serverRequest: ServerRequest): Promise<Response> =>
    (await container.get<Promise<Handler>>(id))(serverRequest);
};
