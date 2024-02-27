import {
  createNodeToServerRequestFactory as originalCreateNodeToServerRequestFactory,
  createResponseToNodeEmitter as originalCreateResponseToNodeEmitter,
} from '@chubbyts/chubbyts-http-node-bridge/dist/node-http';

/**
 * @deprecated use @chubbyts/chubbyts-http-node-bridge:createNodeToServerRequestFactory
 */
export const createNodeToServerRequestFactory = originalCreateNodeToServerRequestFactory;

/**
 * @deprecated use @chubbyts/chubbyts-http-node-bridge:createResponseToNodeEmitter
 */
export const createResponseToNodeEmitter = originalCreateResponseToNodeEmitter;
