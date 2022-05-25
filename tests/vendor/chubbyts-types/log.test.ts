import { describe, expect, test } from '@jest/globals';
import { createLogger, LogFn, LogLevel } from '../../../src/vendor/chubbyts-types/log';

describe('log', () => {
  test('createLogger', () => {
    const logEntries: Array<{ level: LogLevel; message: string; context: Record<string, unknown> }> = [];

    const log: LogFn = jest.fn((level: LogLevel, message: string, context: Record<string, unknown>) => {
      logEntries.push({ level, message, context });
    });

    const logger = createLogger(log);
    logger.emergency('emergency', { key: 'value' });
    logger.alert('alert', { key: 'value' });
    logger.critical('critical', { key: 'value' });
    logger.error('error', { key: 'value' });
    logger.warning('warning', { key: 'value' });
    logger.notice('notice', { key: 'value' });
    logger.info('info', { key: 'value' });
    logger.debug('debug', { key: 'value' });

    expect(log).toHaveBeenCalledTimes(8);

    expect(logEntries).toMatchInlineSnapshot(`
      Array [
        Object {
          "context": Object {
            "key": "value",
          },
          "level": "emergency",
          "message": "emergency",
        },
        Object {
          "context": Object {
            "key": "value",
          },
          "level": "alert",
          "message": "alert",
        },
        Object {
          "context": Object {
            "key": "value",
          },
          "level": "critical",
          "message": "critical",
        },
        Object {
          "context": Object {
            "key": "value",
          },
          "level": "error",
          "message": "error",
        },
        Object {
          "context": Object {
            "key": "value",
          },
          "level": "warning",
          "message": "warning",
        },
        Object {
          "context": Object {
            "key": "value",
          },
          "level": "notice",
          "message": "notice",
        },
        Object {
          "context": Object {
            "key": "value",
          },
          "level": "info",
          "message": "info",
        },
        Object {
          "context": Object {
            "key": "value",
          },
          "level": "debug",
          "message": "debug",
        },
      ]
    `);
  });
});
