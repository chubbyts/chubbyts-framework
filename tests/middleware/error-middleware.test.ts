import { describe, expect, test } from '@jest/globals';
import { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import { createErrorMiddleware } from '../../src/middleware/error-middleware';
import { ResponseFactory } from '@chubbyts/chubbyts-http-types/dist/message-factory';
import { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { Logger, NamedLogFn } from '../../src/vendor/chubbyts-types/log';

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

    const previousError = new Error('previous');
    previousError.stack = 'Error: previous\nat Line1\nat Line2\nat Line3';

    // @ts-ignore
    error.previous = previousError;

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
        <br>&nbsp;&nbsp;&nbsp;&nbsp;at Line2</div><div class=\\"mt-3\\">Error: previous
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
});
