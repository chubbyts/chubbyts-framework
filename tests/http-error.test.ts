import { describe, expect, test } from '@jest/globals';
import {
  createBadRequest,
  createConflict,
  createExpectationFailed,
  createFailedDependency,
  createForbidden,
  createGone,
  createImateapot,
  createLengthRequired,
  createLocked,
  createMethodNotAllowed,
  createMisdirectedRequest,
  createNotAcceptable,
  createNotFound,
  createPayloadTooLarge,
  createPaymentRequired,
  createPreconditionFailed,
  createPreconditionRequired,
  createProxyAuthenticationRequired,
  createRangeNotSatisfiable,
  createRequestHeaderFieldsTooLarge,
  createRequestTimeout,
  createTooEarly,
  createTooManyRequests,
  createUnauthorized,
  createUnavailableForLegalReasons,
  createUnprocessableEntity,
  createUnsupportedMediaType,
  createUpgradeRequired,
  createURITooLong,
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

  test('createPaymentRequired', () => {
    expect(createPaymentRequired('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "PaymentRequired",
        "code": 402,
        "message": "Something went wrong",
        "name": "Payment Required",
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

  test('createProxyAuthenticationRequired', () => {
    expect(createProxyAuthenticationRequired('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "ProxyAuthenticationRequired",
        "code": 407,
        "message": "Something went wrong",
        "name": "Proxy Authentication Required",
      }
    `);
  });

  test('createRequestTimeout', () => {
    expect(createRequestTimeout('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "RequestTimeout",
        "code": 408,
        "message": "Something went wrong",
        "name": "Request Timeout",
      }
    `);
  });

  test('createConflict', () => {
    expect(createConflict('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "Conflict",
        "code": 409,
        "message": "Something went wrong",
        "name": "Conflict",
      }
    `);
  });

  test('createGone', () => {
    expect(createGone('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "Gone",
        "code": 410,
        "message": "Something went wrong",
        "name": "Gone",
      }
    `);
  });

  test('createLengthRequired', () => {
    expect(createLengthRequired('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "LengthRequired",
        "code": 411,
        "message": "Something went wrong",
        "name": "Length Required",
      }
    `);
  });

  test('createPreconditionFailed', () => {
    expect(createPreconditionFailed('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "PreconditionFailed",
        "code": 412,
        "message": "Something went wrong",
        "name": "Precondition Failed",
      }
    `);
  });

  test('createPayloadTooLarge', () => {
    expect(createPayloadTooLarge('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "PayloadTooLarge",
        "code": 413,
        "message": "Something went wrong",
        "name": "Payload Too Large",
      }
    `);
  });

  test('createURITooLong', () => {
    expect(createURITooLong('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "URITooLong",
        "code": 414,
        "message": "Something went wrong",
        "name": "URI Too Long",
      }
    `);
  });

  test('createUnsupportedMediaType', () => {
    expect(createUnsupportedMediaType('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "UnsupportedMediaType",
        "code": 415,
        "message": "Something went wrong",
        "name": "Unsupported Media Type",
      }
    `);
  });

  test('createRangeNotSatisfiable', () => {
    expect(createRangeNotSatisfiable('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "RangeNotSatisfiable",
        "code": 416,
        "message": "Something went wrong",
        "name": "Range Not Satisfiable",
      }
    `);
  });

  test('createExpectationFailed', () => {
    expect(createExpectationFailed('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "ExpectationFailed",
        "code": 417,
        "message": "Something went wrong",
        "name": "Expectation Failed",
      }
    `);
  });

  test('createImateapot', () => {
    expect(createImateapot('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "Imateapot",
        "code": 418,
        "message": "Something went wrong",
        "name": "I'm a teapot",
      }
    `);
  });

  test('createMisdirectedRequest', () => {
    expect(createMisdirectedRequest('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "MisdirectedRequest",
        "code": 421,
        "message": "Something went wrong",
        "name": "Misdirected Request",
      }
    `);
  });

  test('createUnprocessableEntity', () => {
    expect(createUnprocessableEntity('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "UnprocessableEntity",
        "code": 422,
        "message": "Something went wrong",
        "name": "Unprocessable Entity",
      }
    `);
  });

  test('createLocked', () => {
    expect(createLocked('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "Locked",
        "code": 423,
        "message": "Something went wrong",
        "name": "Locked",
      }
    `);
  });

  test('createFailedDependency', () => {
    expect(createFailedDependency('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "FailedDependency",
        "code": 424,
        "message": "Something went wrong",
        "name": "Failed Dependency",
      }
    `);
  });

  test('createTooEarly', () => {
    expect(createTooEarly('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "TooEarly",
        "code": 425,
        "message": "Something went wrong",
        "name": "Too Early",
      }
    `);
  });

  test('createUpgradeRequired', () => {
    expect(createUpgradeRequired('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "UpgradeRequired",
        "code": 426,
        "message": "Something went wrong",
        "name": "Upgrade Required",
      }
    `);
  });

  test('createPreconditionRequired', () => {
    expect(createPreconditionRequired('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "PreconditionRequired",
        "code": 428,
        "message": "Something went wrong",
        "name": "Precondition Required",
      }
    `);
  });

  test('createTooManyRequests', () => {
    expect(createTooManyRequests('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "TooManyRequests",
        "code": 429,
        "message": "Something went wrong",
        "name": "Too Many Requests",
      }
    `);
  });

  test('createRequestHeaderFieldsTooLarge', () => {
    expect(createRequestHeaderFieldsTooLarge('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "RequestHeaderFieldsTooLarge",
        "code": 431,
        "message": "Something went wrong",
        "name": "Request Header Fields Too Large",
      }
    `);
  });

  test('createUnavailableForLegalReasons', () => {
    expect(createUnavailableForLegalReasons('Something went wrong')).toMatchInlineSnapshot(`
      Object {
        "_httpError": "UnavailableForLegalReasons",
        "code": 451,
        "message": "Something went wrong",
        "name": "Unavailable For Legal Reasons",
      }
    `);
  });
});
