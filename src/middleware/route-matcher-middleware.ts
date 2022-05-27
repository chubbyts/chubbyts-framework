import { htmlTemplate, HttpError, isHttpError } from '../http-error';
import { Match } from '../router/route-matcher';
import { ResponseFactory } from '@chubbyts/chubbyts-http-types/dist/message-factory';
import { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { createLogger, Logger } from '@chubbyts/chubbyts-log-types/dist/log';

const routeErrorResponse = (createResponse: ResponseFactory, log: Logger, httpError: HttpError): Response => {
  log.info('Route error', {
    name: httpError.name,
    message: httpError.message,
    code: httpError.code,
  });

  const response = createResponse(httpError.code);
  response.body.end(
    htmlTemplate
      .replace(/__STATUS__/g, httpError.code.toString())
      .replace(/__TITLE__/g, httpError.name)
      .replace(/__BODY__/g, httpError.message),
  );

  return { ...response, headers: { ...response.headers, 'content-type': ['text/html'] } };
};

export const createRouteMatcherMiddleware = (
  match: Match,
  createResponse: ResponseFactory,
  logger: Logger = createLogger(),
): Middleware => {
  return async (request: ServerRequest, handler: Handler): Promise<Response> => {
    let route: Route;

    try {
      route = match(request);
    } catch (error) {
      if (isHttpError(error)) {
        return routeErrorResponse(createResponse, logger, error);
      }

      throw error;
    }

    return handler({ ...request, attributes: { ...request.attributes, route, ...route.attributes } });
  };
};
