import { describe, expect, test } from '@jest/globals';
import { createGroup, getRoutes, isGroup } from '../../src/router/group';
import { createRoute } from '../../src/router/route';
import { Method } from '@chubbyts/chubbyts-http-types/dist/message';

describe('group', () => {
  describe('isGroup', () => {
    [
      { name: 'group', value: { _group: 'Group' }, toBe: true },
      { name: 'error', value: new Error(), toBe: false },
      { name: 'object', value: {}, toBe: false },
      { name: 'string', value: 'example', toBe: false },
      { name: 'undefined', value: undefined, toBe: false },
      { name: 'null', value: null, toBe: false },
    ].forEach(({ name, value, toBe }) => {
      test('type is ' + name, () => {
        expect(isGroup(value)).toBe(toBe);
      });
    });
  });

  describe('createGroup', () => {
    test('minimal', () => {
      expect(
        createGroup({
          path: '/api',
          children: [],
        }),
      ).toMatchInlineSnapshot(`
        {
          "_group": "Group",
          "children": [],
          "middlewares": [],
          "path": "/api",
          "pathOptions": {},
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
        {
          "_group": "Group",
          "children": [
            {
              "_group": "Group",
              "children": [],
              "middlewares": [],
              "path": "/pet",
              "pathOptions": {},
            },
          ],
          "middlewares": [
            [MockFunction],
          ],
          "path": "/api",
          "pathOptions": {
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
              pathOptions: { name3: 'list' },
            }),
            createRoute({
              method: Method.POST,
              path: '/',
              name: 'pet_create',
              handler: jest.fn(),
              middlewares: [jest.fn()],
              pathOptions: { name3: 'create' },
            }),
            createRoute({
              method: Method.GET,
              path: '/{id}',
              name: 'pet_read',
              handler: jest.fn(),
              middlewares: [jest.fn()],
              pathOptions: { name3: 'read' },
            }),
            createRoute({
              method: Method.PUT,
              path: '/{id}',
              name: 'pet_update',
              handler: jest.fn(),
              middlewares: [jest.fn()],
              pathOptions: { name3: 'update' },
            }),
            createRoute({
              method: Method.DELETE,
              path: '/{id}',
              name: 'pet_delete',
              handler: jest.fn(),
              middlewares: [jest.fn()],
              pathOptions: { name3: 'delete' },
            }),
          ],
          middlewares: [jest.fn()],
          pathOptions: { name2: 'pet' },
        }),
      ],
      middlewares: [jest.fn()],
      pathOptions: { name1: 'api' },
    });

    expect(getRoutes(group)).toMatchInlineSnapshot(`
      [
        {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
          "method": "GET",
          "middlewares": [
            [MockFunction],
            [MockFunction],
            [MockFunction],
          ],
          "name": "pet_list",
          "path": "/api/pet/",
          "pathOptions": {
            "name1": "api",
            "name2": "pet",
            "name3": "list",
          },
        },
        {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
          "method": "POST",
          "middlewares": [
            [MockFunction],
            [MockFunction],
            [MockFunction],
          ],
          "name": "pet_create",
          "path": "/api/pet/",
          "pathOptions": {
            "name1": "api",
            "name2": "pet",
            "name3": "create",
          },
        },
        {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
          "method": "GET",
          "middlewares": [
            [MockFunction],
            [MockFunction],
            [MockFunction],
          ],
          "name": "pet_read",
          "path": "/api/pet/{id}",
          "pathOptions": {
            "name1": "api",
            "name2": "pet",
            "name3": "read",
          },
        },
        {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
          "method": "PUT",
          "middlewares": [
            [MockFunction],
            [MockFunction],
            [MockFunction],
          ],
          "name": "pet_update",
          "path": "/api/pet/{id}",
          "pathOptions": {
            "name1": "api",
            "name2": "pet",
            "name3": "update",
          },
        },
        {
          "_route": "Route",
          "attributes": {},
          "handler": [MockFunction],
          "method": "DELETE",
          "middlewares": [
            [MockFunction],
            [MockFunction],
            [MockFunction],
          ],
          "name": "pet_delete",
          "path": "/api/pet/{id}",
          "pathOptions": {
            "name1": "api",
            "name2": "pet",
            "name3": "delete",
          },
        },
      ]
    `);
  });
});
