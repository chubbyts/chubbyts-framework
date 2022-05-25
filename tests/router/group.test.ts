import { describe, expect, test } from '@jest/globals';
import { createGroup, getRoutes } from '../../src/router/group';
import { createRoute } from '../../src/router/route';
import { Method } from '../../src/vendor/chubbyts-types/message';

describe('group', () => {
  describe('createGroup', () => {
    test('minimal', () => {
      expect(
        createGroup({
          path: '/api',
          children: [],
        }),
      ).toMatchInlineSnapshot(`
        Object {
          "_group": "Group",
          "children": Array [],
          "middlewares": Array [],
          "path": "/api",
          "pathOptions": Object {},
        }
      `);
    });

    test('maximal', () => {
      expect(
        createGroup({
          path: '/api',
          children: [
            createGroup({
              path: '/pet',
              children: [],
            }),
          ],
          middlewares: [jest.fn()],
          pathOptions: { key: 'value' },
        }),
      ).toMatchInlineSnapshot(`
        Object {
          "_group": "Group",
          "children": Array [
            Object {
              "_group": "Group",
              "children": Array [],
              "middlewares": Array [],
              "path": "/pet",
              "pathOptions": Object {},
            },
          ],
          "middlewares": Array [
            [MockFunction],
          ],
          "path": "/api",
          "pathOptions": Object {
            "key": "value",
          },
        }
      `);
    });
  });

  test('getRoutes', () => {
    const group = createGroup({
      path: '/api',
      children: [
        createGroup({
          path: '/pet',
          children: [
            createRoute({
              method: Method.GET,
              path: '/',
              name: 'pet_list',
              handler: jest.fn(),
              middlewares: [jest.fn()],
              pathOptions: { name: 'list' },
            }),
            createRoute({
              method: Method.POST,
              path: '/',
              name: 'pet_create',
              handler: jest.fn(),
              middlewares: [jest.fn()],
              pathOptions: { name: 'create' },
            }),
            createRoute({
              method: Method.GET,
              path: '/{id}',
              name: 'pet_read',
              handler: jest.fn(),
              middlewares: [jest.fn()],
              pathOptions: { name: 'read' },
            }),
            createRoute({
              method: Method.PUT,
              path: '/{id}',
              name: 'pet_update',
              handler: jest.fn(),
              middlewares: [jest.fn()],
              pathOptions: { name: 'update' },
            }),
            createRoute({
              method: Method.DELETE,
              path: '/{id}',
              name: 'pet_delete',
              handler: jest.fn(),
              middlewares: [jest.fn()],
              pathOptions: { name: 'delete' },
            }),
          ],
          middlewares: [jest.fn()],
          pathOptions: { name: 'pet' },
        }),
      ],
      middlewares: [jest.fn()],
      pathOptions: { name: 'api' },
    });

    expect(getRoutes(group)).toMatchInlineSnapshot(`
      Array [
        Object {
          "_route": "Route",
          "attributes": Object {},
          "handler": [MockFunction],
          "method": "GET",
          "middlewares": Array [
            [MockFunction],
            [MockFunction],
            [MockFunction],
          ],
          "name": "pet_list",
          "path": "/api/pet/",
          "pathOptions": Object {
            "name": "list",
          },
        },
        Object {
          "_route": "Route",
          "attributes": Object {},
          "handler": [MockFunction],
          "method": "POST",
          "middlewares": Array [
            [MockFunction],
            [MockFunction],
            [MockFunction],
          ],
          "name": "pet_create",
          "path": "/api/pet/",
          "pathOptions": Object {
            "name": "create",
          },
        },
        Object {
          "_route": "Route",
          "attributes": Object {},
          "handler": [MockFunction],
          "method": "GET",
          "middlewares": Array [
            [MockFunction],
            [MockFunction],
            [MockFunction],
          ],
          "name": "pet_read",
          "path": "/api/pet/{id}",
          "pathOptions": Object {
            "name": "read",
          },
        },
        Object {
          "_route": "Route",
          "attributes": Object {},
          "handler": [MockFunction],
          "method": "PUT",
          "middlewares": Array [
            [MockFunction],
            [MockFunction],
            [MockFunction],
          ],
          "name": "pet_update",
          "path": "/api/pet/{id}",
          "pathOptions": Object {
            "name": "update",
          },
        },
        Object {
          "_route": "Route",
          "attributes": Object {},
          "handler": [MockFunction],
          "method": "DELETE",
          "middlewares": Array [
            [MockFunction],
            [MockFunction],
            [MockFunction],
          ],
          "name": "pet_delete",
          "path": "/api/pet/{id}",
          "pathOptions": Object {
            "name": "delete",
          },
        },
      ]
    `);
  });
});
