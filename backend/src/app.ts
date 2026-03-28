import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';

/** Express app without listening or DB connection — used by server and tests. */
export function createApp(): express.Application {
  const app = express();

  app.use(
    cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', routes);
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
