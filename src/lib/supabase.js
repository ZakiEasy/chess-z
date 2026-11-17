import { createClient } from '@supabase/supabase-js';

const url = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

let client = null;
export let initError = '';

if (!url || !key) {
  initError = 'Variables VITE_SUPABASE_URL et/ou VITE_SUPABASE_ANON_KEY absentes au moment du build.';
} else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(url)) {
  initError = `VITE_SUPABASE_URL semble invalide (reçu : « ${url} »). Attendu : https://xxxx.supabase.co`;
} else {
  try {
    client = createClient(url, key);
  } catch (e) {
    initError = `Erreur d'initialisation de Supabase : ${e.message}`;
  }
}

export const supabase = client;
export const configured = client !== null;
