import { describe, expect, test } from '@jest/globals';
import {
  createBadRequest,
  createForbidden,
  createMethodNotAllowed,
  createNotAcceptable,
  createNotFound,
  createUnauthorized,
  isHttpError,
} from '../src/http-error';

describe('http-error', () => {
  describe('isHttpError', () => {
    [
      { name: 'http-error', value: { _httpError: 'Not Found' }, toBe: true },
      { name: 'error', value: new Error(), toBe: false },
      { name: 'object', value: {}, toBe: false },
      { name: 'string', value: 'example', toBe: false },
      { name: 'undefined', value: undefined, toBe: false },
      { name: 'null', value: null, toBe: false },
    ].forEach(({ name, value, toBe }) => {
      test('type is ' + name, () => {
        expect(isHttpError(value)).toBe(toBe);
      });
    });
  });

  test('createBadRequest', () => {
    expect(createBadRequest('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "BadRequest",
        "code": 400,
        "message": "Something went wrong",
        "name": "Bad Request",
      }
    `);
  });

  test('createUnauthorized', () => {
    expect(createUnauthorized('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "Unauthorized",
        "code": 401,
        "message": "Something went wrong",
        "name": "Unauthorized",
      }
    `);
  });

  test('createForbidden', () => {
    expect(createForbidden('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "Forbidden",
        "code": 403,
        "message": "Something went wrong",
        "name": "Forbidden",
      }
    `);
  });

  test('createNotFound', () => {
    expect(createNotFound('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "NotFound",
        "code": 404,
        "message": "Something went wrong",
        "name": "Not Found",
      }
    `);
  });

  test('createMethodNotAllowed', () => {
    expect(createMethodNotAllowed('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "MethodNotAllowed",
        "code": 405,
        "message": "Something went wrong",
        "name": "Method Not Allowed",
      }
    `);
  });

  test('createNotAcceptable', () => {
    expect(createNotAcceptable('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "NotAcceptable",
        "code": 406,
        "message": "Something went wrong",
        "name": "Not Acceptable",
      }
    `);
  });
});
