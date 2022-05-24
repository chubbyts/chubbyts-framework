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
    test('with uri as string', async () => {
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

    test('with uri as object', async () => {
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

  test('createServerRequestFactory', async () => {
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

  describe('createResponseFactory', () => {
    test('without reason phrase, but found in map', async () => {
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

    test('without reason phrase, but not found in map', async () => {
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

    test('with reason phrase', async () => {
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
