import 'dotenv/config';
import { createServer as createHttpServer } from 'http';

import { createServer } from './server';
import { DBManager } from './services/db/DBManager';
import logger from './services/logger/logger';
import { attachSocketManager } from './services/socket/SocketManager';

const port = process.env.PORT;
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
  throw new Error('MONGO_URI environment variable is required');
}

/**
 * Entrypoint: Connects to DB and starts the server.
 */
(async () => {
  try {

    console.log('Connecting to MongoDB...');

    await DBManager.getInstance().connect(mongoUri);

    console.log('MongoDB connected successfully');

    const app = createServer();

    console.log('Starting server...');

    const httpServer = createHttpServer(app);

    console.log('Attaching Socket Manager...');

    attachSocketManager(httpServer);

    console.log(`Server is running on port ${port}`);

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
