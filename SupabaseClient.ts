import {createClient} from '@supabase/supabase-js';
const supabaseURL = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseURL, supabaseAnonKey);

export default supabase;