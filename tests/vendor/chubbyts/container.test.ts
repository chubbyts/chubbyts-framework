import { describe, expect, test } from '@jest/globals';
import { createContainer, Factory } from '../../../src/vendor/chubbyts/container';
import { Container } from '@chubbyts/chubbyts-dic-types/dist/container';

describe('container', () => {
  describe('createContainer', () => {
    test('sets with two services', () => {
      const service1 = { _service: 'Service1' };
      const service2 = { _service: 'Service2' };

      const factory1 = () => service1;
      const factory2 = () => service2;

      const container = createContainer();
      container.sets(
        new Map([
          ['service1', factory1],
          ['service2', factory2],
        ]),
      );

      expect(container.has('service1')).toBe(true);
      expect(container.has('service2')).toBe(true);
      expect(container.has('service3')).toBe(false);

      expect(container.get('service1')).toBe(service1);
      expect(container.get('service2')).toBe(service2);
    });

    test('set with replaced service', () => {
      const container = createContainer();

      container.set('service', () => {
        return { key1: 'value1' };
      });

      container.set('service', () => {
        return { key2: 'value2' };
      });

      expect(container.get('service')).toMatchInlineSnapshot(`
        Object {
          "key2": "value2",
        }
      `);
    });

    test('set with extended service', () => {
      const container = createContainer();

      container.set('service', () => {
        return { key1: 'value1' };
      });

      expect(container.get('service')).toMatchInlineSnapshot(`
        Object {
          "key1": "value1",
        }
      `);

      container.set('service', (container: Container, existingFactory?: Factory) => {
        return {
          ...((existingFactory as Factory)(container) as { key1: 'string' }),
          key2: 'value2',
        };
      });

      const service1 = container.get('service');
      const service2 = container.get('service');

      expect(service1).toBe(service2);

      expect(service1).toMatchInlineSnapshot(`
        Object {
          "key1": "value1",
          "key2": "value2",
        }
      `);
    });

    test('get with unknown service', () => {
      const container = createContainer();

      expect(() => {
        container.get('service');
      }).toThrow('There is no service with id "service"');
    });

    test('get with service which throw erron on creation', () => {
      const error = new Error('unknown');

      const container = createContainer();

      container.set('service', () => {
        throw error;
      });

      expect(() => {
        container.get('service');
      }).toThrow('Could not create service with id "service"');
    });
  });
});
