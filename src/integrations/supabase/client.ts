import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://yzwncktlibdfycqhvlqg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oouwSzV_gTYOajVLvXWPtg_VbJyB1TN";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
