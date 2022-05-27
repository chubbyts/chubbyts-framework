import { htmlTemplate, HttpError, isHttpError } from '../http-error';
import type { ResponseFactory } from '@chubbyts/chubbyts-http-types/dist/message-factory';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { createLogger, Logger } from '@chubbyts/chubbyts-log-types/dist/log';
import { throwableToError } from '../throwable-to-error';

const handleHttpError = (createResponse: ResponseFactory, logger: Logger, httpError: HttpError): Response => {
  logger.info('Http Error', { httpError });

  const response = createResponse(httpError.code);
  response.body.end(
    htmlTemplate
      .replace(/__STATUS__/g, httpError.code.toString())
      .replace(/__TITLE__/g, httpError.name)
      .replace(/__BODY__/g, httpError.message),
  );

  return { ...response, headers: { ...response.headers, 'content-type': ['text/html'] } };
};

const addDebugToBody = (e: unknown): string => {
  const errors: Array<Error> = [];

  do {
    errors.push(throwableToError(e));
  } while ((e = e && (e as { cause: unknown }).cause));

  return errors
    .map((error) => {
      if (!error.stack) {
        return `<div class="mt-3">${error.name}: ${error.message}</div>`;
      }

      return `<div class="mt-3">${error.stack.replace(/at /gm, '<br>&nbsp;&nbsp;&nbsp;&nbsp;at ')}</div>`;
    })
    .join('');
};

const handleError = (responseFactory: ResponseFactory, logger: Logger, error: unknown, debug: boolean): Response => {
  logger.error('Error', { error });

  const response = responseFactory(500);
  response.body.end(
    htmlTemplate
      .replace(/__STATUS__/g, '500')
      .replace(/__TITLE__/g, 'Internal Server Error')
      .replace(
        /__BODY__/g,
        `The requested page failed to load, please try again later.${debug ? addDebugToBody(error) : ''}`,
      ),
  );

  return { ...response, headers: { ...response.headers, 'content-type': ['text/html'] } };
};

export const createErrorMiddleware = (
  responseFactory: ResponseFactory,
  debug: boolean = false,
  logger: Logger = createLogger(),
): Middleware => {
  return async (request: ServerRequest, handler: Handler) => {
    try {
      return await handler(request);
    } catch (e) {
      if (isHttpError(e)) {
        return handleHttpError(responseFactory, logger, e);
      }

      return handleError(responseFactory, logger, e, debug);
    }
  };
};
