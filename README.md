# chubbyts-framework

[![CI](https://github.com/chubbyts/chubbyts-framework/workflows/CI/badge.svg?branch=master)](https://github.com/chubbyts/chubbyts-framework/actions?query=workflow%3ACI)
[![Coverage Status](https://coveralls.io/repos/github/chubbyts/chubbyts-framework/badge.svg?branch=master)](https://coveralls.io/github/chubbyts/chubbyts-framework?branch=master)
[![Mutation testing badge](https://img.shields.io/endpoint?style=flat&url=https%3A%2F%2Fbadge-api.stryker-mutator.io%2Fgithub.com%2Fchubbyts%2Fchubbyts-framework%2Fmaster)](https://dashboard.stryker-mutator.io/reports/github.com/chubbyts/chubbyts-framework/master)
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

 * node: 18
 * [@chubbyts/chubbyts-dic-types][4]: ^1.3.1
 * [@chubbyts/chubbyts-http-error][5]: ^2.4.1
 * [@chubbyts/chubbyts-http-types][6]: ^1.3.1
 * [@chubbyts/chubbyts-log-types][7]: ^1.4.3
 * [@chubbyts/chubbyts-throwable-to-error][8]: ^1.3.2

## Installation

Through [NPM](https://www.npmjs.com) as [@chubbyts/chubbyts-framework][1].

```sh
npm i \
  @chubbyts/chubbyts-framework-router-path-to-regexp@^1.5.1 \
  @chubbyts/chubbyts-framework@^1.10.1 \
  @chubbyts/chubbyts-http@^1.3.1
```

## Usage

### App

```ts
import { createApplication } from '@chubbyts/chubbyts-framework/dist/application';
import { createErrorMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/error-middleware';
import { createRouteMatcherMiddleware } from '@chubbyts/chubbyts-framework/dist/middleware/route-matcher-middleware';
import { createGetRoute } from '@chubbyts/chubbyts-framework/dist/router/route';
import { createRoutesByName } from '@chubbyts/chubbyts-framework/dist/router/routes-by-name';
import { createResponseFactory } from '@chubbyts/chubbyts-http/dist/message-factory';
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

            return {
              ...response,
              headers: { ...response.headers, 'content-type': ['text/plain'] }
            };
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
npm i @chubbyts/chubbyts-http-node-bridge@^1.3.1
```

Check the [Usage][10] section.

#### Uwebsockets

Running the application via the uwebsockets http implementation. Linux only. Faster than the node implemenation.

```sh
npm i @chubbyts/chubbyts-http-uwebsockets-bridge@^1.3.1
```

Check the [Usage][11] section.

## Libraries

 * [@chubbyts/chubbyts-api][20]
 * [@chubbyts/chubbyts-decode-encode][21]
 * [@chubbyts/chubbyts-dic][22]
 * [@chubbyts/chubbyts-dic-config][23]
 * [@chubbyts/chubbyts-http-cors][24]
 * [@chubbyts/chubbyts-http-multipart][25]
 * [@chubbyts/chubbyts-http-static-file][26]
 * [@chubbyts/chubbyts-negotiation][27]

## Skeleton

 * [chubbyts/chubbyts-framework-skeleton][30]
 * [chubbyts/chubbyts-petstore][31]

## Copyright

2025 Dominik Zogg

[1]: https://www.npmjs.com/package/@chubbyts/chubbyts-framework
[2]: https://web-frameworks-benchmark.netlify.app/result
[3]: https://www.php-fig.org/psr/psr-15/#2-interfaces
[4]: https://www.npmjs.com/package/@chubbyts/chubbyts-dic-types
[5]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-error
[6]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-types
[7]: https://www.npmjs.com/package/@chubbyts/chubbyts-log-types
[8]: https://www.npmjs.com/package/@chubbyts/chubbyts-throwable-to-error

[10]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-node-bridge#usage
[11]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-uwebsockets-bridge#usage

[20]: https://www.npmjs.com/package/@chubbyts/chubbyts-api
[21]: https://www.npmjs.com/package/@chubbyts/chubbyts-decode-encode
[22]: https://www.npmjs.com/package/@chubbyts/chubbyts-dic
[23]: https://www.npmjs.com/package/@chubbyts/chubbyts-dic-config
[24]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-cors
[25]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-multipart
[26]: https://www.npmjs.com/package/@chubbyts/chubbyts-http-static-file
[27]: https://www.npmjs.com/package/@chubbyts/chubbyts-negotiation

[30]: https://github.com/chubbyts/chubbyts-framework-skeleton
[31]: https://github.com/chubbyts/chubbyts-petstore
