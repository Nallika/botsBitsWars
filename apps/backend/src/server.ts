import { json, urlencoded } from 'body-parser';
import express, { Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes';
import { getCorsOptions } from './constants';

export const createServer = (): Express => {
  const app = express();

  app
    .disable('x-powered-by')
    .use(morgan('dev'))
    .use(cookieParser())
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors(getCorsOptions()))
    .use('/api', routes);

  return app;
};
