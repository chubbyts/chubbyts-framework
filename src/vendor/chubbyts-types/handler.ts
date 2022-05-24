import type { Response, ServerRequest } from './message';

export type Handler = (request: ServerRequest) => Promise<Response>;
