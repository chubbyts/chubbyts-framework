import type { IncomingMessage, ServerResponse, OutgoingHttpHeaders, IncomingHttpHeaders } from 'http';
import type { Duplex } from 'stream';
import { describe, expect, test } from '@jest/globals';
import type { Response, ServerRequest, Uri } from '@chubbyts/chubbyts-http-types/dist/message';
import { Method } from '@chubbyts/chubbyts-http-types/dist/message';
import type {
  ServerRequestFactory,
  StreamFromResourceFactory,
  UriFactory,
} from '@chubbyts/chubbyts-http-types/dist/message-factory';
import { useFunctionMock } from '@chubbyts/chubbyts-function-mock/dist/function-mock';
import { createResponseToNodeEmitter, createNodeToServerRequestFactory } from '../../src/server/node-http';

describe('http-node', () => {
  describe('createNodeToServerRequestFactory', () => {
    test('with method url', () => {
      const req = {} as IncomingMessage;

      const [uriFactory, uriFactoryMocks] = useFunctionMock<UriFactory>([]);
      const [serverRequestFactory, serverRequestFactoryMocks] = useFunctionMock<ServerRequestFactory>([]);
      const [streamFromResourceFactory, streamFromResourceFactoryMocks] = useFunctionMock<StreamFromResourceFactory>(
        [],
      );

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
      );

      expect(() => {
        nodeToServerRequestFactory(req);
      }).toThrow('Method missing');

      expect(uriFactoryMocks.length).toBe(0);
      expect(serverRequestFactoryMocks.length).toBe(0);
      expect(streamFromResourceFactoryMocks.length).toBe(0);
    });

    test('with url method', () => {
      const req = { method: 'get' } as IncomingMessage;

      const [uriFactory, uriFactoryMocks] = useFunctionMock<UriFactory>([]);
      const [serverRequestFactory, serverRequestFactoryMocks] = useFunctionMock<ServerRequestFactory>([]);
      const [streamFromResourceFactory, streamFromResourceFactoryMocks] = useFunctionMock<StreamFromResourceFactory>(
        [],
      );

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
      );

      expect(() => {
        nodeToServerRequestFactory(req);
      }).toThrow('Url missing');

      expect(uriFactoryMocks.length).toBe(0);
      expect(serverRequestFactoryMocks.length).toBe(0);
      expect(streamFromResourceFactoryMocks.length).toBe(0);
    });

    test('without uriOptions and without host', () => {
      const reqMethod = 'get';
      const reqUrl = '/api?key=value';
      const reqHeaders: IncomingHttpHeaders = {
        key1: '   value1',
        key2: ['value2     '],
        key3: 'value3,value4',
        key4: ['value5, value6  ', ' value7, value8 '],
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        key5: [undefined, 'value9'],
        key6: undefined,
      };

      const req = { method: reqMethod, url: reqUrl, headers: reqHeaders, httpVersion: '1.1' } as IncomingMessage;

      const uri = {
        query: { key: 'value' },
      } as unknown as Uri;

      const requestBody = {} as Duplex;

      const request = {
        body: {},
        uri,
      } as ServerRequest;

      const [uriFactory, uriFactoryMocks] = useFunctionMock<UriFactory>([
        { parameters: ['http://localhost/api?key=value'], return: uri },
      ]);

      const [serverRequestFactory, serverRequestFactoryMocks] = useFunctionMock<ServerRequestFactory>([
        { parameters: [Method.GET, uri], return: request },
      ]);

      const [streamFromResourceFactory, streamFromResourceFactoryMocks] = useFunctionMock<StreamFromResourceFactory>([
        { parameters: [req], return: requestBody },
      ]);

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
      );

      const { body, ...rest } = nodeToServerRequestFactory(req);

      expect(body).toBe(requestBody);

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
      const reqMethod = 'get';
      const reqUrl = '/api?key=value';
      const reqHeaders: IncomingHttpHeaders = { host: 'localhost:10080', key1: 'value1', key2: ['value2'] };

      const req = { method: reqMethod, url: reqUrl, headers: reqHeaders, httpVersion: '1.1' } as IncomingMessage;

      const uri = {
        query: { key: 'value' },
      } as unknown as Uri;

      const requestBody = {} as Duplex;

      const request = {
        body: requestBody,
        uri,
      } as ServerRequest;

      const [uriFactory, uriFactoryMocks] = useFunctionMock<UriFactory>([
        { parameters: ['http://localhost:10080/api?key=value'], return: uri },
      ]);

      const [serverRequestFactory, serverRequestFactoryMocks] = useFunctionMock<ServerRequestFactory>([
        { parameters: [Method.GET, uri], return: request },
      ]);

      const [streamFromResourceFactory, streamFromResourceFactoryMocks] = useFunctionMock<StreamFromResourceFactory>([
        { parameters: [req], return: requestBody },
      ]);

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
      );

      expect(nodeToServerRequestFactory(req)).toMatchInlineSnapshot(`
        {
          "body": {},
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
      const reqMethod = 'get';
      const reqUrl = '/api?key=value';
      const reqHeaders: IncomingHttpHeaders = {};

      const req = { method: reqMethod, url: reqUrl, headers: reqHeaders } as IncomingMessage;

      const [uriFactory, uriFactoryMocks] = useFunctionMock<UriFactory>([]);
      const [serverRequestFactory, serverRequestFactoryMocks] = useFunctionMock<ServerRequestFactory>([]);
      const [streamFromResourceFactory, streamFromResourceFactoryMocks] = useFunctionMock<StreamFromResourceFactory>(
        [],
      );

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
        'forwarded',
      );

      expect(() => {
        nodeToServerRequestFactory(req);
      }).toThrow('Missing "x-forwarded-proto", "x-forwarded-host", "x-forwarded-port" header(s).');

      expect(serverRequestFactoryMocks.length).toBe(0);
      expect(uriFactoryMocks.length).toBe(0);
      expect(streamFromResourceFactoryMocks.length).toBe(0);
    });

    test('with uriOptions = true', () => {
      const reqMethod = 'get';
      const reqUrl = '/api?key=value';
      const reqHeaders: IncomingHttpHeaders = {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'localhost',
        'x-forwarded-port': '10443',
      };

      const req = { method: reqMethod, url: reqUrl, headers: reqHeaders, httpVersion: '1.1' } as IncomingMessage;

      const uri = {
        query: { key: 'value' },
      } as unknown as Uri;

      const requestBody = {} as Duplex;

      const request = {
        body: requestBody,
        uri,
      } as ServerRequest;

      const [uriFactory, uriFactoryMocks] = useFunctionMock<UriFactory>([
        { parameters: ['https://localhost:10443/api?key=value'], return: uri },
      ]);

      const [serverRequestFactory, serverRequestFactoryMocks] = useFunctionMock<ServerRequestFactory>([
        { parameters: [Method.GET, uri], return: request },
      ]);

      const [streamFromResourceFactory, streamFromResourceFactoryMocks] = useFunctionMock<StreamFromResourceFactory>([
        { parameters: [req], return: requestBody },
      ]);

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
        'forwarded',
      );

      expect(nodeToServerRequestFactory(req)).toMatchInlineSnapshot(`
        {
          "body": {},
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
      const reqMethod = 'get';
      const reqUrl = '/';
      const reqHeaders: IncomingHttpHeaders = {};

      const req = { method: reqMethod, url: reqUrl, headers: reqHeaders, httpVersion: '1.1' } as IncomingMessage;

      const uri = {} as Uri;

      const requestBody = {} as Duplex;

      const request = {
        body: requestBody,
        uri,
      } as ServerRequest;

      const [uriFactory, uriFactoryMocks] = useFunctionMock<UriFactory>([
        { parameters: ['https://localhost:10443/'], return: uri },
      ]);

      const [serverRequestFactory, serverRequestFactoryMocks] = useFunctionMock<ServerRequestFactory>([
        { parameters: [Method.GET, uri], return: request },
      ]);

      const [streamFromResourceFactory, streamFromResourceFactoryMocks] = useFunctionMock<StreamFromResourceFactory>([
        { parameters: [req], return: requestBody },
      ]);

      const nodeToServerRequestFactory = createNodeToServerRequestFactory(
        uriFactory,
        serverRequestFactory,
        streamFromResourceFactory,
        {
          schema: 'https',
          host: 'localhost:10443',
        },
      );

      expect(nodeToServerRequestFactory(req)).toMatchInlineSnapshot(`
        {
          "body": {},
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

    const writeHead = jest.fn(
      (givenStatusCode: number, givenStatusMessage?: string, givenHeaders?: OutgoingHttpHeaders): ServerResponse => {
        expect(givenStatusCode).toBe(status);
        expect(givenStatusMessage).toBe(reasonPhrase);
        expect(givenHeaders).toBe(headers);

        return res;
      },
    );

    const res = {
      writeHead,
    } as unknown as ServerResponse;

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

    expect(writeHead).toBeCalledTimes(1);
    expect(pipe).toBeCalledTimes(1);
  });
});
