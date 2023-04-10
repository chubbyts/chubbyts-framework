import type { IncomingMessage, ServerResponse, OutgoingHttpHeaders } from 'http';
import { Duplex, Stream } from 'stream';
import { describe, expect, test } from '@jest/globals';
import type { Response, ServerRequest, Uri } from '@chubbyts/chubbyts-http-types/dist/message';
import { Method } from '@chubbyts/chubbyts-http-types/dist/message';
import type {
  ServerRequestFactory,
  StreamFromResourceFactory,
  UriFactory,
} from '@chubbyts/chubbyts-http-types/dist/message-factory';
import type { FunctionMocks } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { createFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import type { ObjectMocks } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import { createObjectMock } from '@chubbyts/chubbyts-function-mock/dist/object-mock';
import { createResponseToNodeEmitter, createNodeToServerRequestFactory } from '../../src/server/node-http';

describe('http-node', () => {
  describe('createNodeToServerRequestFactory', () => {
    test('with method url', () => {
      const req = {} as IncomingMessage;

      const uriFactory = createFunctionMock<UriFactory>([]);
      const serverRequestFactory = createFunctionMock<ServerRequestFactory>([]);
      const streamFromResourceFactory = createFunctionMock<StreamFromResourceFactory>([]);

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
      );

      expect(() => {
        nodeToServerRequestFactory(req);
      }).toThrow('Method missing');
    });

    test('with url method', () => {
      const req = { method: 'get' } as IncomingMessage;

      const uriFactory = createFunctionMock<UriFactory>([]);
      const serverRequestFactory = createFunctionMock<ServerRequestFactory>([]);
      const streamFromResourceFactory = createFunctionMock<StreamFromResourceFactory>([]);

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
      );

      expect(() => {
        nodeToServerRequestFactory(req);
      }).toThrow('Url missing');
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

      const request = {
        body: stream,
        uri,
      } as ServerRequest;

      const uriFactoryMocks: FunctionMocks<UriFactory> = [
        { parameters: ['http://localhost/api?key=value'], return: uri },
      ];

      const uriFactory = createFunctionMock(uriFactoryMocks);

      const serverRequestFactoryMocks: FunctionMocks<ServerRequestFactory> = [
        { parameters: [Method.GET, uri], return: request },
      ];

      const serverRequestFactory = createFunctionMock(serverRequestFactoryMocks);

      const streamFromResourceFactoryMocks: FunctionMocks<StreamFromResourceFactory> = [
        { parameters: [req], return: stream },
      ];

      const streamFromResourceFactory = createFunctionMock(streamFromResourceFactoryMocks);

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
      );

      const { body, ...rest } = nodeToServerRequestFactory(req);

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        {
          "headers": {
            "key1": [
              "value1",
            ],
            "key2": [
              "value2",
            ],
            "key3": [
              "value3",
              "value4",
            ],
            "key4": [
              "value5",
              "value6",
              "value7",
              "value8",
            ],
            "key5": [
              "value9",
            ],
          },
          "protocolVersion": "1.1",
          "uri": {
            "query": {
              "key": "value",
            },
          },
        }
      `);

      expect(serverRequestFactoryMocks.length).toBe(0);
      expect(uriFactoryMocks.length).toBe(0);
      expect(streamFromResourceFactoryMocks.length).toBe(0);
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

      const request = {
        body: stream,
        uri,
      } as ServerRequest;

      const uriFactoryMocks: FunctionMocks<UriFactory> = [
        { parameters: ['http://localhost:10080/api?key=value'], return: uri },
      ];

      const uriFactory = createFunctionMock(uriFactoryMocks);

      const serverRequestFactoryMocks: FunctionMocks<ServerRequestFactory> = [
        { parameters: [Method.GET, uri], return: request },
      ];

      const serverRequestFactory = createFunctionMock(serverRequestFactoryMocks);

      const streamFromResourceFactoryMocks: FunctionMocks<StreamFromResourceFactory> = [
        { parameters: [req], return: stream },
      ];

      const streamFromResourceFactory = createFunctionMock(streamFromResourceFactoryMocks);

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
      );

      const { body, ...rest } = nodeToServerRequestFactory(req);

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        {
          "headers": {
            "host": [
              "localhost:10080",
            ],
            "key1": [
              "value1",
            ],
            "key2": [
              "value2",
            ],
          },
          "protocolVersion": "1.1",
          "uri": {
            "query": {
              "key": "value",
            },
          },
        }
      `);

      expect(serverRequestFactoryMocks.length).toBe(0);
      expect(uriFactoryMocks.length).toBe(0);
      expect(streamFromResourceFactoryMocks.length).toBe(0);
    });

    test('with uriOptions = true, but missing related headers', () => {
      const req = {
        method: 'get',
        url: '/api?key=value',
        headers: {},
        httpVersion: '1.1',
      } as unknown as IncomingMessage;

      const uriFactory = createFunctionMock<UriFactory>([]);
      const serverRequestFactory = createFunctionMock<ServerRequestFactory>([]);
      const streamFromResourceFactory = createFunctionMock<StreamFromResourceFactory>([]);

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
        'forwarded',
      );

      expect(() => {
        nodeToServerRequestFactory(req);
      }).toThrow('Missing "x-forwarded-proto", "x-forwarded-host", "x-forwarded-port" header(s).');
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

      const request = {
        body: stream,
        uri,
      } as ServerRequest;

      const uriFactoryMocks: FunctionMocks<UriFactory> = [
        { parameters: ['https://localhost:10443/api?key=value'], return: uri },
      ];

      const uriFactory = createFunctionMock(uriFactoryMocks);

      const serverRequestFactoryMocks: FunctionMocks<ServerRequestFactory> = [
        { parameters: [Method.GET, uri], return: request },
      ];

      const serverRequestFactory = createFunctionMock(serverRequestFactoryMocks);

      const streamFromResourceFactoryMocks: FunctionMocks<StreamFromResourceFactory> = [
        { parameters: [req], return: stream },
      ];

      const streamFromResourceFactory = createFunctionMock(streamFromResourceFactoryMocks);

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
        'forwarded',
      );

      const { body, ...rest } = nodeToServerRequestFactory(req);

      expect(body).toBeInstanceOf(Stream);

      expect(rest).toMatchInlineSnapshot(`
        {
          "headers": {
            "x-forwarded-host": [
              "localhost",
            ],
            "x-forwarded-port": [
              "10443",
            ],
            "x-forwarded-proto": [
              "https",
            ],
          },
          "protocolVersion": "1.1",
          "uri": {
            "query": {
              "key": "value",
            },
          },
        }
      `);

      expect(serverRequestFactoryMocks.length).toBe(0);
      expect(uriFactoryMocks.length).toBe(0);
      expect(streamFromResourceFactoryMocks.length).toBe(0);
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

      const request = {
        body: stream,
        uri,
      } as ServerRequest;

      const uriFactoryMocks: FunctionMocks<UriFactory> = [{ parameters: ['https://localhost:10443/'], return: uri }];

      const uriFactory = createFunctionMock(uriFactoryMocks);

      const serverRequestFactoryMocks: FunctionMocks<ServerRequestFactory> = [
        { parameters: [Method.GET, uri], return: request },
      ];

      const serverRequestFactory = createFunctionMock(serverRequestFactoryMocks);

      const streamFromResourceFactoryMocks: FunctionMocks<StreamFromResourceFactory> = [
        { parameters: [req], return: stream },
      ];

      const streamFromResourceFactory = createFunctionMock(streamFromResourceFactoryMocks);

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
        {
          "headers": {},
          "protocolVersion": "1.1",
          "uri": {},
        }
      `);

      expect(serverRequestFactoryMocks.length).toBe(0);
      expect(uriFactoryMocks.length).toBe(0);
      expect(streamFromResourceFactoryMocks.length).toBe(0);
    });
  });

  test('createResponseToNodeEmitter', () => {
    const status = 200;
    const reasonPhrase = 'OK';
    const headers: OutgoingHttpHeaders = { 'content-type': ['application/json'] };

    const resMocks: ObjectMocks<ServerResponse> = [
      {
        name: 'writeHead',
        callback: ((
          givenStatusCode: number,
          givenStatusMessage?: string,
          givenHeaders?: OutgoingHttpHeaders,
        ): ServerResponse => {
          expect(givenStatusCode).toBe(status);
          expect(givenStatusMessage).toBe(reasonPhrase);
          expect(givenHeaders).toBe(headers);

          return res;
        }) as ServerResponse['writeHead'],
      },
    ];

    const res = createObjectMock(resMocks);

    const bodyMocks: ObjectMocks<Duplex> = [
      {
        name: 'pipe',
        callback: (<T extends WritableStream>(destination: T): Duplex => {
          expect(destination).toBe(res);

          return body;
        }) as NodeJS.ReadableStream['pipe'],
      },
    ];

    const body = createObjectMock(bodyMocks);

    const response = {
      status,
      reasonPhrase,
      headers,
      body,
    } as unknown as Response;

    const responseToNodeEmitter = createResponseToNodeEmitter();

    responseToNodeEmitter(response, res);

    expect(resMocks.length).toBe(0);
    expect(bodyMocks.length).toBe(0);
  });
});
