import 'dotenv/config';
import { createServer as createHttpServer } from 'http';

import { createServer } from './server';
import { DBManager } from './services/db/DBManager';
import logger from './services/logger/logger';

const port = process.env.PORT!;
const mongoUri = process.env.MONGO_URI!;

/**
 * Entrypoint: Connects to DB and starts the server.
 */
(async () => {
  try {
    await DBManager.getInstance().connect(mongoUri);

    const app = createServer();
    const httpServer = createHttpServer(app);

    httpServer.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });
  } catch (err: any) {
    logger.error(
      'Failed to start server: %s',
      err && err.message ? err.message : err
    );
    process.exit(1);
  }
})();
