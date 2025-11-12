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

A minimal, highly [performant][2] middleware [PSR-15][3] inspired function based micro framework built with as little complexity as possible, aimed primarily at those developers who want to understand all the vendors they use.

![Workflow](resources/workflow.svg "Workflow")

## Requirements

 * node: 20
 * [@chubbyts/chubbyts-dic-types][4]: ^2.0.1
 * [@chubbyts/chubbyts-http-error][5]: ^3.0.1
 * [@chubbyts/chubbyts-log-types][7]: ^3.0.1
 * [@chubbyts/chubbyts-throwable-to-error][8]: ^2.0.2
 * [@chubbyts/chubbyts-undici-server][9]: ^1.0.1

## Installation

Through [NPM](https://www.npmjs.com) as [@chubbyts/chubbyts-framework][1].

```sh
npm i \
  @chubbyts/chubbyts-framework-router-path-to-regexp@^3.0.0 \
  @chubbyts/chubbyts-framework@^3.0.1 \
  @chubbyts/chubbyts-undici-server@^1.0.1
```

## Usage

```ts
import { STATUS_CODES } from 'node:http';
import { createPathToRegexpRouteMatcher }
  from '@chubbyts/chubbyts-framework-router-path-to-regexp/dist/path-to-regexp-router';
import type { ServerRequest } from '@chubbyts/chubbyts-undici-server/dist/server';
import { Response } from '@chubbyts/chubbyts-undici-server/dist/server';
import { createApplication } from '@chubbyts/chubbyts-framework/dist/application';
import { createErrorMiddleware }
  from '@chubbyts/chubbyts-framework/dist/middleware/error-middleware';
import { createRouteMatcherMiddleware }
  from '@chubbyts/chubbyts-framework/dist/middleware/route-matcher-middleware';
import { createGetRoute } from '@chubbyts/chubbyts-framework/dist/router/route';
import { createRoutesByName } from '@chubbyts/chubbyts-framework/dist/router/routes-by-name';

const app = createApplication([
  createErrorMiddleware(true),
  createRouteMatcherMiddleware(
    createPathToRegexpRouteMatcher(
      createRoutesByName([
        createGetRoute({
          path: '/hello/:name',
          name: 'hello',
          handler: async (serverRequest: ServerRequest<{name: string}>): Promise<Response> => {
            return new Response(`Hello, ${serverRequest.attributes.name}`, {
              status: 200,
              statusText: STATUS_CODES[200],
              headers: {'content-type': 'text/plain'}
            });
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
npm i @chubbyts/chubbyts-undici-server-node@^1.0.0
```

Check the [Usage][10] section.

## Handler's / Middleware's

 * [@chubbyts/chubbyts-undici-api][20]
 * [@chubbyts/chubbyts-undici-cors][21]
 * [@chubbyts/chubbyts-undici-multipart][22]
 * [@chubbyts/chubbyts-undici-static-file][23]

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
[9]: https://www.npmjs.com/package/@chubbyts/chubbyts-undici-server

[10]: https://www.npmjs.com/package/@chubbyts/chubbyts-undici-server-node#Usage

[20]: https://www.npmjs.com/package/@chubbyts/chubbyts-undici-api
[21]: https://www.npmjs.com/package/@chubbyts/chubbyts-undici-cors
[22]: https://www.npmjs.com/package/@chubbyts/chubbyts-undici-multipart
[23]: https://www.npmjs.com/package/@chubbyts/chubbyts-undici-static-file

[30]: https://github.com/chubbyts/chubbyts-framework-skeleton
[31]: https://github.com/chubbyts/chubbyts-petstore

