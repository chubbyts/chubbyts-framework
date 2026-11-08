import type { Container } from '@chubbyts/chubbyts-dic-types/container';
import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/message';
import type { Middleware } from '@chubbyts/chubbyts-http-types/middleware';

export const createLazyMiddleware = (container: Container, id: string): Middleware => {
  return async (serverRequest: ServerRequest, handler: Handler): Promise<Response> =>
    (await container.get<Promise<Middleware>>(id))(serverRequest, handler);
};
