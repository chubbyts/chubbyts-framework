import { describe, expect, test } from '@jest/globals';
import { randomBytes } from 'crypto';
import { createReadStream, unlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { Stream } from 'stream';
import {
  createUriFactory,
  createStreamFactory,
  createStreamFromFileFactory,
  createStreamFromResourceFactory,
  createServerRequestFactory,
  createRequestFactory,
  createResponseFactory,
  statusCodeMap,
} from '../../../src/vendor/chubbyts/message-factory';
import { Method } from '../../../src/vendor/chubbyts-types/message';

const readStream = async (stream: Stream) => {
  return new Promise((resolve, reject) => {
    let data = '';

    stream.on('data', (chunk) => (data += chunk));
    stream.on('end', () => resolve(data));
    stream.on('error', (error) => reject(error));
  });
};

describe('message-factory', () => {
  describe('createUriFactory', () => {
    test('with host', () => {
      const uriFactory = createUriFactory();

      expect(uriFactory('https://localhost')).toMatchInlineSnapshot(`
        Object {
          "fragment": "",
          "host": "localhost",
          "path": "/",
          "port": undefined,
          "query": Object {},
          "schema": "https",
          "userInfo": "",
        }
      `);
    });

    test('with host and port', () => {
      const uriFactory = createUriFactory();

      expect(uriFactory('https://localhost:10443')).toMatchInlineSnapshot(`
        Object {
          "fragment": "",
          "host": "localhost",
          "path": "/",
          "port": 10443,
          "query": Object {},
          "schema": "https",
          "userInfo": "",
        }
      `);
    });

    test('with user, host and port', () => {
      const uriFactory = createUriFactory();

      expect(uriFactory('https://user@localhost:10443')).toMatchInlineSnapshot(`
        Object {
          "fragment": "",
          "host": "localhost",
          "path": "/",
          "port": 10443,
          "query": Object {},
          "schema": "https",
          "userInfo": "user",
        }
      `);
    });

    test('with user, password, host and port', () => {
      const uriFactory = createUriFactory();

      expect(uriFactory('https://user:password@localhost:10443')).toMatchInlineSnapshot(`
        Object {
          "fragment": "",
          "host": "localhost",
          "path": "/",
          "port": 10443,
          "query": Object {},
          "schema": "https",
          "userInfo": "user:password",
        }
      `);
    });

    test('with user, password, host, port and path', () => {
      const uriFactory = createUriFactory();

      expect(uriFactory('https://user:password@localhost:10443/api')).toMatchInlineSnapshot(`
        Object {
          "fragment": "",
          "host": "localhost",
          "path": "/api",
          "port": 10443,
          "query": Object {},
          "schema": "https",
          "userInfo": "user:password",
        }
      `);
    });

    test('with user, password, host, port, path and query', () => {
      const uriFactory = createUriFactory();

      expect(uriFactory('https://user:password@localhost:10443/api?key1=value1&key2[]=value2&key3[key31]=value3'))
        .toMatchInlineSnapshot(`
        Object {
          "fragment": "",
          "host": "localhost",
          "path": "/api",
          "port": 10443,
          "query": Object {
            "key1": "value1",
            "key2": Array [
              "value2",
            ],
            "key3": Object {
              "key31": "value3",
            },
          },
          "schema": "https",
          "userInfo": "user:password",
        }
      `);
    });

    test('with user, password, host, port, path, query and fragment', () => {
      const uriFactory = createUriFactory();

      expect(uriFactory('https://user:password@localhost:10443/api?key=value#key=value')).toMatchInlineSnapshot(`
        Object {
          "fragment": "key=value",
          "host": "localhost",
          "path": "/api",
          "port": 10443,
          "query": Object {
            "key": "value",
          },
          "schema": "https",
          "userInfo": "user:password",
        }
      `);
    });
  });

  test('createStreamFactory', async () => {
    const streamFactory = createStreamFactory();
    const stream = streamFactory('test');
    stream.end();

    expect(await readStream(stream)).toBe('test');
  });

  test('createStreamFromResourceFactory', async () => {
    const filename = tmpdir() + '/' + randomBytes(8).toString('hex');

    writeFileSync(filename, 'test');

    const existingStream = createReadStream(filename);

    const streamFactory = createStreamFromResourceFactory();
    const stream = streamFactory(existingStream);

    expect(await readStream(stream)).toBe('test');

    unlinkSync(filename);
  });

  describe('createStreamFromFileFactory', () => {
    test('without existing file', async () => {
      const streamFactory = createStreamFromFileFactory();

      expect(() => {
        streamFactory('/path/to/unknown/file');
      }).toThrow('File with filename: "/path/to/unknown/file" does not exists.');
    });

    test('with existing file', async () => {
      const filename = tmpdir() + '/' + randomBytes(8).toString('hex');

      writeFileSync(filename, 'test');

      const streamFactory = createStreamFromFileFactory();
      const stream = streamFactory(filename);

      expect(await readStream(stream)).toBe('test');

      unlinkSync(filename);
    });
  });

  describe('createRequestFactory', () => {
    test('with uri as string', () => {
      const requestFactory = createRequestFactory();
      const request = requestFactory(Method.GET, 'https://localhost:10443/api');

      const { body, ...rest } = request;

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        Object {
          "headers": Object {},
          "method": "GET",
          "protocolVersion": "1.0",
          "uri": Object {
            "fragment": "",
            "host": "localhost",
            "path": "/api",
            "port": 10443,
            "query": Object {},
            "schema": "https",
            "userInfo": "",
          },
        }
      `);
    });

    test('with uri as object', () => {
      const requestFactory = createRequestFactory();
      const request = requestFactory(Method.GET, createUriFactory()('https://localhost:10443/api'));

      const { body, ...rest } = request;

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        Object {
          "headers": Object {},
          "method": "GET",
          "protocolVersion": "1.0",
          "uri": Object {
            "fragment": "",
            "host": "localhost",
            "path": "/api",
            "port": 10443,
            "query": Object {},
            "schema": "https",
            "userInfo": "",
          },
        }
      `);
    });
  });

  test('createServerRequestFactory', () => {
    const serverRequestFactory = createServerRequestFactory();
    const serverRequest = serverRequestFactory(Method.GET, 'https://localhost:10443/api');

    const { body, ...rest } = serverRequest;

    expect(body).toBeInstanceOf(Stream);

    expect(rest).toMatchInlineSnapshot(`
      Object {
        "attributes": Object {},
        "headers": Object {},
        "method": "GET",
        "protocolVersion": "1.0",
        "uri": Object {
          "fragment": "",
          "host": "localhost",
          "path": "/api",
          "port": 10443,
          "query": Object {},
          "schema": "https",
          "userInfo": "",
        },
      }
    `);
  });

  test('statusCodeMap', () => {
    expect(statusCodeMap).toMatchInlineSnapshot(`
      Map {
        100 => "Continue",
        101 => "Switching Protocols",
        102 => "Processing",
        103 => "Early Hints",
        110 => "Response is Stale",
        111 => "Revalidation Failed",
        112 => "Disconnected Operation",
        113 => "Heuristic Expiration",
        199 => "Miscellaneous Warning",
        200 => "OK",
        201 => "Created",
        202 => "Accepted",
        203 => "Non-Authoritative Information",
        204 => "No Content",
        205 => "Reset Content",
        206 => "Partial Content",
        207 => "Multi-Status",
        208 => "Already Reported",
        214 => "Transformation Applied",
        226 => "IM Used",
        299 => "Miscellaneous Persistent Warning",
        300 => "Multiple Choices",
        301 => "Moved Permanently",
        302 => "Found",
        303 => "See Other",
        304 => "Not Modified",
        305 => "Use Proxy",
        306 => "Switch Proxy",
        307 => "Temporary Redirect",
        308 => "Permanent Redirect",
        400 => "Bad Request",
        401 => "Unauthorized",
        402 => "Payment Required",
        403 => "Forbidden",
        404 => "Not Found",
        405 => "Method Not Allowed",
        406 => "Not Acceptable",
        407 => "Proxy Authentication Required",
        408 => "Request Timeout",
        409 => "Conflict",
        410 => "Gone",
        411 => "Length Required",
        412 => "Precondition Failed",
        413 => "Payload Too Large",
        414 => "URI Too Long",
        415 => "Unsupported Media Type",
        416 => "Range Not Satisfiable",
        417 => "Expectation Failed",
        418 => "I'm a teapot",
        421 => "Misdirected Request",
        422 => "Unprocessable Entity",
        423 => "Locked",
        424 => "Failed Dependency",
        425 => "Too Early",
        426 => "Upgrade Required",
        428 => "Precondition Required",
        429 => "Too Many Requests",
        431 => "Request Header Fields Too Large",
        451 => "Unavailable For Legal Reasons",
        500 => "Internal Server Error",
        501 => "Not Implemented",
        502 => "Bad Gateway",
        503 => "Service Unavailable",
        504 => "Gateway Timeout",
        505 => "HTTP Version Not Supported",
        506 => "Variant Also Negotiates",
        507 => "Insufficient Storage",
        508 => "Loop Detected",
        510 => "Not Extended",
        511 => "Network Authentication Required",
      }
    `);
  });

  describe('createResponseFactory', () => {
    test('without reason phrase, but found in map', () => {
      const responseFactory = createResponseFactory();
      const response = responseFactory(404);

      const { body, ...rest } = response;

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        Object {
          "headers": Object {},
          "protocolVersion": "1.0",
          "reasonPhrase": "Not Found",
          "status": 404,
        }
      `);
    });

    test('without reason phrase, but not found in map', () => {
      const responseFactory = createResponseFactory();
      const response = responseFactory(600);

      const { body, ...rest } = response;

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        Object {
          "headers": Object {},
          "protocolVersion": "1.0",
          "reasonPhrase": "",
          "status": 600,
        }
      `);
    });

    test('with reason phrase', () => {
      const responseFactory = createResponseFactory();
      const response = responseFactory(404, 'Not Found???!!!');

      const { body, ...rest } = response;

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        Object {
          "headers": Object {},
          "protocolVersion": "1.0",
          "reasonPhrase": "Not Found???!!!",
          "status": 404,
        }
      `);
    });
  });
});
