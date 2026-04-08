import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

const SUPABASE_URL = "https://yzwncktlibdfycqhvlqg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6d25ja3RsaWJkZnljcWh2bHFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTg1MDQsImV4cCI6MjA4OTk3NDUwNH0.6moeEg1xDf9gviNvFQGYzuxEzKMLNG1JlLnjuttPiIw";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
