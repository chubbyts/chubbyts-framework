import { Match } from '../router/route-matcher';
import { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';

export const createRouteMatcherMiddleware = (match: Match): Middleware => {
  return async (request: ServerRequest, handler: Handler): Promise<Response> => {
    const route = match(request);

    return handler({ ...request, attributes: { ...request.attributes, route, ...route.attributes } });
  };
};
