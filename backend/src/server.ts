import './config/load-env.js';
import { connectDatabase } from './config/database.js';
import { getEnv } from './config/env.js';
import { createApp } from './app.js';
import { seedAdminUser } from './modules/auth/auth.service.js';
import { logger } from './shared/logger/logger.js';

const start = async (): Promise<void> => {
  const env = getEnv();
  const dbOk = await connectDatabase();
  if (dbOk) {
    await seedAdminUser();
  }

  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, mongo: dbOk }, 'API listening');
  });
};

void start().catch((err: unknown) => {
  logger.error({ err }, 'Failed to start API');
  process.exit(1);
});
