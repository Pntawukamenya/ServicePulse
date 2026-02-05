import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY;

// Validate Supabase configuration
if (!supabaseUrl || supabaseUrl === 'your_supabase_url' || !supabaseUrl.startsWith('http')) {
  console.error('\n❌ Supabase configuration error:');
  console.error('Please set SUPABASE_URL in your .env file');
  console.error('Get your Supabase URL from: https://app.supabase.com → Your Project → Settings → API\n');
  throw new Error('Invalid or missing SUPABASE_URL. Please configure your .env file with valid Supabase credentials.');
}

if (!supabaseKey || supabaseKey === 'your_supabase_anon_key' || supabaseKey === 'your_supabase_service_key') {
  console.error('\n❌ Supabase configuration error:');
  console.error('Please set SUPABASE_KEY or SUPABASE_SERVICE_KEY in your .env file');
  console.error('Get your Supabase keys from: https://app.supabase.com → Your Project → Settings → API\n');
  throw new Error('Invalid or missing Supabase API key. Please configure your .env file with valid Supabase credentials.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
