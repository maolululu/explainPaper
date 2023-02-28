import { createClient } from "@supabase/supabase-js";

// Found in .env.local
const supabaseUrl = "https://mftdgmvaffmboupnnmbs.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdGRnbXZhZmZtYm91cG5ubWJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzM5NTQzNDYsImV4cCI6MTk4OTUzMDM0Nn0.kVUtqyAtEGNoF4aWep3ZGt9GFR8CN9MsN7n2O6xLzUs";
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
