import { Route } from './route';
import { Match } from './route-matcher';
import { Routes } from './routes';
import { Method, Query, ServerRequest } from '@chubbyts/chubbyts-http-types/dist/message';
import { compile, match, MatchFunction, PathFunction } from 'path-to-regexp';
import { createMethodNotAllowed, createNotFound } from '../http-error';
import { GeneratePath, GenerateUrl } from './url-generator';
import { stringify } from 'qs';

export const createPathToRegexpRouteMatcher = (routes: Routes): Match => {
  const routesByName = routes();
  const matchersByName: Map<string, MatchFunction> = new Map(
    Array.from(routesByName.entries()).map(([name, route]) => [name, match(route.path)]),
  );

  return (request: ServerRequest): Route => {
    const method = request.method;
    const path = decodeURI(request.uri.path);

    const matchWithMethods: Array<Method> = [];

    for (const [name, route] of routesByName.entries()) {
      const matcherByName = matchersByName.get(name) as MatchFunction;

      const matchedPath = matcherByName(path);

      if (!matchedPath) {
        continue;
      }

      const routeMethod = route.method;

      if (routeMethod === method) {
        return { ...route, attributes: matchedPath.params as Record<string, string> };
      }

      matchWithMethods.push(routeMethod);
    }

    if (matchWithMethods.length > 0) {
      throw createMethodNotAllowed(
        `Method "${method}" at path "${path}" is not allowed. Must be one of: "${matchWithMethods.join('", "')}".`,
      );
    }

    throw createNotFound(
      `The page "${path}" you are looking for could not be found. Check the address bar to ensure your URL is spelled correctly.`,
    );
  };
};

export const createPathToRegexpPathGenerator = (routes: Routes): GeneratePath => {
  const routesByName = routes();
  const compilesByName: Map<string, PathFunction> = new Map(
    Array.from(routesByName.entries()).map(([name, route]) => [name, compile(route.path)]),
  );

  return (name: string, attributes?: Record<string, string>, query?: Query) => {
    const route = routesByName.get(name);

    if (undefined === route) {
      throw new Error(`Missing route: "${name}"`);
    }

    const compileByName = compilesByName.get(name) as PathFunction;

    return compileByName(attributes) + (undefined !== query ? '?' + stringify(query) : '');
  };
};

export const createPathToRegexpUrlGenerator = (generatePath: GeneratePath): GenerateUrl => {
  return (request: ServerRequest, name: string, attributes?: Record<string, string>, query?: Query) => {
    const { schema, userInfo, host, port } = request.uri;
    const path = generatePath(name, attributes, query);

    return schema + '://' + (userInfo ? userInfo + '@' : '') + host + (port ? ':' + port : '') + path;
  };
};
