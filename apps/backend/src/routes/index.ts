import express from 'express';
import chatRoutes from './chat';
import authRoutes from './auth';

const routes = express.Router();

routes.use('/auth', authRoutes);
routes.use('/chat', chatRoutes);

export default routes;
