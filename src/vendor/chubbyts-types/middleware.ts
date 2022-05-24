import type { Response, ServerRequest } from './message';
import type { Handler } from './handler';

export type Middleware = (request: ServerRequest, handler: Handler) => Promise<Response>;
