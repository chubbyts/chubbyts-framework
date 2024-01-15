import type { ResponseFactory } from '@chubbyts/chubbyts-http-types/dist/message-factory';
import type { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import type { Logger } from '@chubbyts/chubbyts-log-types/dist/log';
import { createLogger, LogLevel } from '@chubbyts/chubbyts-log-types/dist/log';
import { throwableToError } from '@chubbyts/chubbyts-throwable-to-error/dist/throwable-to-error';
import type { HttpError, MapToHttpError } from '@chubbyts/chubbyts-http-error/dist/http-error';
import { isHttpError, mapToHttpError as defaultMapToHttpError } from '@chubbyts/chubbyts-http-error/dist/http-error';

const htmlTemplate = `<!DOCTYPE html>
<html>
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

            .mx-auto {
                margin-left: auto;
                margin-right: auto;
            }

            .mt-12 {
                margin-top: 3rem;
            }

            .mb-12 {
                margin-bottom: 3rem;
            }

            .text-gray-400 {
                --tw-text-opacity: 1;
                color: rgba(156, 163, 175, var(--tw-text-opacity));
            }

            .text-5xl {
                font-size: 3rem;
                line-height: 1;
            }

            .text-right {
                text-align: right;
            }

            .tracking-tighter {
                letter-spacing: -.05em;
            }

            .flex {
                display: flex;
            }

            .flex-row {
                flex-direction: row;
            }

            .basis-2\\/12 {
                flex-basis: 16.666667%;
            }

            .basis-10\\/12 {
                flex-basis: 83.333333%;
            }

            .space-x-8>:not([hidden])~:not([hidden]) {
                --tw-space-x-reverse: 0;
                margin-right: calc(2rem * var(--tw-space-x-reverse));
                margin-left: calc(2rem * calc(1 - var(--tw-space-x-reverse)))
            }

            .gap-x-4 {
                column-gap: 1rem;
            }

            .gap-y-1\\.5 {
                row-gap: 0.375rem;
            }

            .grid-cols-1 {
                grid-template-columns: repeat(1, minmax(0, 1fr));
            }

            .grid {
                display: grid;
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

                .md\\:grid-cols-8 {
                    grid-template-columns: repeat(8, minmax(0, 1fr));
                }

                .md\\:col-span-7 {
                    grid-column: span 7/span 7
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
        </style>
    </head>
    <body>
        <div class="container mx-auto tracking-tighter mt-12">
            <div class="flex flex-row space-x-8">
                <div class="basis-1/12 text-5xl text-gray-400 text-right">__STATUS__</div>
                <div class="basis-11/12">
                    <span class="text-5xl">__TITLE__</span>__BODY__
                </div>
            </div>
        </div>
    </body>
</html>`;

const errorToData = (error: Error): Error => {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
};

const errorToDataArray = (e: unknown): Array<Error> => {
  const errors: Array<Error> = [];

  do {
    // eslint-disable-next-line functional/immutable-data
    errors.push(errorToData(throwableToError(e)));
    // eslint-disable-next-line no-param-reassign
  } while ((e = e && (e as { cause: unknown }).cause));

  return errors;
};

const addDebugToBody = (errors: Array<Error>): string => {
  return `<div class="mt-12">
    ${errors
      .map(
        (error) => `<div class="mb-12 grid grid-cols-1 md:grid-cols-8 gap-4">
        ${Object.entries(error)
          .map(
            ([key, value]) =>
              `<div><strong>${key}</strong></div><div class="md:col-span-7">${
                typeof value === 'string' ? value.replace(/\n/g, '<br>\n') : value
              }</div>`,
          )
          .join('')}
            </div>`,
      )
      .join('\n')}
    </div>`;
};

const handleHttpError = (
  createResponse: ResponseFactory,
  logger: Logger,
  httpError: HttpError,
  debug: boolean,
): Response => {
  const { status, title, detail, instance } = httpError;

  const errors = errorToDataArray(httpError);

  const isClientError = status < 500;

  logger[isClientError ? LogLevel.INFO : LogLevel.ERROR]('Http Error', { data: { ...httpError }, errors });

  const response = createResponse(status);
  response.body.end(
    htmlTemplate
      .replace(/__STATUS__/g, status.toString())
      .replace(/__TITLE__/g, title)
      .replace(
        /__BODY__/g,
        [
          ...(detail ? [`<p>${detail}</p>`] : []),
          ...(instance ? [`<p>${instance}</p>`] : []),
          ...(debug ? [addDebugToBody(errors)] : []),
        ].join(''),
      ),
  );

  return { ...response, headers: { ...response.headers, 'content-type': ['text/html'] } };
};

const createHttpErrorFromError = (e: unknown, mapToHttpError: MapToHttpError): HttpError => {
  try {
    return mapToHttpError(e);
  } catch {
    return defaultMapToHttpError(e);
  }
};

/**
 * ```ts
 * import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
 * import type { ResponseFactory } from '@chubbyts/chubbyts-http-types/dist/message-factory';
 * import { createErrorMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/error-middleware';
 *
 * const responseFactory: ResponseFactory = ...;
 *
 * const errorMiddleware: Middleware = createErrorMiddleware(responseFactory);
 * ```
 */
export const createErrorMiddleware = (
  responseFactory: ResponseFactory,
  debug = false,
  logger: Logger = createLogger(),
  mapToHttpError: MapToHttpError = defaultMapToHttpError,
): Middleware => {
  return async (request: ServerRequest, handler: Handler) => {
    try {
      return await handler(request);
    } catch (e) {
      const httpError = isHttpError(e) ? e : createHttpErrorFromError(e, mapToHttpError);

      return handleHttpError(responseFactory, logger, httpError, debug);
    }
  };
};
