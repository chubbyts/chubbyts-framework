import { describe, expect, test } from '@jest/globals';
import { Response, ServerRequest } from '../../src/vendor/chubbyts-types/message';
import { ResponseFactory } from '../../src/vendor/chubbyts-types/message-factory';
import { Match } from '../../src/router/route-matcher';
import { Handler } from '../../src/vendor/chubbyts-types/handler';
import { createRouteMatcherMiddleware } from '../../src/middleware/route-matcher-middleware';
import { Route } from '../../src/router/route';
import { HttpError } from '../../src/http-error';
import { Logger, NamedLogFn } from '../../src/vendor/chubbyts-types/log';

describe('createRouteMatcherMiddleware', () => {
  test('successful', async () => {
    const route = { attributes: { key: 'value' }, _route: 'Route' } as unknown as Route;
    const request = {} as ServerRequest;
    const response = {} as Response;

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      expect(givenRequest).toEqual({
        ...givenRequest,
        attributes: { ...givenRequest.attributes, route, ...route.attributes },
      });

      return response;
    });

    const match: Match = jest.fn((givenRequest: ServerRequest): Route => {
      expect(givenRequest).toBe(request);

      return route;
    });

    const responseFactory: ResponseFactory = jest.fn();

    const routeMatcherMiddleware = createRouteMatcherMiddleware(match, responseFactory);

    expect(await routeMatcherMiddleware(request, handler)).toBe(response);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(match).toHaveBeenCalledTimes(1);
    expect(responseFactory).toHaveBeenCalledTimes(0);
  });

  test('with random error, without log', async () => {
    const error = new Error('example');

    const request = {} as ServerRequest;
    const response = {} as Response;

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      return response;
    });

    const match: Match = jest.fn((givenRequest: ServerRequest): Route => {
      expect(givenRequest).toBe(request);

      throw error;
    });

    const responseFactory: ResponseFactory = jest.fn();

    const routeMatcherMiddleware = createRouteMatcherMiddleware(match, responseFactory);

    await expect(async () => {
      await routeMatcherMiddleware(request, handler);
    }).rejects.toThrow(error);

    expect(handler).toHaveBeenCalledTimes(0);
    expect(match).toHaveBeenCalledTimes(1);
    expect(responseFactory).toHaveBeenCalledTimes(0);
  });

  test('with http error, and logger', async () => {
    const httpError: HttpError = {
      name: 'Not Found',
      message: 'There is no entry for given id',
      code: 404,
      _httpError: 'NotFound',
    };

    const end = jest.fn((data) => {
      expect(data).toMatchInlineSnapshot(`
        "<html>
            <head>
                <meta http-equiv=\\"Content-Type\\" content=\\"text/html; charset=utf-8\\">
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
                    <div class=\\"inline-block align-top text-gray-400 border-r-2 border-gray-400 pr-5 mr-5 text-5xl\\">404</div>
                    <div class=\\"inline-block align-top\\">
                        <div class=\\"text-5xl\\">Not Found</div>
                        <div class=\\"mt-3\\">There is no entry for given id</div>
                    </div>
                </div>
            </body>
        </html>"
      `);
    });

    const request = {} as ServerRequest;
    const response = { body: { end } } as unknown as Response;

    const handler: Handler = jest.fn(async (givenRequest: ServerRequest): Promise<Response> => {
      return response;
    });

    const match: Match = jest.fn((givenRequest: ServerRequest): Route => {
      expect(givenRequest).toBe(request);

      throw httpError;
    });

    const responseFactory: ResponseFactory = jest.fn((): Response => {
      return response;
    });

    const logInfo: NamedLogFn = jest.fn((message: string, context: Record<string, any>) => {
      expect(message).toBe('Route error');
      expect(context).toEqual({
        name: httpError.name,
        message: httpError.message,
        code: httpError.code,
      });
    });

    const logger = {
      info: logInfo,
    } as unknown as Logger;

    const routeMatcherMiddleware = createRouteMatcherMiddleware(match, responseFactory, logger);

    expect(await routeMatcherMiddleware(request, handler)).toEqual({
      ...response,
      headers: { 'content-type': ['text/html'] },
    });

    expect(handler).toHaveBeenCalledTimes(0);
    expect(match).toHaveBeenCalledTimes(1);
    expect(responseFactory).toHaveBeenCalledTimes(1);
  });
});
