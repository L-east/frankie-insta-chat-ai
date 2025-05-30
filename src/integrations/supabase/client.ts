
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yfizikxjbncxbhwymxul.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlmaXppa3hqYm5jeGJod3lteHVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc0OTg4MDksImV4cCI6MjA2MzA3NDgwOX0.IzEuCJzeNlf3cfSl5ulD9JMnvWFncxGPqngev_0XXpU";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
