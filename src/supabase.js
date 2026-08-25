import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Configuración pública de Supabase — la "anon/publishable key" está
// diseñada para ir en código cliente. Nunca pongas aquí la service_role key.
const SUPABASE_URL = 'https://ovbasquswnaepngdapje.supabase.co';
const SUPABASE_KEY = 'sb_publishable_-PpdVgLbJPE_Nk09e6ChYg_cKo7smJq';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
