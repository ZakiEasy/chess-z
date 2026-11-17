import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { nextExercise, TRACKS } from '../lib/content.js';

export default function Home({ child, onSwitch }) {
  const [next, setNext] = useState(undefined); // undefined = chargement
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('exercise_attempts')
      .select('exercise_id')
      .eq('child_id', child.id)
      .eq('success', true)
      .then(({ data, error }) => {
        if (error) { setError(error.message); return; }
        setNext(nextExercise(new Set(data.map((r) => r.exercise_id))));
      });
  }, [child.id]);

  const t = next?.text[child.track];

  return (
    <main className="card">
      <header className="top">
        <span className="avatar big">{child.avatar}</span>
        <div>
          <h1>Salut {child.name} !</h1>
          <p className="muted">{TRACKS[child.track].name} · niveau {child.level} · {child.xp} XP · 🔥 {child.streak} jour(s)</p>
        </div>
      </header>

      <section className="daily">
        <h2>Exercice du jour</h2>
        {error && <p className="notice error">{error}</p>}
        {next === undefined && !error && <p>Chargement…</p>}
        {next === null && <p>Bravo, tu as fini tous les exercices disponibles ! Reviens bientôt.</p>}
        {t && (
          <>
            <h3>{t.title}</h3>
            <p><strong>Objectif :</strong> {t.goal}</p>
            <button disabled>L'échiquier arrive à la prochaine session ♟️</button>
          </>
        )}
      </section>
      <button className="link" onClick={onSwitch}>Changer de profil</button>
    </main>
  );
}
