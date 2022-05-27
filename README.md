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

## Installation

Through [NPM](https://www.npmjs.com) as [@chubbyts/chubbyts-framework][1].

```ts
npm i \
  @chubbyts/chubbyts-framework-router-path-to-regexp@^1.0.0 \
  @chubbyts/chubbyts-framework@^1.0.3 \
  @chubbyts/chubbyts-http@^1.0.0
```

## Usage

```ts
import { createApplication } from '@chubbyts/chubbyts-framework/dist/application';
import { createErrorMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/error-middleware';
import { createRouteMatcherMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/route-matcher-middleware';
import { createGetRoute } from '@chubbyts/chubbyts-framework/dist/router/route';
import { createRoutesByName } from '@chubbyts/chubbyts-framework/dist/router/routes';
import {
  createServerRequestFactory,
  createStreamFromResourceFactory,
  createUriFactory,
  createResponseFactory,
} from '@chubbyts/chubbyts-http/dist/message-factory';
import { createPathToRegexpRouteMatcher } from '@chubbyts/chubbyts-framework-router-path-to-regexp/dist/path-to-regexp-router';
import { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { createNodeToServerRequestFactory, createResponseToNodeEmitter } from '@chubbyts/chubbyts-framework/dist/server/node-http';

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
