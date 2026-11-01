import type { Handler, Middleware, Response, ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import { pipe } from '@chubbyts/chubbyts-undici-server/dist/server';
import { createRouteHandler } from './handler/route-handler.js';

export const createApplication = (middlewares: Array<Middleware>, handler: Handler = createRouteHandler()): Handler => {
  return (serverRequest: ServerRequest): Promise<Response> => pipe(middlewares)(serverRequest, handler);
};
