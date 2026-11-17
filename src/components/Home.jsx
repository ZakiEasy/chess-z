import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { nextExercise, levelFromXp, TRACKS } from '../lib/content.js';
import Exercise from './Exercise.jsx';

export default function Home({ child, onSwitch }) {
  const [me, setMe] = useState(child);
  const [successIds, setSuccessIds] = useState(null); // null = chargement
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('exercise_attempts')
      .select('exercise_id')
      .eq('child_id', child.id)
      .eq('success', true)
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setSuccessIds(new Set(data.map((r) => r.exercise_id)));
      });
  }, [child.id]);

  const next = successIds ? nextExercise(successIds) : undefined;

  async function finish(exercise, result) {
    setError('');
    const { error: e1 } = await supabase.from('exercise_attempts').insert({
      child_id: me.id,
      exercise_id: exercise.id,
      success: true,
      tries: result.tries,
      hints_used: result.hints,
    });
    if (e1) { setError(e1.message); return; }
    const xp = me.xp + result.xp;
    const { data, error: e2 } = await supabase
      .from('children')
      .update({ xp, level: levelFromXp(xp) })
      .eq('id', me.id)
      .select()
      .single();
    if (e2) { setError(e2.message); return; }
    setMe(data);
    setSuccessIds(new Set([...successIds, exercise.id]));
    setPlaying(false);
  }

  return (
    <main className="card">
      <header className="top">
        <span className="avatar big">{me.avatar}</span>
        <div>
          <h1>Salut {me.name} !</h1>
          <p className="muted">
            {TRACKS[me.track].name} · niveau {me.level} · {me.xp} XP · 🔥 {me.streak} jour(s)
          </p>
        </div>
      </header>

      {error && <p className="notice error">{error}</p>}

      {playing && next ? (
        <Exercise key={next.id} exercise={next} track={me.track}
                  onFinish={(r) => finish(next, r)} onExit={() => setPlaying(false)} />
      ) : (
        <section className="daily">
          <h2>Exercice du jour</h2>
          {next === undefined && !error && <p>Chargement…</p>}
          {next === null && <p>Bravo, tu as fini tous les exercices disponibles ! Reviens bientôt. 🏆</p>}
          {next && (
            <>
              <h3>{next.text[me.track].title}</h3>
              <p><strong>Objectif :</strong> {next.text[me.track].goal}</p>
              <button onClick={() => setPlaying(true)}>C'est parti ! ♟️</button>
            </>
          )}
        </section>
      )}
      {!playing && <button className="link" onClick={onSwitch}>Changer de profil</button>}
    </main>
  );
}
