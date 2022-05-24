import { htmlTemplate } from '../http-error';
import type { ResponseFactory } from '../vendor/chubbyts-types/message-factory';
import type { Response, ServerRequest } from '../vendor/chubbyts-types/message';
import type { Handler } from '../vendor/chubbyts-types/handler';
import { Middleware } from '../vendor/chubbyts-types/middleware';
import { createLogger, Logger } from '../vendor/chubbyts-types/log';
import { throwableToError } from '../throwable-to-error';

const addDebugToBody = (e: unknown): string => {
  const errors: Array<Error> = [];

  do {
    errors.push(throwableToError(e));
  } while ((e = e && (e as { previous: unknown }).previous));

  return errors
    .map((error) => {
      if (!error.stack) {
        return `<div class="mt-3">${error.name}: ${error.message}</div>`;
      }

      return `<div class="mt-3">${error.stack.replace(/at /gm, '<br>&nbsp;&nbsp;&nbsp;&nbsp;at ')}</div>`;
    })
    .join('');
};

const handleError = (responseFactory: ResponseFactory, debug: boolean, logger: Logger, error: unknown): Response => {
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
    } catch (error) {
      return handleError(responseFactory, debug, logger, error);
    }
  };
};
