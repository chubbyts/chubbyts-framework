import type { Response, ServerRequest } from '../vendor/chubbyts-types/message';
import type { Handler } from '../vendor/chubbyts-types/handler';
import type { Middleware } from '../vendor/chubbyts-types/middleware';

export const createMiddlewareHandler = (middleware: Middleware, handler: Handler): Handler => {
  return async (request: ServerRequest): Promise<Response> => middleware(request, handler);
};
