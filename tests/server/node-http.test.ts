import { describe, expect, test } from '@jest/globals';
import { IncomingMessage, OutgoingHttpHeaders, ServerResponse } from 'http';
import { Duplex, Stream } from 'stream';
import { createResponseToNodeEmitter, createNodeToServerRequestFactory } from '../../src/server/node-http';
import { Response, ServerRequest, Uri } from '@chubbyts/chubbyts-http-types/dist/message';
import {
  ServerRequestFactory,
  StreamFromResourceFactory,
  UriFactory,
} from '@chubbyts/chubbyts-http-types/dist/message-factory';

describe('http-node', () => {
  describe('createNodeToServerRequestFactory', () => {
    test('with method url', () => {
      const req = {} as IncomingMessage;

      const uriFactory: UriFactory = jest.fn();
      const serverRequestFactory: ServerRequestFactory = jest.fn();
      const streamFromResourceFactory: StreamFromResourceFactory = jest.fn();

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
      );

      expect(() => {
        nodeToServerRequestFactory(req);
      }).toThrow('Method missing');

      expect(serverRequestFactory).toHaveBeenCalledTimes(0);
      expect(uriFactory).toHaveBeenCalledTimes(0);
      expect(streamFromResourceFactory).toHaveBeenCalledTimes(0);
    });

    test('with url method', () => {
      const req = { method: 'get' } as IncomingMessage;

      const uriFactory: UriFactory = jest.fn();
      const serverRequestFactory: ServerRequestFactory = jest.fn();
      const streamFromResourceFactory: StreamFromResourceFactory = jest.fn();

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
      );

      expect(() => {
        nodeToServerRequestFactory(req);
      }).toThrow('Url missing');

      expect(serverRequestFactory).toHaveBeenCalledTimes(0);
      expect(uriFactory).toHaveBeenCalledTimes(0);
      expect(streamFromResourceFactory).toHaveBeenCalledTimes(0);
    });

    test('without uriOptions and without host', () => {
      const req = {
        method: 'get',
        url: '/api?key=value',
        headers: {
          key1: '   value1',
          key2: ['value2     '],
          key3: 'value3,value4',
          key4: ['value5, value6  ', ' value7, value8 '],
          key5: [undefined, 'value9'],
          key6: undefined,
        },
        httpVersion: '1.1',
      } as unknown as IncomingMessage;

      const uri = {
        query: { key: 'value' },
      } as unknown as Uri;

      const stream = new Duplex();

      const serverRequest = {
        body: stream,
        uri,
      } as ServerRequest;

      const uriFactory: UriFactory = jest.fn((givenUri: string): Uri => {
        expect(givenUri).toBe('http://localhost/api?key=value');

        return uri;
      });

      const serverRequestFactory: ServerRequestFactory = jest.fn(
        (givenMethod: string, givenUri: Uri | string): ServerRequest => {
          expect(givenMethod).toBe('GET');
          expect(givenUri).toBe(uri);

          return serverRequest;
        },
      );

      const streamFromResourceFactory: StreamFromResourceFactory = jest.fn((givenStream: Stream): Duplex => {
        return stream;
      });

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
      );

      const { body, ...rest } = nodeToServerRequestFactory(req);

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        Object {
          "headers": Object {
            "key1": Array [
              "value1",
            ],
            "key2": Array [
              "value2",
            ],
            "key3": Array [
              "value3",
              "value4",
            ],
            "key4": Array [
              "value5",
              "value6",
              "value7",
              "value8",
            ],
            "key5": Array [
              "value9",
            ],
          },
          "protocolVersion": "1.1",
          "uri": Object {
            "query": Object {
              "key": "value",
            },
          },
        }
      `);

      expect(serverRequestFactory).toHaveBeenCalledTimes(1);
      expect(uriFactory).toHaveBeenCalledTimes(1);
      expect(streamFromResourceFactory).toHaveBeenCalledTimes(1);
    });

    test('without uriOptions', () => {
      const req = {
        method: 'get',
        url: '/api?key=value',
        headers: { host: 'localhost:10080', key1: 'value1', key2: ['value2'] },
        httpVersion: '1.1',
      } as unknown as IncomingMessage;

      const uri = {
        query: { key: 'value' },
      } as unknown as Uri;

      const stream = new Duplex();

      const serverRequest = {
        body: stream,
        uri,
      } as ServerRequest;

      const uriFactory: UriFactory = jest.fn((givenUri: string): Uri => {
        expect(givenUri).toBe('http://localhost:10080/api?key=value');

        return uri;
      });

      const serverRequestFactory: ServerRequestFactory = jest.fn(
        (givenMethod: string, givenUri: Uri | string): ServerRequest => {
          expect(givenMethod).toBe('GET');
          expect(givenUri).toBe(uri);

          return serverRequest;
        },
      );

      const streamFromResourceFactory: StreamFromResourceFactory = jest.fn((givenStream: Stream): Duplex => {
        return stream;
      });

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
      );

      const { body, ...rest } = nodeToServerRequestFactory(req);

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        Object {
          "headers": Object {
            "host": Array [
              "localhost:10080",
            ],
            "key1": Array [
              "value1",
            ],
            "key2": Array [
              "value2",
            ],
          },
          "protocolVersion": "1.1",
          "uri": Object {
            "query": Object {
              "key": "value",
            },
          },
        }
      `);

      expect(serverRequestFactory).toHaveBeenCalledTimes(1);
      expect(uriFactory).toHaveBeenCalledTimes(1);
      expect(streamFromResourceFactory).toHaveBeenCalledTimes(1);
    });

    test('with uriOptions = true, but missing related headers', () => {
      const req = {
        method: 'get',
        url: '/api?key=value',
        headers: {},
        httpVersion: '1.1',
      } as unknown as IncomingMessage;

      const uriFactory: UriFactory = jest.fn();
      const serverRequestFactory: ServerRequestFactory = jest.fn();
      const streamFromResourceFactory: StreamFromResourceFactory = jest.fn();

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
        'forwarded',
      );

      expect(() => {
        nodeToServerRequestFactory(req);
      }).toThrow('Missing "x-forwarded-proto", "x-forwarded-host", "x-forwarded-port" header(s).');

      expect(serverRequestFactory).toHaveBeenCalledTimes(0);
      expect(uriFactory).toHaveBeenCalledTimes(0);
      expect(streamFromResourceFactory).toHaveBeenCalledTimes(0);
    });

    test('with uriOptions = true', () => {
      const req = {
        method: 'get',
        url: '/api?key=value',
        headers: {
          'x-forwarded-proto': 'https',
          'x-forwarded-host': 'localhost',
          'x-forwarded-port': '10443',
        },
        httpVersion: '1.1',
      } as unknown as IncomingMessage;

      const uri = {
        query: { key: 'value' },
      } as unknown as Uri;

      const stream = new Duplex();

      const serverRequest = {
        body: stream,
        uri,
      } as ServerRequest;

      const uriFactory: UriFactory = jest.fn((givenUri: string): Uri => {
        expect(givenUri).toBe('https://localhost:10443/api?key=value');

        return uri;
      });

      const serverRequestFactory: ServerRequestFactory = jest.fn(
        (givenMethod: string, givenUri: Uri | string): ServerRequest => {
          expect(givenMethod).toBe('GET');
          expect(givenUri).toBe(uri);

          return serverRequest;
        },
      );

      const streamFromResourceFactory: StreamFromResourceFactory = jest.fn((givenStream: Stream): Duplex => {
        return stream;
      });

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
        'forwarded',
      );

      const { body, ...rest } = nodeToServerRequestFactory(req);

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        Object {
          "headers": Object {
            "x-forwarded-host": Array [
              "localhost",
            ],
            "x-forwarded-port": Array [
              "10443",
            ],
            "x-forwarded-proto": Array [
              "https",
            ],
          },
          "protocolVersion": "1.1",
          "uri": Object {
            "query": Object {
              "key": "value",
            },
          },
        }
      `);

      expect(serverRequestFactory).toHaveBeenCalledTimes(1);
      expect(uriFactory).toHaveBeenCalledTimes(1);
      expect(streamFromResourceFactory).toHaveBeenCalledTimes(1);
    });

    test('with uriOptions schema: https, host: localhost:10443', () => {
      const req = {
        method: 'get',
        url: '/',
        headers: {},
        httpVersion: '1.1',
      } as unknown as IncomingMessage;

      const uri = {} as Uri;

      const stream = new Duplex();

      const serverRequest = {
        body: stream,
        uri,
      } as ServerRequest;

      const uriFactory: UriFactory = jest.fn((givenUri: string): Uri => {
        expect(givenUri).toBe('https://localhost:10443/');

        return uri;
      });

      const serverRequestFactory: ServerRequestFactory = jest.fn(
        (givenMethod: string, givenUri: Uri | string): ServerRequest => {
          expect(givenMethod).toBe('GET');
          expect(givenUri).toBe(uri);

          return serverRequest;
        },
      );

      const streamFromResourceFactory: StreamFromResourceFactory = jest.fn((givenStream: Stream): Duplex => {
        return stream;
      });

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
        {
          schema: 'https',
          host: 'localhost:10443',
        },
      );

      const { body, ...rest } = nodeToServerRequestFactory(req);

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        Object {
          "headers": Object {},
          "protocolVersion": "1.1",
          "uri": Object {},
        }
      `);

      expect(serverRequestFactory).toHaveBeenCalledTimes(1);
      expect(uriFactory).toHaveBeenCalledTimes(1);
      expect(streamFromResourceFactory).toHaveBeenCalledTimes(1);
    });
  });

  test('createResponseToNodeEmitter', () => {
    const status = 200;
    const reasonPhrase = 'OK';
    const headers = { 'content-type': ['application/json'] };

    const writeHead = jest.fn(
      (givenStatusCode: number, givenReasonPhrase?: string, givenHeaders?: OutgoingHttpHeaders): void => {
        expect(givenStatusCode).toBe(status);
        expect(givenReasonPhrase).toBe(reasonPhrase);
        expect(givenHeaders).toBe(headers);
      },
    );

    const res = { writeHead } as unknown as ServerResponse;

    const pipe = jest.fn((givenStream) => {
      expect(givenStream).toBe(res);
    });

    const response = {
      status,
      reasonPhrase,
      headers,
      body: {
        pipe,
      },
    } as unknown as Response;

    const responseToNodeEmitter = createResponseToNodeEmitter();

    responseToNodeEmitter(response, res);

    expect(writeHead).toHaveBeenCalledTimes(1);
    expect(pipe).toHaveBeenCalledTimes(1);
  });
});
