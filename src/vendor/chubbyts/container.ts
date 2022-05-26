import { Container } from '@chubbyts/chubbyts-dic-types/dist/container';

export type Factory = (container: Container, existingFactory?: Factory) => unknown;

const createWrapperFactory = (existingFactory: Factory, newFactory: Factory): Factory => {
  return (container: Container) => newFactory(container, existingFactory);
};

export const createContainer = (
  factories: Map<string, Factory> = new Map(),
): Container & {
  sets: (factories: Map<string, Factory>) => void;
  set: (id: string, factory: Factory) => void;
} => {
  const storedFactories = new Map(factories);
  const storedServices = new Map<string, unknown>();

  const sets = (factories: Map<string, Factory>) => {
    factories.forEach((factory, id) => {
      set(id, factory);
    });
  };

  const set = (id: string, factory: Factory) => {
    storedServices.delete(id);
    storedFactories.set(id, createWrapperFactory(storedFactories.get(id) as Factory, factory));
  };

  const get = <T>(id: string): T => {
    if (!storedServices.has(id)) {
      storedServices.set(id, create<T>(id));
    }

    return storedServices.get(id) as T;
  };

  const has = (id: string): boolean => storedFactories.has(id);

  const container = {
    sets,
    set,
    get,
    has,
  };

  const create = <T>(id: string): T => {
    const factoryById = storedFactories.get(id) as Factory;

    if (!factoryById) {
      throw new Error(`There is no service with id "${id}"`);
    }

    try {
      return factoryById(container) as T;
    } catch (e) {
      throw new Error(`Could not create service with id "${id}"`);
    }
  };

  return container;
};
