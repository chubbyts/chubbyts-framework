import type { Container } from '../vendor/chubbyts-types/container';
import type { Response, ServerRequest } from '../vendor/chubbyts-types/message';
import type { Handler } from '../vendor/chubbyts-types/handler';
import type { Middleware } from '../vendor/chubbyts-types/middleware';

export const createLazyMiddleware = (container: Container, id: string): Middleware => {
  return async (request: ServerRequest, handler: Handler): Promise<Response> =>
    (await container.get<Promise<Middleware>>(id))(request, handler);
};
