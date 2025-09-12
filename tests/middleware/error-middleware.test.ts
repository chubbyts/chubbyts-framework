import { describe, expect, test } from 'vitest';
import type { Logger } from '@chubbyts/chubbyts-log-types/dist/log';
import type { HttpError } from '@chubbyts/chubbyts-http-error/dist/http-error';
import {
  createBadRequest,
  createInternalServerError,
  createNotFound,
} from '@chubbyts/chubbyts-http-error/dist/http-error';
import { useObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { Handler } from '@chubbyts/chubbyts-undici-server/dist/server';
import { ServerRequest, Response } from '@chubbyts/chubbyts-undici-server/dist/server';
import { createErrorMiddleware } from '../../src/middleware/error-middleware';

const replaceHtmlStack = (data: string) => data.replace(/\n {4}at .*/g, '');
const replaceJsonStack = (data: string) => data.replace(/\\n {4}at .*/g, '');

describe('error-middleware', () => {
  describe('createErrorMiddleware', () => {
    test('successful', async () => {
      const request = new ServerRequest('https://example.com');
      const response = new Response();

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        { parameters: [request], return: Promise.resolve(response) },
      ]);

      const errorMiddleware = createErrorMiddleware();

      expect(await errorMiddleware(request, handler)).toBe(response);

      expect(handlerMocks.length).toBe(0);
    });

    test('error, without debug and without log', async () => {
      const error = new Error('error');

      const request = new ServerRequest('https://example.com');

      const [handler, handlerMocks] = useFunctionMock<Handler>([{ parameters: [request], error }]);

      const errorMiddleware = createErrorMiddleware();

      const response = await errorMiddleware(request, handler);

      expect(response.status).toBe(500);
      expect(response.statusText).toBe('Internal Server Error');
      expect([...response.headers.entries()]).toMatchInlineSnapshot(`
        [
          [
            "content-type",
            "text/html",
          ],
        ]
      `);

      expect(await response.text()).toMatchInlineSnapshot(`
        "<!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <title>Internal Server Error</title>
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
                        <div class="basis-1/12 text-5xl text-gray-400 text-right">500</div>
                        <div class="basis-11/12">
                            <span class="text-5xl">Internal Server Error</span><p>A website error has occurred. Sorry for the temporary inconvenience.</p>
                        </div>
                    </div>
                </div>
            </body>
        </html>"
      `);

      expect(handlerMocks.length).toBe(0);
    });

    test('error, with debug and with log', async () => {
      const error = new Error('error');
      // eslint-disable-next-line functional/immutable-data
      error.stack = 'Error: error\nat Line1\nat Line2';

      const causeError = new Error('cause');
      // eslint-disable-next-line functional/immutable-data
      causeError.stack = 'Error: cause\nat Line1\nat Line2\nat Line3';

      // eslint-disable-next-line functional/immutable-data
      (error as Error & { cause: Error }).cause = causeError;

      const request = new ServerRequest('https://example.com');

      const [handler, handlerMocks] = useFunctionMock<Handler>([{ parameters: [request], error }]);

      const [logger, loggerMocks] = useObjectMock<Logger>([
        {
          name: 'error',
          callback: (message: string, context: Record<string, unknown>) => {
            expect(message).toBe('Http Error');
            expect(replaceJsonStack(JSON.stringify(context, null, 2))).toMatchInlineSnapshot(`
  "{
    "data": {
      "type": "https://datatracker.ietf.org/doc/html/rfc2616#section-10.5.1",
      "status": 500,
      "title": "Internal Server Error",
      "_httpError": "InternalServerError",
      "detail": "A website error has occurred. Sorry for the temporary inconvenience.",
      "cause": {
        "cause": {}
      }
    },
    "errors": [
      {
        "name": "Error",
        "message": "Internal Server Error",
        "stack": "Error: Internal Server Error
      },
      {
        "name": "Error",
        "message": "error",
        "stack": "Error: error\\nat Line1\\nat Line2"
      },
      {
        "name": "Error",
        "message": "cause",
        "stack": "Error: cause\\nat Line1\\nat Line2\\nat Line3"
      }
    ]
  }"
  `);
          },
        },
      ]);

      const errorMiddleware = createErrorMiddleware(true, logger);

      const response = await errorMiddleware(request, handler);

      expect(response.status).toBe(500);
      expect(response.statusText).toBe('Internal Server Error');
      expect([...response.headers.entries()]).toMatchInlineSnapshot(`
        [
          [
            "content-type",
            "text/html",
          ],
        ]
      `);

      expect(replaceHtmlStack(await response.text())).toMatchInlineSnapshot(`
        "<!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <title>Internal Server Error</title>
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
                        <div class="basis-1/12 text-5xl text-gray-400 text-right">500</div>
                        <div class="basis-11/12">
                            <span class="text-5xl">Internal Server Error</span><p>A website error has occurred. Sorry for the temporary inconvenience.</p><div class="mt-12">
            <div class="mb-12 grid grid-cols-1 md:grid-cols-8 gap-4">
                <div><strong>name</strong></div><div class="md:col-span-7">Error</div><div><strong>message</strong></div><div class="md:col-span-7">Internal Server Error</div><div><strong>stack</strong></div><div class="md:col-span-7">Error: Internal Server Error<br>
                    </div>
        <div class="mb-12 grid grid-cols-1 md:grid-cols-8 gap-4">
                <div><strong>name</strong></div><div class="md:col-span-7">Error</div><div><strong>message</strong></div><div class="md:col-span-7">error</div><div><strong>stack</strong></div><div class="md:col-span-7">Error: error<br>
        at Line1<br>
        at Line2</div>
                    </div>
        <div class="mb-12 grid grid-cols-1 md:grid-cols-8 gap-4">
                <div><strong>name</strong></div><div class="md:col-span-7">Error</div><div><strong>message</strong></div><div class="md:col-span-7">cause</div><div><strong>stack</strong></div><div class="md:col-span-7">Error: cause<br>
        at Line1<br>
        at Line2<br>
        at Line3</div>
                    </div>
            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>"
      `);

      expect(handlerMocks.length).toBe(0);
      expect(loggerMocks.length).toBe(0);
    });

    test('custom mapToHttpError with catch, with debug and with log', async () => {
      const error = new Error('error');
      // eslint-disable-next-line functional/immutable-data
      error.stack = 'Error: error\nat Line1\nat Line2';

      const causeError = new Error('cause');
      // eslint-disable-next-line functional/immutable-data
      causeError.stack = 'Error: cause\nat Line1\nat Line2\nat Line3';

      // eslint-disable-next-line functional/immutable-data
      (error as Error & { cause: Error }).cause = causeError;

      const request = new ServerRequest('https://example.com');

      const [handler, handlerMocks] = useFunctionMock<Handler>([{ parameters: [request], error }]);

      const [logger, loggerMocks] = useObjectMock<Logger>([
        {
          name: 'info',
          callback: (message: string, context: Record<string, unknown>) => {
            expect(message).toBe('Http Error');
            expect(replaceJsonStack(JSON.stringify(context, null, 2))).toMatchInlineSnapshot(`
              "{
                "data": {
                  "type": "https://datatracker.ietf.org/doc/html/rfc2616#section-10.4.5",
                  "status": 404,
                  "title": "Not Found",
                  "_httpError": "NotFound",
                  "cause": {
                    "cause": {}
                  }
                },
                "errors": [
                  {
                    "name": "Error",
                    "message": "Not Found",
                    "stack": "Error: Not Found
                  },
                  {
                    "name": "Error",
                    "message": "error",
                    "stack": "Error: error\\nat Line1\\nat Line2"
                  },
                  {
                    "name": "Error",
                    "message": "cause",
                    "stack": "Error: cause\\nat Line1\\nat Line2\\nat Line3"
                  }
                ]
              }"
            `);
          },
        },
      ]);

      const errorMiddleware = createErrorMiddleware(true, logger, (e: unknown): HttpError => {
        if (e instanceof Error && e.message === 'error') {
          return createNotFound({ cause: e });
        }

        throw e;
      });

      const response = await errorMiddleware(request, handler);

      expect(response.status).toBe(404);
      expect(response.statusText).toBe('Not Found');
      expect([...response.headers.entries()]).toMatchInlineSnapshot(`
        [
          [
            "content-type",
            "text/html",
          ],
        ]
      `);

      expect(replaceHtmlStack(await response.text())).toMatchInlineSnapshot(`
        "<!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <title>Not Found</title>
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
                        <div class="basis-1/12 text-5xl text-gray-400 text-right">404</div>
                        <div class="basis-11/12">
                            <span class="text-5xl">Not Found</span><div class="mt-12">
            <div class="mb-12 grid grid-cols-1 md:grid-cols-8 gap-4">
                <div><strong>name</strong></div><div class="md:col-span-7">Error</div><div><strong>message</strong></div><div class="md:col-span-7">Not Found</div><div><strong>stack</strong></div><div class="md:col-span-7">Error: Not Found<br>
                    </div>
        <div class="mb-12 grid grid-cols-1 md:grid-cols-8 gap-4">
                <div><strong>name</strong></div><div class="md:col-span-7">Error</div><div><strong>message</strong></div><div class="md:col-span-7">error</div><div><strong>stack</strong></div><div class="md:col-span-7">Error: error<br>
        at Line1<br>
        at Line2</div>
                    </div>
        <div class="mb-12 grid grid-cols-1 md:grid-cols-8 gap-4">
                <div><strong>name</strong></div><div class="md:col-span-7">Error</div><div><strong>message</strong></div><div class="md:col-span-7">cause</div><div><strong>stack</strong></div><div class="md:col-span-7">Error: cause<br>
        at Line1<br>
        at Line2<br>
        at Line3</div>
                    </div>
            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>"
      `);

      expect(handlerMocks.length).toBe(0);
      expect(loggerMocks.length).toBe(0);
    });

    test('custom mapToHttpError without catch, with debug and with log', async () => {
      const error = new Error('error');
      // eslint-disable-next-line functional/immutable-data
      error.stack = 'Error: error\nat Line1\nat Line2';

      const causeError = new Error('cause');
      // eslint-disable-next-line functional/immutable-data
      causeError.stack = 'Error: cause\nat Line1\nat Line2\nat Line3';

      // eslint-disable-next-line functional/immutable-data
      (error as Error & { cause: Error }).cause = causeError;

      const request = new ServerRequest('https://example.com');

      const [handler, handlerMocks] = useFunctionMock<Handler>([{ parameters: [request], error }]);

      const [logger, loggerMocks] = useObjectMock<Logger>([
        {
          name: 'error',
          callback: (message: string, context: Record<string, unknown>) => {
            expect(message).toBe('Http Error');
            expect(replaceJsonStack(JSON.stringify(context, null, 2))).toMatchInlineSnapshot(`
              "{
                "data": {
                  "type": "https://datatracker.ietf.org/doc/html/rfc2616#section-10.5.1",
                  "status": 500,
                  "title": "Internal Server Error",
                  "_httpError": "InternalServerError",
                  "detail": "A website error has occurred. Sorry for the temporary inconvenience.",
                  "cause": {
                    "cause": {}
                  }
                },
                "errors": [
                  {
                    "name": "Error",
                    "message": "Internal Server Error",
                    "stack": "Error: Internal Server Error
                  },
                  {
                    "name": "Error",
                    "message": "error",
                    "stack": "Error: error\\nat Line1\\nat Line2"
                  },
                  {
                    "name": "Error",
                    "message": "cause",
                    "stack": "Error: cause\\nat Line1\\nat Line2\\nat Line3"
                  }
                ]
              }"
            `);
          },
        },
      ]);

      const errorMiddleware = createErrorMiddleware(true, logger, (e: unknown): HttpError => {
        throw e;
      });

      const response = await errorMiddleware(request, handler);

      expect(response.status).toBe(500);
      expect(response.statusText).toBe('Internal Server Error');
      expect([...response.headers.entries()]).toMatchInlineSnapshot(`
        [
          [
            "content-type",
            "text/html",
          ],
        ]
      `);

      expect(replaceHtmlStack(await response.text())).toMatchInlineSnapshot(`
        "<!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <title>Internal Server Error</title>
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
                        <div class="basis-1/12 text-5xl text-gray-400 text-right">500</div>
                        <div class="basis-11/12">
                            <span class="text-5xl">Internal Server Error</span><p>A website error has occurred. Sorry for the temporary inconvenience.</p><div class="mt-12">
            <div class="mb-12 grid grid-cols-1 md:grid-cols-8 gap-4">
                <div><strong>name</strong></div><div class="md:col-span-7">Error</div><div><strong>message</strong></div><div class="md:col-span-7">Internal Server Error</div><div><strong>stack</strong></div><div class="md:col-span-7">Error: Internal Server Error<br>
                    </div>
        <div class="mb-12 grid grid-cols-1 md:grid-cols-8 gap-4">
                <div><strong>name</strong></div><div class="md:col-span-7">Error</div><div><strong>message</strong></div><div class="md:col-span-7">error</div><div><strong>stack</strong></div><div class="md:col-span-7">Error: error<br>
        at Line1<br>
        at Line2</div>
                    </div>
        <div class="mb-12 grid grid-cols-1 md:grid-cols-8 gap-4">
                <div><strong>name</strong></div><div class="md:col-span-7">Error</div><div><strong>message</strong></div><div class="md:col-span-7">cause</div><div><strong>stack</strong></div><div class="md:col-span-7">Error: cause<br>
        at Line1<br>
        at Line2<br>
        at Line3</div>
                    </div>
            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>"
      `);

      expect(handlerMocks.length).toBe(0);
      expect(loggerMocks.length).toBe(0);
    });

    test('error without stack, with debug and with log', async () => {
      const error = 'error';

      const request = new ServerRequest('https://example.com');

      const [handler, handlerMocks] = useFunctionMock<Handler>([
        { parameters: [request], error: error as unknown as Error },
      ]);

      const [logger, loggerMocks] = useObjectMock<Logger>([
        {
          name: 'error',
          callback: (message: string, context: Record<string, unknown>) => {
            expect(message).toBe('Http Error');
            expect(replaceJsonStack(JSON.stringify(context, null, 2))).toMatchInlineSnapshot(`
              "{
                "data": {
                  "type": "https://datatracker.ietf.org/doc/html/rfc2616#section-10.5.1",
                  "status": 500,
                  "title": "Internal Server Error",
                  "_httpError": "InternalServerError",
                  "detail": "A website error has occurred. Sorry for the temporary inconvenience.",
                  "cause": "error"
                },
                "errors": [
                  {
                    "name": "Error",
                    "message": "Internal Server Error",
                    "stack": "Error: Internal Server Error
                  },
                  {
                    "name": "string",
                    "message": "error"
                  }
                ]
              }"
            `);
          },
        },
      ]);

      const errorMiddleware = createErrorMiddleware(true, logger);

      const response = await errorMiddleware(request, handler);

      expect(response.status).toBe(500);
      expect(response.statusText).toBe('Internal Server Error');
      expect([...response.headers.entries()]).toMatchInlineSnapshot(`
        [
          [
            "content-type",
            "text/html",
          ],
        ]
      `);

      expect(replaceHtmlStack(await response.text())).toMatchInlineSnapshot(`
        "<!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <title>Internal Server Error</title>
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
                        <div class="basis-1/12 text-5xl text-gray-400 text-right">500</div>
                        <div class="basis-11/12">
                            <span class="text-5xl">Internal Server Error</span><p>A website error has occurred. Sorry for the temporary inconvenience.</p><div class="mt-12">
            <div class="mb-12 grid grid-cols-1 md:grid-cols-8 gap-4">
                <div><strong>name</strong></div><div class="md:col-span-7">Error</div><div><strong>message</strong></div><div class="md:col-span-7">Internal Server Error</div><div><strong>stack</strong></div><div class="md:col-span-7">Error: Internal Server Error<br>
                    </div>
        <div class="mb-12 grid grid-cols-1 md:grid-cols-8 gap-4">
                <div><strong>name</strong></div><div class="md:col-span-7">string</div><div><strong>message</strong></div><div class="md:col-span-7">error</div><div><strong>stack</strong></div><div class="md:col-span-7">undefined</div>
                    </div>
            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>"
      `);

      expect(handlerMocks.length).toBe(0);
      expect(loggerMocks.length).toBe(0);
    });

    test('http error: client', async () => {
      const httpError = createBadRequest({
        detail: 'The given data is not valid',
        instance: 'some-instance',
      });

      const request = new ServerRequest('https://example.com');

      const [handler, handlerMocks] = useFunctionMock<Handler>([{ parameters: [request], error: httpError }]);

      const [logger, loggerMocks] = useObjectMock<Logger>([
        {
          name: 'info',
          callback: (message: string, context: Record<string, unknown>) => {
            expect(message).toBe('Http Error');
            expect(replaceJsonStack(JSON.stringify(context, null, 2))).toMatchInlineSnapshot(`
              "{
                "data": {
                  "type": "https://datatracker.ietf.org/doc/html/rfc2616#section-10.4.1",
                  "status": 400,
                  "title": "Bad Request",
                  "_httpError": "BadRequest",
                  "detail": "The given data is not valid",
                  "instance": "some-instance"
                },
                "errors": [
                  {
                    "name": "Error",
                    "message": "Bad Request",
                    "stack": "Error: Bad Request
                  }
                ]
              }"
            `);
          },
        },
      ]);

      const errorMiddleware = createErrorMiddleware(true, logger);

      const response = await errorMiddleware(request, handler);

      expect(response.status).toBe(400);
      expect(response.statusText).toBe('Bad Request');
      expect([...response.headers.entries()]).toMatchInlineSnapshot(`
        [
          [
            "content-type",
            "text/html",
          ],
        ]
      `);

      expect(replaceHtmlStack(await response.text())).toMatchInlineSnapshot(`
        "<!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <title>Bad Request</title>
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
                        <div class="basis-1/12 text-5xl text-gray-400 text-right">400</div>
                        <div class="basis-11/12">
                            <span class="text-5xl">Bad Request</span><p>The given data is not valid</p><p>some-instance</p><div class="mt-12">
            <div class="mb-12 grid grid-cols-1 md:grid-cols-8 gap-4">
                <div><strong>name</strong></div><div class="md:col-span-7">Error</div><div><strong>message</strong></div><div class="md:col-span-7">Bad Request</div><div><strong>stack</strong></div><div class="md:col-span-7">Error: Bad Request<br>
                    </div>
            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>"
      `);

      expect(handlerMocks.length).toBe(0);
      expect(loggerMocks.length).toBe(0);
    });

    test('http error: server', async () => {
      const httpError = createInternalServerError({});

      const request = new ServerRequest('https://example.com');

      const [handler, handlerMocks] = useFunctionMock<Handler>([{ parameters: [request], error: httpError }]);

      const [logger, loggerMocks] = useObjectMock<Logger>([
        {
          name: 'error',
          callback: (message: string, context: Record<string, unknown>) => {
            expect(message).toBe('Http Error');
            expect(replaceJsonStack(JSON.stringify(context, null, 2))).toMatchInlineSnapshot(`
              "{
                "data": {
                  "type": "https://datatracker.ietf.org/doc/html/rfc2616#section-10.5.1",
                  "status": 500,
                  "title": "Internal Server Error",
                  "_httpError": "InternalServerError"
                },
                "errors": [
                  {
                    "name": "Error",
                    "message": "Internal Server Error",
                    "stack": "Error: Internal Server Error
                  }
                ]
              }"
            `);
          },
        },
      ]);

      const errorMiddleware = createErrorMiddleware(true, logger);

      const response = await errorMiddleware(request, handler);

      expect(response.status).toBe(500);
      expect(response.statusText).toBe('Internal Server Error');
      expect([...response.headers.entries()]).toMatchInlineSnapshot(`
        [
          [
            "content-type",
            "text/html",
          ],
        ]
      `);

      expect(replaceHtmlStack(await response.text())).toMatchInlineSnapshot(`
        "<!DOCTYPE html>
        <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <title>Internal Server Error</title>
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
                        <div class="basis-1/12 text-5xl text-gray-400 text-right">500</div>
                        <div class="basis-11/12">
                            <span class="text-5xl">Internal Server Error</span><div class="mt-12">
            <div class="mb-12 grid grid-cols-1 md:grid-cols-8 gap-4">
                <div><strong>name</strong></div><div class="md:col-span-7">Error</div><div><strong>message</strong></div><div class="md:col-span-7">Internal Server Error</div><div><strong>stack</strong></div><div class="md:col-span-7">Error: Internal Server Error<br>
                    </div>
            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>"
      `);

      expect(handlerMocks.length).toBe(0);
      expect(loggerMocks.length).toBe(0);
    });
  });
});
