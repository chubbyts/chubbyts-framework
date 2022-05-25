import { describe, expect, test } from '@jest/globals';
import { Route } from '../../src/router/route';
import { Routes } from '../../src/router/routes';
import {
  createPathToRegexpPathGenerator,
  createPathToRegexpRouteMatcher,
  createPathToRegexpUrlGenerator,
} from '../../src/router/path-to-regexp-router';
import { Method, ServerRequest } from '../../src/vendor/chubbyts-types/message';

describe('path-to-regexp-router', () => {
  describe('createPathToRegexpRouteMatcher', () => {
    test('not found', () => {
      const request = { method: Method.GET, uri: { path: '/' } } as ServerRequest;

      const routes: Routes = jest.fn(() => ({ name: { path: '/api', _route: 'Route' } as Route }));

      const pathToRegexpRouteMatcher = createPathToRegexpRouteMatcher(routes);

      expect(() => {
        pathToRegexpRouteMatcher(request);
      }).toThrow(
        'The page "/" you are looking for could not be found. Check the address bar to ensure your URL is spelled correctly',
      );

      expect(routes).toHaveBeenCalledTimes(1);
    });

    test('method not allowed', () => {
      const request = { method: Method.GET, uri: { path: '/api' } } as ServerRequest;

      const routes: Routes = jest.fn(() => ({
        name1: { method: Method.POST, path: '/api', _route: 'Route' } as Route,
        name2: { method: Method.PUT, path: '/api', _route: 'Route' } as Route,
      }));

      const pathToRegexpRouteMatcher = createPathToRegexpRouteMatcher(routes);

      expect(() => {
        pathToRegexpRouteMatcher(request);
      }).toThrow('Method "GET" at path "/api" is not allowed. Must be one of: "POST", "PUT".');

      expect(routes).toHaveBeenCalledTimes(1);
    });

    test('matched', () => {
      const request = { method: Method.GET, uri: { path: '/api' } } as ServerRequest;

      const routes: Routes = jest.fn(() => ({ name: { method: Method.GET, path: '/api', _route: 'Route' } as Route }));

      const pathToRegexpRouteMatcher = createPathToRegexpRouteMatcher(routes);

      expect(pathToRegexpRouteMatcher(request)).toMatchInlineSnapshot(`
        Object {
          "_route": "Route",
          "attributes": Object {},
          "method": "GET",
          "path": "/api",
        }
      `);

      expect(routes).toHaveBeenCalledTimes(1);
    });
  });

  describe('createPathToRegexpPathGenerator', () => {
    test('with attributes and query params', () => {
      const routes: Routes = jest.fn(() => ({ name: { path: '/api/pet/:id', _route: 'Route' } as Route }));

      const pathToRegexpPathGenerator = createPathToRegexpPathGenerator(routes);

      expect(
        pathToRegexpPathGenerator('name', { id: '82434d3a-7c6b-4dbf-8e4e-30ee8966a545' }, { key: { subKey: 'value' } }),
      ).toMatchInlineSnapshot(`"/api/pet/82434d3a-7c6b-4dbf-8e4e-30ee8966a545?key%5BsubKey%5D=value"`);

      expect(routes).toHaveBeenCalledTimes(1);
    });

    test('without attributes and query params', () => {
      const routes: Routes = jest.fn(() => ({ name: { path: '/api/pet', _route: 'Route' } as Route }));

      const pathToRegexpPathGenerator = createPathToRegexpPathGenerator(routes);

      expect(pathToRegexpPathGenerator('name', undefined, { key: { subKey: 'value' } })).toMatchInlineSnapshot(
        `"/api/pet?key%5BsubKey%5D=value"`,
      );

      expect(routes).toHaveBeenCalledTimes(1);
    });

    test('without attributes', () => {
      const routes: Routes = jest.fn(() => ({ name: { path: '/api/pet/:id', _route: 'Route' } as Route }));

      const pathToRegexpPathGenerator = createPathToRegexpPathGenerator(routes);

      expect(() => {
        pathToRegexpPathGenerator('name');
      }).toThrow('Expected "id" to be a string');

      expect(routes).toHaveBeenCalledTimes(1);
    });

    test('with missing route', () => {
      const routes: Routes = jest.fn(() => ({ name: { path: '/api/pet/:id', _route: 'Route' } as Route }));

      const pathToRegexpPathGenerator = createPathToRegexpPathGenerator(routes);

      expect(() => {
        pathToRegexpPathGenerator('noname');
      }).toThrow('Missing route: "noname"');

      expect(routes).toHaveBeenCalledTimes(1);
    });
  });

  describe('createPathToRegexpPathGenerator', () => {
    test('with userInfo and port', () => {
      const request = {
        uri: {
          schema: 'https',
          userInfo: 'user:password',
          host: 'localhost',
          port: 10443,
        },
      } as unknown as ServerRequest;

      const routes: Routes = jest.fn(() => ({ name: { path: '/api/pet/:id', _route: 'Route' } as Route }));

      const pathToRegexpUrlGenerator = createPathToRegexpUrlGenerator(createPathToRegexpPathGenerator(routes));

      expect(
        pathToRegexpUrlGenerator(
          request,
          'name',
          { id: '82434d3a-7c6b-4dbf-8e4e-30ee8966a545' },
          { key: { subKey: 'value' } },
        ),
      ).toMatchInlineSnapshot(
        `"https://user:password@localhost:10443/api/pet/82434d3a-7c6b-4dbf-8e4e-30ee8966a545?key%5BsubKey%5D=value"`,
      );

      expect(routes).toHaveBeenCalledTimes(1);
    });

    test('without userInfo and without port', () => {
      const request = {
        uri: {
          schema: 'https',
          host: 'localhost',
        },
      } as unknown as ServerRequest;

      const routes: Routes = jest.fn(() => ({ name: { path: '/api/pet/:id', _route: 'Route' } as Route }));

      const pathToRegexpUrlGenerator = createPathToRegexpUrlGenerator(createPathToRegexpPathGenerator(routes));

      expect(
        pathToRegexpUrlGenerator(
          request,
          'name',
          { id: '82434d3a-7c6b-4dbf-8e4e-30ee8966a545' },
          { key: { subKey: 'value' } },
        ),
      ).toMatchInlineSnapshot(`"https://localhost/api/pet/82434d3a-7c6b-4dbf-8e4e-30ee8966a545?key%5BsubKey%5D=value"`);

      expect(routes).toHaveBeenCalledTimes(1);
    });
  });
});
