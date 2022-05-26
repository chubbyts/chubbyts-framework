import type { Container } from '@chubbyts/chubbyts-dic-types/dist/container';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';

export const createLazyMiddleware = (container: Container, id: string): Middleware => {
  return async (request: ServerRequest, handler: Handler): Promise<Response> =>
    (await container.get<Promise<Middleware>>(id))(request, handler);
};
