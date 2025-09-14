import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// service_role key = full access (use ONLY on the server, never in frontend)
export const supabase = createClient(supabaseUrl, supabaseKey);
