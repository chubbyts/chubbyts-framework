import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import type { Handler, Middleware, Response, ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';

export const createLazyMiddleware = (container: Container, id: string): Middleware => {
  return async (serverRequest: ServerRequest, handler: Handler): Promise<Response> =>
    (await container.get<Promise<Middleware>>(id))(serverRequest, handler);
};
