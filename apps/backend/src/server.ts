import { json, urlencoded } from 'body-parser';
import express, { Express } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { getCorsOptions } from './constants';

export const createServer = (): Express => {
  const app = express();

  app
    .disable('x-powered-by')
    .use(morgan('dev'))
    .use(cookieParser())
    .use(urlencoded({ extended: true }))
    .use(json())
    .use(cors(getCorsOptions()));

  return app;
};
