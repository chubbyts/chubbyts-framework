import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/message';

export const createLazyHandler = (container: Container, id: string): Handler => {
  return async (serverRequest: ServerRequest): Promise<Response> =>
    (await container.get<Promise<Handler>>(id))(serverRequest);
};
