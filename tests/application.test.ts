import { describe, expect, test } from '@jest/globals';
import { createApplication } from '../src/application';
import { Route } from '../src/router/route';
import { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';

describe('createApplication', () => {
  test('without middlewares', async () => {
    const request = { attributes: {} } as ServerRequest;

    const application = createApplication([]);

    await expect(async () => {
      await application(request);
    }).rejects.toThrow(
      'Request attribute "route" missing or wrong type "undefined", please add the "createRouteHandler" middleware.',
    );
  });

  test('with middlewares', async () => {
    const response = {} as Response;

    const handler: Handler = jest.fn(async (): Promise<Response> => {
      return response;
    });

    const middlewares: Array<Middleware> = [];

    const route = { handler, middlewares, _route: 'Route' } as unknown as Route;
    const request = { attributes: { route } } as unknown as ServerRequest;

    const middleware: Middleware = jest.fn(
      async (givenRequest: ServerRequest, givenHandler: Handler): Promise<Response> => {
        return givenHandler(givenRequest);
      },
    );

    const application = createApplication([middleware]);

    expect(await application(request)).toBe(response);

    expect(middleware).toHaveBeenCalledTimes(1);
  });
});
