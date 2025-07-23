import 'dotenv/config';
import { createServer } from './server';
import { DBManager } from './utils/DBManager';
import logger from './utils/logger';

const port = process.env.PORT || 3001;
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error('MONGO_URI environment variable is required');
}

/**
 * Entrypoint: Connects to DB and starts the server.
 */
(async () => {
  try {
    await DBManager.getInstance().connect(mongoUri);

    const server = createServer();
    server.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (err: any) {
    logger.error('Failed to start server: %s', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
