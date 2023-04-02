import { describe, expect, test } from '@jest/globals';
import { Method } from '@chubbyts/chubbyts-http-types/dist/message';
import { createRoute } from '../../src/router/route';
import { createRoutesByName } from '../../src/router/routes';

describe('routes', () => {
  test('createRoutesByName', () => {
    expect(
      createRoutesByName([
        createRoute({
          method: Method.GET,
          path: '/api/pet/{id}',
          name: 'pet_read',
          handler: jest.fn(),
          middlewares: [jest.fn()],
          pathOptions: { name: 'read' },
        }),
      ])(),
    ).toMatchInlineSnapshot(`
      Map {
        "pet_read" => {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
          "method": "GET",
          "middlewares": [
            [MockFunction],
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
