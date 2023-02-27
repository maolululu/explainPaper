import { createClient } from "@supabase/supabase-js";

// Found in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
// const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);


// const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//     auth: {
//       autoRefreshToken: false, // All my Supabase access is from server, so no need to refresh the token
//       detectSessionInUrl: false, // We are not using OAuth, so we don't need this. Also, we are manually "detecting" the session in the server-side code
//       persistSession: false, // All our access is from server, so no need to persist the session to browser's local storage
//     },
// })

export default supabase; // Default supabase has anon privileges

// export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);