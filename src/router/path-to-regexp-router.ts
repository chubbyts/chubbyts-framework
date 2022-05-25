import { Route } from './route';
import { Match } from './route-matcher';
import { Routes } from './routes';
import { Method, Query, ServerRequest } from '../vendor/chubbyts-types/message';
import { compile, match, MatchFunction, PathFunction } from 'path-to-regexp';
import { createMethodNotAllowed, createNotFound } from '../http-error';
import { GeneratePath, GenerateUrl } from './url-generator';
import { stringify } from 'qs';

export const createPathToRegexpRouteMatcher = (routes: Routes): Match => {
  const routesByName = routes();
  const matchersByName: Record<string, MatchFunction> = Object.fromEntries(
    Object.entries(routesByName).map(([name, route]) => [name, match(route.path)]),
  );

  return (request: ServerRequest): Route => {
    const method = request.method;
    const path = decodeURI(request.uri.path);

    const matchWithMethods: Array<Method> = [];

    for (const [name, route] of Object.entries(routesByName)) {
      const match = matchersByName[name] as MatchFunction;

      const matchedPath = match(path);

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
  const compilersByName: Record<string, PathFunction> = Object.fromEntries(
    Object.entries(routesByName).map(([name, route]) => [name, compile(route.path)]),
  );

  return (name: string, attributes?: Record<string, string>, query?: Query) => {
    const route = routesByName[name];

    if (undefined === route) {
      throw new Error(`Missing route: "${name}"`);
    }

    const compiler = compilersByName[name] as PathFunction;

    return compiler(attributes) + (undefined !== query ? '?' + stringify(query) : '');
  };
};

export const createPathToRegexpUrlGenerator = (generatePath: GeneratePath): GenerateUrl => {
  return (request: ServerRequest, name: string, attributes?: Record<string, string>, query?: Query) => {
    const { schema, userInfo, host, port } = request.uri;
    const path = generatePath(name, attributes, query);

    return schema + '://' + (userInfo ? userInfo + '@' : '') + host + (port ? ':' + port : '') + path;
  };
};
