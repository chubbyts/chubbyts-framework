import {
  createNodeToServerRequestFactory as originalCreateNodeToServerRequestFactory,
  createResponseToNodeEmitter as originalCreateResponseToNodeEmitter,
} from '@chubbyts/chubbyts-node-http-bridge/dist/node-http';

/**
 * @deprecated use @chubbyts/chubbyts-node-http-bridge:createNodeToServerRequestFactory
 */
export const createNodeToServerRequestFactory = originalCreateNodeToServerRequestFactory;

/**
 * @deprecated use @chubbyts/chubbyts-node-http-bridge:createResponseToNodeEmitter
 */
export const createResponseToNodeEmitter = originalCreateResponseToNodeEmitter;
