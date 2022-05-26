import { describe, expect, test } from '@jest/globals';
import { createRoute } from '../../src/router/route';
import { createRoutesByName } from '../../src/router/routes';
import { Method } from '@chubbyts/chubbyts-http-types/dist/message';

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
        "pet_read" => Object {
          "_route": "Route",
          "attributes": Object {},
          "handler": [MockFunction],
          "method": "GET",
          "middlewares": Array [
            [MockFunction],
          ],
          "name": "pet_read",
          "path": "/api/pet/{id}",
          "pathOptions": Object {
            "name": "read",
          },
        },
      }
    `);
  });
});
