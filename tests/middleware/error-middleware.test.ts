import { describe, expect, test } from '@jest/globals';
import { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import { createErrorMiddleware } from '../../src/middleware/error-middleware';
import { ResponseFactory } from '@chubbyts/chubbyts-http-types/dist/message-factory';
import { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { Logger, NamedLogFn } from '@chubbyts/chubbyts-log-types/dist/log';
import { HttpError } from '@chubbyts/chubbyts-http-error/dist/http-error';

describe('createErrorMiddleware', () => {
  test('successful', async () => {
    const request = { ...({} as ServerRequest) };
    const response = { ...({} as Response) };

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      expect(givenRequest).toBe(request);
      return response;
    });

    const responseFactory: ResponseFactory = jest.fn();

    const errorMiddleware = createErrorMiddleware(responseFactory);

    expect(await errorMiddleware(request, handler)).toBe(response);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(responseFactory).toHaveBeenCalledTimes(0);
  });

  test('error, without debug and without log', async () => {
    const error = new Error('error');

    const end = jest.fn((data) => {
      expect(data).toMatchInlineSnapshot(`
        "<html>
            <head>
                <meta http-equiv=\\"Content-Type\\" content=\\"text/html; charset=utf-8\\">
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
                <div class=\\"container mx-auto tracking-tighter mt-12\\">
                    <div class=\\"inline-block align-top text-gray-400 border-r-2 border-gray-400 pr-5 mr-5 text-5xl\\">500</div>
                    <div class=\\"inline-block align-top\\">
                        <div class=\\"text-5xl\\">Internal Server Error</div>
                        <div class=\\"mt-3\\">The requested page failed to load, please try again later.</div>
                    </div>
                </div>
            </body>
        </html>"
      `);
    });

    const request = {} as ServerRequest;
    const response = { body: { end } } as unknown as Response;

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      expect(givenRequest).toBe(request);
      throw error;
    });

    const responseFactory: ResponseFactory = jest.fn((): Response => {
      return response;
    });

    const errorMiddleware = createErrorMiddleware(responseFactory);

    expect(await errorMiddleware(request, handler)).toEqual({
      ...response,
      headers: { 'content-type': ['text/html'] },
    });

    expect(end).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(responseFactory).toHaveBeenCalledTimes(1);
  });

  test('error, with debug and with log', async () => {
    const error = new Error('error');
    error.stack = 'Error: error\nat Line1\nat Line2';

    const causeError = new Error('cause');
    causeError.stack = 'Error: cause\nat Line1\nat Line2\nat Line3';

    // @ts-ignore
    error.cause = causeError;

    const end = jest.fn((data) => {
      expect(data).toMatchInlineSnapshot(`
        "<html>
            <head>
                <meta http-equiv=\\"Content-Type\\" content=\\"text/html; charset=utf-8\\">
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
                <div class=\\"container mx-auto tracking-tighter mt-12\\">
                    <div class=\\"inline-block align-top text-gray-400 border-r-2 border-gray-400 pr-5 mr-5 text-5xl\\">500</div>
                    <div class=\\"inline-block align-top\\">
                        <div class=\\"text-5xl\\">Internal Server Error</div>
                        <div class=\\"mt-3\\">The requested page failed to load, please try again later.<div class=\\"mt-3\\">Error: error
        <br>&nbsp;&nbsp;&nbsp;&nbsp;at Line1
        <br>&nbsp;&nbsp;&nbsp;&nbsp;at Line2</div><div class=\\"mt-3\\">Error: cause
        <br>&nbsp;&nbsp;&nbsp;&nbsp;at Line1
        <br>&nbsp;&nbsp;&nbsp;&nbsp;at Line2
        <br>&nbsp;&nbsp;&nbsp;&nbsp;at Line3</div></div>
                    </div>
                </div>
            </body>
        </html>"
      `);
    });

    const request = {} as ServerRequest;
    const response = { body: { end } } as unknown as Response;

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      expect(givenRequest).toBe(request);
      throw error;
    });

    const responseFactory: ResponseFactory = jest.fn((): Response => {
      return response;
    });

    const logError: NamedLogFn = jest.fn((message: string, context: Record<string, any>) => {
      expect(message).toBe('Error');
      expect(context).toEqual({ error });
    });

    const logger = {
      error: logError,
    } as unknown as Logger;

    const errorMiddleware = createErrorMiddleware(responseFactory, true, logger);

    expect(await errorMiddleware(request, handler)).toEqual({
      ...response,
      headers: { 'content-type': ['text/html'] },
    });

    expect(end).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(responseFactory).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledTimes(1);
  });

  test('error without stack, with debug and with log', async () => {
    const error = 'error';

    const end = jest.fn((data) => {
      expect(data).toMatchInlineSnapshot(`
        "<html>
            <head>
                <meta http-equiv=\\"Content-Type\\" content=\\"text/html; charset=utf-8\\">
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
                <div class=\\"container mx-auto tracking-tighter mt-12\\">
                    <div class=\\"inline-block align-top text-gray-400 border-r-2 border-gray-400 pr-5 mr-5 text-5xl\\">500</div>
                    <div class=\\"inline-block align-top\\">
                        <div class=\\"text-5xl\\">Internal Server Error</div>
                        <div class=\\"mt-3\\">The requested page failed to load, please try again later.<div class=\\"mt-3\\">string: error</div></div>
                    </div>
                </div>
            </body>
        </html>"
      `);
    });

    const request = {} as ServerRequest;
    const response = { body: { end } } as unknown as Response;

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      expect(givenRequest).toBe(request);
      throw error;
    });

    const responseFactory: ResponseFactory = jest.fn((): Response => {
      return response;
    });

    const logError: NamedLogFn = jest.fn((message: string, context: Record<string, any>) => {
      expect(message).toBe('Error');
      expect(context).toEqual({ error });
    });

    const logger = {
      error: logError,
    } as unknown as Logger;

    const errorMiddleware = createErrorMiddleware(responseFactory, true, logger);

    expect(await errorMiddleware(request, handler)).toEqual({
      ...response,
      headers: { 'content-type': ['text/html'] },
    });

    expect(end).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(responseFactory).toHaveBeenCalledTimes(1);
    expect(logError).toHaveBeenCalledTimes(1);
  });

  test('http error: client', async () => {
    const httpError: HttpError = {
      type: 'https://datatracker.ietf.org/doc/html/rfc2616#section-10.4.1',
      status: 400,
      title: 'Bad Request',
      detail: 'The given data is not valid',
      instance: 'some-instance',
      key1: undefined,
      key2: null,
      key3: true,
      key4: false,
      key5: 3,
      key6: 3.3,
      key7: 'value7',
      key8: [undefined, null, true, false, 3, 3.3, 'value7'],
      key9: {
        key1: undefined,
        key2: null,
        key3: true,
        key4: false,
        key5: 3,
        key6: 3.3,
        key7: 'value7',
        key8: [undefined, null, true, false, 3, 3.3, 'value7'],
      },
      _httpError: 'BadRequest',
    };

    const end = jest.fn((data) => {
      expect(data).toMatchInlineSnapshot(`
        "<html>
            <head>
                <meta http-equiv=\\"Content-Type\\" content=\\"text/html; charset=utf-8\\">
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
                <div class=\\"container mx-auto tracking-tighter mt-12\\">
                    <div class=\\"inline-block align-top text-gray-400 border-r-2 border-gray-400 pr-5 mr-5 text-5xl\\">400</div>
                    <div class=\\"inline-block align-top\\">
                        <div class=\\"text-5xl\\">Bad Request</div>
                        <div class=\\"mt-3\\">The given data is not valid<br>some-instance<br><pre>{
            \\"key2\\": null,
            \\"key3\\": true,
            \\"key4\\": false,
            \\"key5\\": 3,
            \\"key6\\": 3.3,
            \\"key7\\": \\"value7\\",
            \\"key8\\": [
                null,
                null,
                true,
                false,
                3,
                3.3,
                \\"value7\\"
            ],
            \\"key9\\": {
                \\"key2\\": null,
                \\"key3\\": true,
                \\"key4\\": false,
                \\"key5\\": 3,
                \\"key6\\": 3.3,
                \\"key7\\": \\"value7\\",
                \\"key8\\": [
                    null,
                    null,
                    true,
                    false,
                    3,
                    3.3,
                    \\"value7\\"
                ]
            }
        }</pre></div>
                    </div>
                </div>
            </body>
        </html>"
      `);
    });

    const request = {} as ServerRequest;
    const response = { body: { end } } as unknown as Response;

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      expect(givenRequest).toBe(request);
      throw httpError;
    });

    const responseFactory: ResponseFactory = jest.fn((): Response => {
      return response;
    });

    const logInfo: NamedLogFn = jest.fn((message: string, context: Record<string, any>) => {
      expect(message).toBe('Http Error');
      expect(context).toEqual({ httpError });
    });

    const logger = {
      info: logInfo,
    } as unknown as Logger;

    const errorMiddleware = createErrorMiddleware(responseFactory, true, logger);

    expect(await errorMiddleware(request, handler)).toEqual({
      ...response,
      headers: { 'content-type': ['text/html'] },
    });

    expect(end).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(responseFactory).toHaveBeenCalledTimes(1);
    expect(logInfo).toHaveBeenCalledTimes(1);
  });

  test('http error: server, debug true', async () => {
    const httpError: HttpError = {
      type: 'https://datatracker.ietf.org/doc/html/rfc2616#section-10.5.1',
      status: 500,
      title: 'Internal Server Error',
      key1: undefined,
      key2: null,
      key3: true,
      key4: false,
      key5: 3,
      key6: 3.3,
      key7: 'value7',
      key8: [undefined, null, true, false, 3, 3.3, 'value7'],
      key9: {
        key1: undefined,
        key2: null,
        key3: true,
        key4: false,
        key5: 3,
        key6: 3.3,
        key7: 'value7',
        key8: [undefined, null, true, false, 3, 3.3, 'value7'],
      },
      _httpError: 'InternalServerError',
    };

    const end = jest.fn((data) => {
      expect(data).toMatchInlineSnapshot(`
        "<html>
            <head>
                <meta http-equiv=\\"Content-Type\\" content=\\"text/html; charset=utf-8\\">
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
                <div class=\\"container mx-auto tracking-tighter mt-12\\">
                    <div class=\\"inline-block align-top text-gray-400 border-r-2 border-gray-400 pr-5 mr-5 text-5xl\\">500</div>
                    <div class=\\"inline-block align-top\\">
                        <div class=\\"text-5xl\\">Internal Server Error</div>
                        <div class=\\"mt-3\\"><pre>{
            \\"key2\\": null,
            \\"key3\\": true,
            \\"key4\\": false,
            \\"key5\\": 3,
            \\"key6\\": 3.3,
            \\"key7\\": \\"value7\\",
            \\"key8\\": [
                null,
                null,
                true,
                false,
                3,
                3.3,
                \\"value7\\"
            ],
            \\"key9\\": {
                \\"key2\\": null,
                \\"key3\\": true,
                \\"key4\\": false,
                \\"key5\\": 3,
                \\"key6\\": 3.3,
                \\"key7\\": \\"value7\\",
                \\"key8\\": [
                    null,
                    null,
                    true,
                    false,
                    3,
                    3.3,
                    \\"value7\\"
                ]
            }
        }</pre></div>
                    </div>
                </div>
            </body>
        </html>"
      `);
    });

    const request = {} as ServerRequest;
    const response = { body: { end } } as unknown as Response;

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      expect(givenRequest).toBe(request);
      throw httpError;
    });

    const responseFactory: ResponseFactory = jest.fn((): Response => {
      return response;
    });

    const logError: NamedLogFn = jest.fn((message: string, context: Record<string, any>) => {
      expect(message).toBe('Http Error');
      expect(context).toEqual({ httpError });
    });

    const logger = {
      error: logError,
    } as unknown as Logger;

    const errorMiddleware = createErrorMiddleware(responseFactory, true, logger);

    expect(await errorMiddleware(request, handler)).toEqual({
      ...response,
      headers: { 'content-type': ['text/html'] },
    });

    expect(end).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(responseFactory).toHaveBeenCalledTimes(1);
  });

  test('http error: server, debug true, no additional data', async () => {
    const httpError: HttpError = {
      type: 'https://datatracker.ietf.org/doc/html/rfc2616#section-10.5.1',
      status: 500,
      title: 'Internal Server Error',
      _httpError: 'InternalServerError',
    };

    const end = jest.fn((data) => {
      expect(data).toMatchInlineSnapshot(`
        "<html>
            <head>
                <meta http-equiv=\\"Content-Type\\" content=\\"text/html; charset=utf-8\\">
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
                <div class=\\"container mx-auto tracking-tighter mt-12\\">
                    <div class=\\"inline-block align-top text-gray-400 border-r-2 border-gray-400 pr-5 mr-5 text-5xl\\">500</div>
                    <div class=\\"inline-block align-top\\">
                        <div class=\\"text-5xl\\">Internal Server Error</div>
                        <div class=\\"mt-3\\"></div>
                    </div>
                </div>
            </body>
        </html>"
      `);
    });

    const request = {} as ServerRequest;
    const response = { body: { end } } as unknown as Response;

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      expect(givenRequest).toBe(request);
      throw httpError;
    });

    const responseFactory: ResponseFactory = jest.fn((): Response => {
      return response;
    });

    const logError: NamedLogFn = jest.fn((message: string, context: Record<string, any>) => {
      expect(message).toBe('Http Error');
      expect(context).toEqual({ httpError });
    });

    const logger = {
      error: logError,
    } as unknown as Logger;

    const errorMiddleware = createErrorMiddleware(responseFactory, true, logger);

    expect(await errorMiddleware(request, handler)).toEqual({
      ...response,
      headers: { 'content-type': ['text/html'] },
    });

    expect(end).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(responseFactory).toHaveBeenCalledTimes(1);
  });

  test('http error: server, debug false', async () => {
    const httpError: HttpError = {
      type: 'https://datatracker.ietf.org/doc/html/rfc2616#section-10.5.1',
      status: 500,
      title: 'Internal Server Error',
      key1: undefined,
      key2: null,
      key3: true,
      key4: false,
      key5: 3,
      key6: 3.3,
      key7: 'value7',
      key8: [undefined, null, true, false, 3, 3.3, 'value7'],
      key9: {
        key1: undefined,
        key2: null,
        key3: true,
        key4: false,
        key5: 3,
        key6: 3.3,
        key7: 'value7',
        key8: [undefined, null, true, false, 3, 3.3, 'value7'],
      },
      _httpError: 'InternalServerError',
    };

    const end = jest.fn((data) => {
      expect(data).toMatchInlineSnapshot(`
        "<html>
            <head>
                <meta http-equiv=\\"Content-Type\\" content=\\"text/html; charset=utf-8\\">
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
                <div class=\\"container mx-auto tracking-tighter mt-12\\">
                    <div class=\\"inline-block align-top text-gray-400 border-r-2 border-gray-400 pr-5 mr-5 text-5xl\\">500</div>
                    <div class=\\"inline-block align-top\\">
                        <div class=\\"text-5xl\\">Internal Server Error</div>
                        <div class=\\"mt-3\\"></div>
                    </div>
                </div>
            </body>
        </html>"
      `);
    });

    const request = {} as ServerRequest;
    const response = { body: { end } } as unknown as Response;

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      expect(givenRequest).toBe(request);
      throw httpError;
    });

    const responseFactory: ResponseFactory = jest.fn((): Response => {
      return response;
    });

    const logError: NamedLogFn = jest.fn((message: string, context: Record<string, any>) => {
      expect(message).toBe('Http Error');
      expect(context).toEqual({ httpError });
    });

    const logger = {
      error: logError,
    } as unknown as Logger;

    const errorMiddleware = createErrorMiddleware(responseFactory, false, logger);

    expect(await errorMiddleware(request, handler)).toEqual({
      ...response,
      headers: { 'content-type': ['text/html'] },
    });

    expect(end).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(responseFactory).toHaveBeenCalledTimes(1);
  });
});
