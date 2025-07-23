import { json, urlencoded } from 'body-parser';
import express, { Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import routes from './routes';

export const createServer = (): Express => {
  const app = express();
  app
    .disable('x-powered-by')
    .use(morgan('dev'))
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors())
    .use('/api', routes);

  return app;
};
