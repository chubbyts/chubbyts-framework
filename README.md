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

![Workflow](resources/workflow.svg "Workflow")

## Requirements

 * node: 14
 * [@chubbyts/chubbyts-dic-types][4]: ^1.0.0
 * [@chubbyts/chubbyts-http-error][5]: ^1.0.0 || ^2.0.1
 * [@chubbyts/chubbyts-http-types][6]: ^1.0.0
 * [@chubbyts/chubbyts-log-types][7]: ^1.0.0
 * [@chubbyts/chubbyts-throwable-to-error][8]: ^1.0.0

## Installation

Through [NPM](https://www.npmjs.com) as [@chubbyts/chubbyts-framework][1].

```sh
npm i \
  @chubbyts/chubbyts-framework-router-path-to-regexp@^1.2.0 \
  @chubbyts/chubbyts-framework@^1.6.3 \
  @chubbyts/chubbyts-http@^1.0.0
```

## Usage

### App

```ts
import { createApplication } from '@chubbyts/chubbyts-framework/dist/application';
import { createErrorMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/error-middleware';
import { createRouteMatcherMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/route-matcher-middleware';
import { createGetRoute } from '@chubbyts/chubbyts-framework/dist/router/route';
import { createRoutesByName } from '@chubbyts/chubbyts-framework/dist/router/routes-by-name';
import {
  createServerRequestFactory,
  createStreamFromResourceFactory,
  createUriFactory,
  createResponseFactory,
} from '@chubbyts/chubbyts-http/dist/message-factory';
import { createPathToRegexpRouteMatcher } from '@chubbyts/chubbyts-framework-router-path-to-regexp/dist/path-to-regexp-router';
import { Response, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';

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

            return { ...response, headers: { ...response.headers, 'content-type': ['text/plain'] } };
          },
        }),
      ]),
    ),
  ),
]);
```

### Server

#### Node

Running the application via the standard node http implementation.

```sh
npm i @chubbyts/chubbyts-node-http-bridge@^1.0.0
```

Check the [Usage][10] section.

#### Uwebsockets

Running the application via the uwebsockets http implementation. Linux only. Faster than the node implemenation.

```sh
npm i @chubbyts/chubbyts-uwebsockets-http-bridge@^1.0.2
```

Check the [Usage][11] section.

## Skeleton

 * [chubbyts/chubbyts-framework-skeleton][20]
 * [chubbyts/chubbyts-petstore][21]

## Copyright

Dominik Zogg 2022

[1]: https://www.npmjs.com/package/@chubbyts/chubbyts-framework
[2]: https://web-frameworks-benchmark.netlify.app/result
[3]: https://www.php-fig.org/psr/psr-15/#2-interfaces
[4]: https://www.npmjs.com/package/@chubbyts/chubbyts-dic-types
[5]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-error
[6]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-types
[7]: https://www.npmjs.com/package/@chubbyts/chubbyts-log-types
[8]: https://www.npmjs.com/package/@chubbyts/chubbyts-throwable-to-error

[10]: https://www.npmjs.com/package/@chubbyts/chubbyts-node-http-bridge#usage
[11]: https://www.npmjs.com/package/@chubbyts/chubbyts-uwebsockets-http-bridge#usage

[20]: https://github.com/chubbyts/chubbyts-framework-skeleton
[21]: https://github.com/chubbyts/chubbyts-petstore
