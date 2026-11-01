import { ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { Handler, Middleware, Response } from '@chubbyts/chubbyts-undici-server/dist/server';
import type { Match } from '../router/route-matcher.js';

export const createRouteMatcherMiddleware = (match: Match): Middleware => {
  return async (serverRequest: ServerRequest, handler: Handler): Promise<Response> => {
    const route = match(serverRequest);

    return handler(
      new ServerRequest(serverRequest, { attributes: { ...serverRequest.attributes, route, ...route.attributes } }),
    );
  };
};
