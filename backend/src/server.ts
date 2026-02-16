import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { connectDB } from './config/database';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    const env = process.env.NODE_ENV || 'development';
    console.log('\n--- ServicePulse Backend ---');
    console.log(`Server:  OK  (port ${PORT}, ${env})`);
    console.log('DB:      OK  (MongoDB)');
    console.log('----------------------------\n');
    app.listen(PORT);
  } catch (err: any) {
    console.error('\n--- ServicePulse Backend ---');
    console.error('DB:      ERROR  (MongoDB)');
    console.error(`         ${err?.message || err}`);
    console.error('Server:  NOT STARTED (database connection required)\n');
    process.exit(1);
  }
}

startServer();
