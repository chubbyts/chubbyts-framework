import type { Handler } from '@chubbyts/chubbyts-http-types/handler';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/message';
import type { Middleware } from '@chubbyts/chubbyts-http-types/middleware';
import { pipe } from '@chubbyts/chubbyts-http-types/pipe';
import { createRouteHandler } from './handler/route-handler.js';

export const createApplication = (middlewares: Array<Middleware>, handler: Handler = createRouteHandler()): Handler => {
  return (serverRequest: ServerRequest): Promise<Response> => pipe(middlewares)(serverRequest, handler);
};
