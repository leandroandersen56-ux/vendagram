import { createClient } from '@supabase/supabase-js';
import type { Database } from '../integrations/supabase/types';

const SUPABASE_URL = "https://yzwncktlibdfycqhvlqg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_oouwSzV_gTYOajVLvXWPtg_VbJyB1TN";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
