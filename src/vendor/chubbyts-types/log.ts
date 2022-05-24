export enum LogLevel {
  EMERGENCY = 'emergency',
  ALERT = 'alert',
  CRITICAL = 'critical',
  ERROR = 'error',
  WARNING = 'warning',
  NOTICE = 'notice',
  INFO = 'info',
  DEBUG = 'debug',
}

export type NamedLogFn = (message: string, context: Record<string, any>) => void;
export type LogFn = (level: LogLevel, message: string, context: Record<string, any>) => void;

export type Logger = {
  emergency: NamedLogFn;
  alert: NamedLogFn;
  critical: NamedLogFn;
  error: NamedLogFn;
  warning: NamedLogFn;
  notice: NamedLogFn;
  info: NamedLogFn;
  debug: NamedLogFn;
  log: LogFn;
};

export const createLogger = (log: LogFn = () => {}): Logger => {
  const emergency = (message: string, context: Record<string, any>) => {
    log(LogLevel.EMERGENCY, message, context);
  };

  const alert = (message: string, context: Record<string, any>) => {
    log(LogLevel.ALERT, message, context);
  };

  const critical = (message: string, context: Record<string, any>) => {
    log(LogLevel.CRITICAL, message, context);
  };

  const error = (message: string, context: Record<string, any>) => {
    log(LogLevel.ERROR, message, context);
  };

  const warning = (message: string, context: Record<string, any>) => {
    log(LogLevel.WARNING, message, context);
  };

  const notice = (message: string, context: Record<string, any>) => {
    log(LogLevel.NOTICE, message, context);
  };

  const info = (message: string, context: Record<string, any>) => {
    log(LogLevel.INFO, message, context);
  };

  const debug = (message: string, context: Record<string, any>) => {
    log(LogLevel.DEBUG, message, context);
  };

  return {
    emergency,
    alert,
    critical,
    error,
    warning,
    notice,
    info,
    debug,
    log,
  };
};
