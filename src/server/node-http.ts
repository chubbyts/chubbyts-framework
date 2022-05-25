import { ServerResponse } from 'http';
import { IncomingMessage } from 'http';
import { Method, Response, ServerRequest } from '../vendor/chubbyts-types/message';
import { ServerRequestFactory, StreamFromResourceFactory, UriFactory } from '../vendor/chubbyts-types/message-factory';

type UriOptions = { schema: 'http' | 'https'; host?: string } | boolean;

const getUri = (req: IncomingMessage, uriOptions: UriOptions): string => {
  if (!req.url) {
    throw new Error('Url missing');
  }

  if (true === uriOptions) {
    const missingHeaders = ['x-forwarded-proto', 'x-forwarded-host', 'x-forwarded-port'].filter(
      (header) => !req.headers[header],
    );

    if (missingHeaders.length > 0) {
      throw new Error(`Missing "${missingHeaders.join('", "')}" header(s).`);
    }

    return (
      req.headers['x-forwarded-proto'] +
      '://' +
      req.headers['x-forwarded-host'] +
      ':' +
      req.headers['x-forwarded-port'] +
      req.url
    );
  }

  const schema = typeof uriOptions === 'object' ? uriOptions.schema : 'http';

  const host =
    typeof uriOptions === 'object' && uriOptions.host
      ? uriOptions.host
      : req.headers.host
      ? req.headers.host
      : 'localhost';

  return schema + '://' + host + req.url;
};

type NodeToServerRequestFactory = (req: IncomingMessage) => ServerRequest;

export const createNodeToServerRequestFactory = (
  uriFactory: UriFactory,
  serverRequestFactory: ServerRequestFactory,
  streamFromResourceFactory: StreamFromResourceFactory,
  uriOptions: UriOptions = false,
): NodeToServerRequestFactory => {
  return (req: IncomingMessage): ServerRequest => {
    if (!req.method) {
      throw new Error('Method missing');
    }

    const uri = uriFactory(getUri(req, uriOptions));

    const headers = Object.fromEntries(
      Object.entries(req.headers)
        .filter(([_, value]) => value !== undefined)
        .map(([name, value]) => [name, Array.isArray(value) ? value : [value]]),
    ) as Record<string, Array<string>>;

    return {
      ...serverRequestFactory(req.method.toUpperCase() as Method, uri),
      protocolVersion: req.httpVersion,
      body: streamFromResourceFactory(req),
      headers,
    };
  };
};

type ResponseToNodeEmitter = (response: Response, res: ServerResponse) => void;

export const createResponseToNodeEmitter = (): ResponseToNodeEmitter => {
  return (response: Response, res: ServerResponse): void => {
    res.writeHead(response.status, response.reasonPhrase, response.headers);
    response.body.pipe(res);
  };
};
