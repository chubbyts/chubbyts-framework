# chubbyts-framework

[![CI](https://github.com/chubbyts/chubbyts-framework/workflows/CI/badge.svg?branch=master)](https://github.com/chubbyts/chubbyts-framework/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/chubbyts/chubbyts-framework/badge.svg?branch=master)](https://coveralls.io/github/chubbyts/chubbyts-framework?branch=master)
[![Infection MSI](https://badge.stryker-mutator.io/github.com/chubbyts/chubbyts-framework/master)](https://dashboard.stryker-mutator.io/reports/github.com/chubbyts/chubbyts-framework/master)
[![npm-version](https://img.shields.io/npm/v/@chubbyts/chubbyts-framework.svg)](https://www.npmjs.com/package/@chubbyts/chubbyts-framework)

[![bugs](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-framework&metric=bugs)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-framework)
[![code_smells](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-framework&metric=code_smells)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-framework)
[![coverage](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-framework&metric=coverage)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-framework)
[![duplicated_lines_density](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-framework&metric=duplicated_lines_density)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-framework)
[![ncloc](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-framework&metric=ncloc)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-framework)
[![sqale_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-framework&metric=sqale_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-framework)
[![alert_status](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-framework&metric=alert_status)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-framework)
[![reliability_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-framework&metric=reliability_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-framework)
[![security_rating](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-framework&metric=security_rating)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-framework)
[![sqale_index](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-framework&metric=sqale_index)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-framework)
[![vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=chubbyts_chubbyts-framework&metric=vulnerabilities)](https://sonarcloud.io/dashboard?id=chubbyts_chubbyts-framework)

## Description

A minimal, highly [performant][2] middleware [PSR-15][3] inspired function based microframework built with as little complexity as possible, aimed primarily at those developers who want to understand all the vendors they use.

## Requirements

 * node: 14
 * [chubbyts/chubbyts-dic-types][4]: ^1.0.0
 * [chubbyts/chubbyts-http-types][5]: ^1.0.0
 * [chubbyts/chubbyts-log-types][6]: ^1.0.0
 * [path-to-regexp][7]: ^6.2.1
 * [qs][8]: ^6.10.3

## Installation

Through [NPM](https://www.npmjs.com) as [@chubbyjs/chubbyts-framework][1].

```ts
npm i @chubbyts/chubbyts-framework
```

## Usage

```ts
import { createApplication } from './application';
import { createErrorMiddleware } from './middleware/error-middleware';
import { createRouteMatcherMiddleware } from './middleware/route-matcher-middleware';
import { createGetRoute } from './router/route';
import { createRoutesByName } from './router/routes';
import {
  createServerRequestFactory,
  createStreamFromResourceFactory,
  createUriFactory,
  createResponseFactory,
} from './vendor/chubbyts/message-factory';
import { createPathToRegexpRouteMatcher } from './router/path-to-regexp-router';
import { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { createNodeToServerRequestFactory, createResponseToNodeEmitter } from './server/node-http';

const responseFactory = createResponseFactory();

const app = createApplication([
  createErrorMiddleware(responseFactory, true),
  createRouteMatcherMiddleware(
    createPathToRegexpRouteMatcher(
      createRoutesByName([
        createGetRoute({
          path: '/hello/:name([a-z]+)',
          name: 'hello',
          handler: async (request: ServerRequest): Promise<Response> => {
            const response = responseFactory(200);
            response.body.end(`Hello, ${request.attributes.name}`);

            return { ...response, headers: { ...response.headers, 'content-type': ['text/html'] } };
          },
        }),
      ]),
    ),
    responseFactory,
  ),
]);

const nodeToServerRequestFactory = createNodeToServerRequestFactory(
  createUriFactory(),
  createServerRequestFactory(),
  createStreamFromResourceFactory(),
);

const responseToNodeEmitter = createResponseToNodeEmitter();

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
  responseToNodeEmitter(await app(nodeToServerRequestFactory(req)), res);
});

const host = '0.0.0.0';
const port = 8080;

server.listen(port, host, () => {
  console.log(`Listening to ${host}:${port}`);
});
```

## Copyright

Dominik Zogg 2022

[1]: https://www.npmjs.com/package/@chubbyts/chubbyts-framework
[2]: https://web-frameworks-benchmark.netlify.app/result
[3]: https://www.php-fig.org/psr/psr-15
[4]: https://www.npmjs.com/package/@chubbyts/chubbyts-dic-types
[5]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-types
[6]: https://www.npmjs.com/package/@chubbyts/chubbyts-log-types
[7]: https://www.npmjs.com/package/path-to-regexp
[8]: https://www.npmjs.com/package/qs
