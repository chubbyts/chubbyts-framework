import { describe, expect, test } from 'vitest';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { Middleware } from '@chubbyts/chubbyts-http-types/dist/middleware';
import type { Handler } from '@chubbyts/chubbyts-http-types/dist/handler';
import { createRoutesByName } from '../../src/router/routes-by-name';
import { createRoute } from '../../src/router/route';

describe('routes-by-name', () => {
  test('createRoutesByName', () => {
    expect(
      createRoutesByName([
        createRoute({
          method: 'GET',
          path: '/api/pet/{id}',
          name: 'pet_read',
          handler: useFunctionMock<Handler>([])[0],
          middlewares: [useFunctionMock<Middleware>([])[0]],
          pathOptions: { name: 'read' },
        }),
      ]),
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
