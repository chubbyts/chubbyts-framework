import { createReadStream, existsSync } from 'fs';
import { Duplex, PassThrough, Stream } from 'stream';
import { Method, Query, Request, Response, ServerRequest, Uri } from '@chubbyts/chubbyts-http-types/dist/message';
import {
  RequestFactory,
  ResponseFactory,
  ServerRequestFactory,
  StreamFactory,
  StreamFromFileFactory,
  StreamFromResourceFactory,
  UriFactory,
} from '@chubbyts/chubbyts-http-types/dist/message-factory';
import { parse as queryParser } from 'qs';

export const createUriFactory = (): UriFactory => {
  return (uri: string): Uri => {
    const { protocol, username, password, hostname, port, pathname, search, hash } = new URL(uri);

    return {
      schema: protocol.substring(0, protocol.length - 1),
      userInfo: password !== '' ? username + ':' + password : username,
      host: hostname,
      port: port ? parseInt(port, 10) : undefined,
      path: pathname,
      query: search ? (queryParser(search.substring(1)) as Query) : {},
      fragment: hash ? hash.substring(1) : '',
    };
  };
};

export const createStreamFactory = (): StreamFactory => {
  return (content: string): Duplex => {
    const stream = new PassThrough();
    stream.write(content);

    return stream;
  };
};

export const createStreamFromResourceFactory = (): StreamFromResourceFactory => {
  return (stream: Stream): Duplex => {
    const newStream = new PassThrough();
    stream.pipe(newStream);

    return newStream;
  };
};

export const createStreamFromFileFactory = (
  streamFromResourceFactory: StreamFromResourceFactory = createStreamFromResourceFactory(),
): StreamFromFileFactory => {
  return (filename: string): Duplex => {
    if (!existsSync(filename)) {
      throw new Error(`File with filename: "${filename}" does not exists.`);
    }

    return streamFromResourceFactory(createReadStream(filename));
  };
};

export const createRequestFactory = (
  uriFactory: UriFactory = createUriFactory(),
  streamFactory: StreamFactory = createStreamFactory(),
): RequestFactory => {
  return (method: Method, uri: string | Uri): Request => {
    return {
      method,
      uri: typeof uri !== 'string' ? { ...uri } : uriFactory(uri),
      protocolVersion: '1.0',
      headers: {},
      body: streamFactory(''),
    };
  };
};

export const createServerRequestFactory = (
  requestFactory: RequestFactory = createRequestFactory(),
): ServerRequestFactory => {
  return (method: Method, uri: string | Uri): ServerRequest => {
    return {
      ...requestFactory(method, uri),
      attributes: {},
    };
  };
};

export const statusCodeMap = new Map([
  [100, 'Continue'],
  [101, 'Switching Protocols'],
  [102, 'Processing'],
  [103, 'Early Hints'],
  [110, 'Response is Stale'],
  [111, 'Revalidation Failed'],
  [112, 'Disconnected Operation'],
  [113, 'Heuristic Expiration'],
  [199, 'Miscellaneous Warning'],
  [200, 'OK'],
  [201, 'Created'],
  [202, 'Accepted'],
  [203, 'Non-Authoritative Information'],
  [204, 'No Content'],
  [205, 'Reset Content'],
  [206, 'Partial Content'],
  [207, 'Multi-Status'],
  [208, 'Already Reported'],
  [214, 'Transformation Applied'],
  [226, 'IM Used'],
  [299, 'Miscellaneous Persistent Warning'],
  [300, 'Multiple Choices'],
  [301, 'Moved Permanently'],
  [302, 'Found'],
  [303, 'See Other'],
  [304, 'Not Modified'],
  [305, 'Use Proxy'],
  [306, 'Switch Proxy'],
  [307, 'Temporary Redirect'],
  [308, 'Permanent Redirect'],
  [400, 'Bad Request'],
  [401, 'Unauthorized'],
  [402, 'Payment Required'],
  [403, 'Forbidden'],
  [404, 'Not Found'],
  [405, 'Method Not Allowed'],
  [406, 'Not Acceptable'],
  [407, 'Proxy Authentication Required'],
  [408, 'Request Timeout'],
  [409, 'Conflict'],
  [410, 'Gone'],
  [411, 'Length Required'],
  [412, 'Precondition Failed'],
  [413, 'Payload Too Large'],
  [414, 'URI Too Long'],
  [415, 'Unsupported Media Type'],
  [416, 'Range Not Satisfiable'],
  [417, 'Expectation Failed'],
  [418, "I'm a teapot"],
  [421, 'Misdirected Request'],
  [422, 'Unprocessable Entity'],
  [423, 'Locked'],
  [424, 'Failed Dependency'],
  [425, 'Too Early'],
  [426, 'Upgrade Required'],
  [428, 'Precondition Required'],
  [429, 'Too Many Requests'],
  [431, 'Request Header Fields Too Large'],
  [451, 'Unavailable For Legal Reasons'],
  [500, 'Internal Server Error'],
  [501, 'Not Implemented'],
  [502, 'Bad Gateway'],
  [503, 'Service Unavailable'],
  [504, 'Gateway Timeout'],
  [505, 'HTTP Version Not Supported'],
  [506, 'Variant Also Negotiates'],
  [507, 'Insufficient Storage'],
  [508, 'Loop Detected'],
  [510, 'Not Extended'],
  [511, 'Network Authentication Required'],
]);

export const createResponseFactory = (streamFactory: StreamFactory = createStreamFactory()): ResponseFactory => {
  return (status: number, reasonPhrase?: string): Response => {
    return {
      status,
      reasonPhrase: reasonPhrase ?? statusCodeMap.get(status) ?? '',
      protocolVersion: '1.0',
      headers: {},
      body: streamFactory(''),
    };
  };
};
