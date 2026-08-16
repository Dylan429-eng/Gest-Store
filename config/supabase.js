const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn(
    '[ATTENTION] SUPABASE_URL ou SUPABASE_ANON_KEY manquant. ' +
    'Copie .env.example en .env et renseigne tes clés Supabase.'
  );
}

// Node < 22 n'a pas de WebSocket natif : le module realtime de Supabase (même
// s'il n'est pas utilisé ici) en a besoin pour s'initialiser sans planter.
const realtimeOptions = { realtime: { transport: ws } };

// Client "public" utilisé uniquement pour login/logout (pas de session utilisateur encore)
const supabasePublic = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, realtimeOptions);

/**
 * Crée un client Supabase authentifié avec le token de l'utilisateur en session.
 * Nécessaire pour que les policies RLS (auth.role() = 'authenticated') s'appliquent.
 */
function getSupabaseForSession(session) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    ...realtimeOptions,
    global: {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

module.exports = { supabasePublic, getSupabaseForSession };