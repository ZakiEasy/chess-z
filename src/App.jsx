import { useEffect, useState } from 'react';
import { supabase, configured } from './lib/supabase.js';
import Auth from './components/Auth.jsx';
import ChildPicker from './components/ChildPicker.jsx';
import Home from './components/Home.jsx';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);

  useEffect(() => {
    if (!configured) { setLoading(false); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) setChild(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!configured) {
    return (
      <main className="card">
        <h1>Configuration manquante</h1>
        <p>Les variables <code>VITE_SUPABASE_URL</code> et <code>VITE_SUPABASE_ANON_KEY</code> ne sont pas définies.</p>
      </main>
    );
  }
  if (loading) return <main className="card"><p>Chargement…</p></main>;
  if (!session) return <Auth />;
  if (!child) return <ChildPicker user={session.user} onPick={setChild} />;
  return <Home child={child} onSwitch={() => setChild(null)} />;
}
