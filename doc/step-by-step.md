# Step by step:

## Create a response factory.

```ts
const responseFactory = createResponseFactory();
```

This code line initializes a response factory using `createResponseFactory` from the `@chubbyts/chubbyts-http` package to generate HTTP responses.

## Create an error middleware

```ts
const errorMiddleware = createErrorMiddleware(responseFactory, true);
```

This line of code initializes an error middleware to catch any errors using `createErrorMiddleware`. It takes a response factory and a boolean parameter indicating whether to include error details in the response.

## Create a route

```ts
const route = createGetRoute({
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
});
```

This line of code constructs a `GET` route using `createGetRoute`. It requires an options object as a parameter, which must include the route path, name, and handler (controller).

## Create a map of routes by their names

```ts
const routesByName = createRoutesByName([route]);
```

This line of code generates a map of routes indexed by their names using `createRoutesByName`. It accepts an array of routes as input.

## Create a route matcher

```ts
const pathToRegexpRouteMatcher = createPathToRegexpRouteMatcher(routesByName);
```

This line of code constructs a router based on `path-to-regexp` using `createPathToRegexpRouteMatcher`. It requires a Map of routes indexed by name.

## Create a route matcher middleware

```ts
const routeMatcherMiddleware = createRouteMatcherMiddleware(pathToRegexpRouteMatcher);
```

This line of code generates a route matcher middleware using `createRouteMatcherMiddleware`. It requires a route matcher as input.

## Create an application

```ts
const app = createApplication([ errorMiddleware, routeMatcherMiddleware ]);
```

This line of code initializes an application that composes middlewares using `createApplication`. It requires an array of middlewares as its argument.
