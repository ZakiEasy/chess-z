import { useState } from 'react';
import { supabase } from '../lib/supabase.js';

export default function Auth() {
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg('');
    const { data, error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });
    setBusy(false);
    if (error) setMsg(error.message);
    else if (mode === 'signup' && !data.session)
      setMsg('Compte créé ! Vérifie ta boîte mail pour confirmer, puis connecte-toi.');
  }

  return (
    <main className="card">
      <h1>♞ Chess-Z</h1>
      <p className="muted">Compte parent : il permet de créer plusieurs profils d'enfants.</p>
      <form onSubmit={submit}>
        <label>Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>Mot de passe
          <input type="password" required minLength={6} value={password}
                 onChange={(e) => setPassword(e.target.value)} />
        </label>
        <button disabled={busy}>{mode === 'signin' ? 'Se connecter' : 'Créer le compte'}</button>
      </form>
      {msg && <p className="notice">{msg}</p>}
      <button className="link" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        {mode === 'signin' ? "Pas encore de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
      </button>
    </main>
  );
}
