import { ServerRequest } from '../vendor/chubbyts-types/message';
import { Route } from './route';

export type Match = (request: ServerRequest) => Route;
