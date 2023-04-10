import { describe, expect, test } from '@jest/globals';
import { Method } from '@chubbyts/chubbyts-http-types/dist/message';
import { createFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import { createRoutesByName } from '../../src/router/routes';
import { createRoute } from '../../src/router/route';

describe('routes', () => {
  test('createRoutesByName', () => {
    expect(
      createRoutesByName([
        createRoute({
          method: Method.GET,
          path: '/api/pet/{id}',
          name: 'pet_read',
          handler: createFunctionMock<Handler>([]),
          middlewares: [createFunctionMock<Middleware>([])],
          pathOptions: { name: 'read' },
        }),
      ])(),
    ).toMatchInlineSnapshot(`
      Map {
        "pet_read" => {
          "_route": "Route",
          "attributes": {},
          "handler": [Function],
          "method": "GET",
          "middlewares": [
            [Function],
          ],
          "name": "pet_read",
          "path": "/api/pet/{id}",
          "pathOptions": {
            "name": "read",
          },
        },
      }
    `);
  });
});
