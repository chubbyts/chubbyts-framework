import type { Duplex, Stream } from 'stream';
import type { Method, Request, Response, ServerRequest, Uri } from './message';

export type UriFactory = (uri: string) => Uri;

export type StreamFactory = (content: string) => Duplex;
export type StreamFromResourceFactory = (stream: Stream) => Duplex;
export type StreamFromFileFactory = (filename: string) => Duplex;

export type RequestFactory = (method: Method, uri: string | Uri) => Request;

export type ServerRequestFactory = (method: Method, uri: string | Uri) => ServerRequest;

export type ResponseFactory = (status: number, reasonPhrase?: string) => Response;
