import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { supabase } from './config/database';

dotenv.config();

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

async function logStartupStatus() {
  const env = process.env.NODE_ENV || 'development';
  console.log('\n--- ServicePulse Backend ---');
  console.log(`Server:  OK  (port ${PORT}, ${env})`);
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    console.log(`DB:      ${error ? 'ERROR' : 'OK'}  (Supabase)`);
    if (error) console.error(`         ${error.message}`);
  } catch (err: any) {
    console.log('DB:      ERROR  (Supabase)');
    console.error(`         ${err?.message || err}`);
  }
  console.log('----------------------------\n');
}

app.listen(PORT, () => {
  logStartupStatus();
});
