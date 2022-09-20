import { describe, expect, test } from '@jest/globals';
import { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import { createErrorMiddleware } from '../../src/middleware/error-middleware';
import { ResponseFactory } from '@chubbyts/chubbyts-http-types/dist/message-factory';
import { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { Logger, NamedLogFn } from '@chubbyts/chubbyts-log-types/dist/log';
import { createBadRequest, createInternalServerError } from '@chubbyts/chubbyts-http-error/dist/http-error';

const replaceStackLines = (data: string) => data.replace(/.*<br>&nbsp;&nbsp;&nbsp;&nbsp;at.*\n/g, '');

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

    const end = jest.fn((data: string) => {
      expect(replaceStackLines(data)).toMatchInlineSnapshot(`
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
      expect(data).not.toMatch('Stryker');
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

    const end = jest.fn((data: string) => {
      expect(replaceStackLines(data)).toMatchInlineSnapshot(`
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
                            <span class="text-5xl">Internal Server Error</span><p>A website error has occurred. Sorry for the temporary inconvenience.</p><div class="mt-12 mb-12">Error: Internal Server Error
        <div class="mb-12">Error: error
        <div class="mb-12">Error: cause
                        </div>
                    </div>
                </div>
            </body>
        </html>"
      `);
      expect(data).not.toMatch('Stryker');
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
      expect(message).toBe('Http Error');
      expect(context).toMatchInlineSnapshot(`
        {
          "httpError": [Error: Internal Server Error],
        }
      `);
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

    const end = jest.fn((data: string) => {
      expect(replaceStackLines(data)).toMatchInlineSnapshot(`
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
                            <span class="text-5xl">Internal Server Error</span><p>A website error has occurred. Sorry for the temporary inconvenience.</p><div class="mt-12 mb-12">Error: Internal Server Error
        <div class="mb-12">string: error</div>
                        </div>
                    </div>
                </div>
            </body>
        </html>"
      `);
      expect(data).not.toMatch('Stryker');
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
      expect(message).toBe('Http Error');
      expect(context).toMatchInlineSnapshot(`
        {
          "httpError": [Error: Internal Server Error],
        }
      `);
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
    const httpError = createBadRequest({
      detail: 'The given data is not valid',
      instance: 'some-instance',
    });

    const end = jest.fn((data: string) => {
      expect(replaceStackLines(data)).toMatchInlineSnapshot(`
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
                            <span class="text-5xl">Bad Request</span><p>The given data is not valid</p><p>some-instance</p><div class="mt-12 mb-12">Error: Bad Request
                        </div>
                    </div>
                </div>
            </body>
        </html>"
      `);
      expect(data).not.toMatch('Stryker');
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
      expect(context).toMatchInlineSnapshot(`
        {
          "httpError": [Error: Bad Request],
        }
      `);
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

  test('http error: server', async () => {
    const httpError = createInternalServerError({});

    const end = jest.fn((data: string) => {
      expect(replaceStackLines(data)).toMatchInlineSnapshot(`
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
                            <span class="text-5xl">Internal Server Error</span><div class="mt-12 mb-12">Error: Internal Server Error
                        </div>
                    </div>
                </div>
            </body>
        </html>"
      `);
      expect(data).not.toMatch('Stryker');
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
      expect(context).toMatchInlineSnapshot(`
        {
          "httpError": [Error: Internal Server Error],
        }
      `);
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
});
