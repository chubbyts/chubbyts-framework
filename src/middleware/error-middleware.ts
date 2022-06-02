import type { ResponseFactory } from '@chubbyts/chubbyts-http-types/dist/message-factory';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { createLogger, Logger } from '@chubbyts/chubbyts-log-types/dist/log';
import { throwableToError } from '../throwable-to-error';
import { HttpError, isHttpError } from '@chubbyts/chubbyts-http-error/dist/http-error';

const htmlTemplate: string = `<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <title>__TITLE__</title>
        <style>
            html {
                font-family: Helvetica, Arial, Verdana, sans-serif;
                line-height: 1.5;
                tab-size: 4;
            }

            body {
                margin: 0;
            }

            * {
                border-width: 0;
                border-style: solid;
            }

            .container {
                width: 100%
            }

            @media (min-width:640px) {
                .container {
                    max-width: 640px
                }
            }

            @media (min-width:768px) {
                .container {
                    max-width: 768px
                }
            }

            @media (min-width:1024px) {
                .container {
                    max-width: 1024px
                }
            }

            @media (min-width:1280px) {
                .container {
                    max-width: 1280px
                }
            }

            @media (min-width:1536px) {
                .container {
                    max-width: 1536px
                }
            }

            .mx-auto {
                margin-left: auto;
                margin-right: auto;
            }

            .inline-block {
                display: inline-block;
            }

            .align-top {
                vertical-align: top;
            }

            .mt-3 {
                margin-top: .75rem;
            }

            .mt-12 {
                margin-top: 3rem;
            }

            .mr-5 {
                margin-right: 1.25rem;
            }

            .pr-5 {
                padding-right: 1.25rem;
            }

            .text-gray-400 {
                --tw-text-opacity: 1;
                color: rgba(156, 163, 175, var(--tw-text-opacity));
            }

            .text-5xl {
                font-size: 3rem;
                line-height: 1;
            }

            .tracking-tighter {
                letter-spacing: -.05em;
            }

            .border-gray-400 {
                --tw-border-opacity: 1;
                border-color: rgba(156, 163, 175, var(--tw-border-opacity));
            }

            .border-r-2 {
                border-right-width: 2px;
            }
        </style>
    </head>
    <body>
        <div class="container mx-auto tracking-tighter mt-12">
            <div class="inline-block align-top text-gray-400 border-r-2 border-gray-400 pr-5 mr-5 text-5xl">__STATUS__</div>
            <div class="inline-block align-top">
                <div class="text-5xl">__TITLE__</div>
                <div class="mt-3">__BODY__</div>
            </div>
        </div>
    </body>
</html>`;

const handleHttpError = (createResponse: ResponseFactory, logger: Logger, httpError: HttpError): Response => {
  logger.info('Http Error', { httpError });

  const response = createResponse(httpError.status);
  response.body.end(
    htmlTemplate
      .replace(/__STATUS__/g, httpError.status.toString())
      .replace(/__TITLE__/g, httpError.title)
      .replace(/__BODY__/g, httpError.detail ?? ''),
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
