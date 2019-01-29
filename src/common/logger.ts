import * as bunyan from 'bunyan';

export type Logger = bunyan;

export function createLogger(module: string): Logger {
  return bunyan.createLogger({
    name: module,
    level: 'trace',
  });
}
