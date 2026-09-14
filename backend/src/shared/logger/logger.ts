import pino from 'pino';
import { getEnv } from '../../config/env.js';

const createRootLogger = (): pino.Logger => {
  const env = getEnv();
  return pino({
    level: env.LOG_LEVEL,
    base: { service: 'best-in-flights-booking-api' },
  });
};

export const logger = createRootLogger();

export const createModuleLogger = (module: string): pino.Logger => {
  return logger.child({ module });
};
