import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { exercises, nextExercise, levelFromXp, TRACKS } from '../lib/content.js';
import { localDate, currentStreak, shortDay, longDay } from '../lib/dates.js';
import Exercise from './Exercise.jsx';

const titleOf = (id, track) => exercises.find((e) => e.id === id)?.text[track]?.title ?? id;

export default function Home({ child, onSwitch }) {
  const [me, setMe] = useState(child);
  const [attempts, setAttempts] = useState(null); // null = chargement
  const [view, setView] = useState('home'); // home | daily | history | practice | review
  const [reviewEx, setReviewEx] = useState(null);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('exercise_attempts')
      .select('exercise_id, played_on, tries, hints_used, created_at')
      .eq('child_id', child.id)
      .eq('success', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => (error ? setError(error.message) : setAttempts(data)));
  }, [child.id]);

  const today = localDate();
  const successIds = useMemo(() => new Set((attempts ?? []).map((a) => a.exercise_id)), [attempts]);
  const playedDays = useMemo(() => new Set((attempts ?? []).map((a) => a.played_on)), [attempts]);
  const doneToday = playedDays.has(today);
  const next = attempts ? nextExercise(successIds) : undefined;
  const streak = currentStreak(me);

  async function finishDaily(exercise, result) {
    setError('');
    const { error: e1 } = await supabase.from('exercise_attempts').insert({
      child_id: me.id,
      exercise_id: exercise.id,
      success: true,
      tries: result.tries,
      hints_used: result.hints,
      played_on: today,
    });
    if (e1) { setError(e1.message); return; }

    const xp = me.xp + result.xp;
    const level = levelFromXp(xp);
    let newStreak = me.streak;
    if (me.last_active_on !== today) {
      newStreak = me.last_active_on === localDate(-1) ? me.streak + 1 : 1;
    }
    const { data, error: e2 } = await supabase
      .from('children')
      .update({ xp, level, streak: newStreak, best_streak: Math.max(me.best_streak, newStreak), last_active_on: today })
      .eq('id', me.id)
      .select()
      .single();
    if (e2) { setError(e2.message); return; }

    setAttempts([{ exercise_id: exercise.id, played_on: today, tries: result.tries,
                   hints_used: result.hints, created_at: new Date().toISOString() }, ...attempts]);
    setToast(
      `+${result.xp} XP · 🔥 série de ${newStreak} jour${newStreak > 1 ? 's' : ''}` +
      (level > me.level ? ` · 🎉 niveau ${level} !` : '')
    );
    setMe(data);
    setView('home');
  }

  // ----- Écrans plein écran -----
  if (view === 'daily' && next) {
    return (
      <main className="card">
        <Exercise key={next.id} exercise={next} track={me.track}
                  onFinish={(r) => finishDaily(next, r)} onExit={() => setView('home')} />
        {error && <p className="notice error">{error}</p>}
      </main>
    );
  }
  if (view === 'review' && reviewEx) {
    return (
      <main className="card">
        <Exercise key={'r-' + reviewEx.id} exercise={reviewEx} track={me.track} review
                  onFinish={() => setView('practice')} onExit={() => setView('practice')} />
      </main>
    );
  }
  if (view === 'practice') {
    const solved = exercises.filter((e) => successIds.has(e.id));
    return (
      <main className="card">
        <h1>S'entraîner</h1>
        <p className="muted">Rejoue les exercices déjà réussis (sans XP).</p>
        {solved.length === 0 && <p>Pas encore d'exercice réussi : commence par l'exercice du jour !</p>}
        <div className="profiles">
          {solved.map((e) => (
            <button key={e.id} className="profile-main" onClick={() => { setReviewEx(e); setView('review'); }}>
              {e.text[me.track].title}
            </button>
          ))}
        </div>
        <button className="link" onClick={() => setView('home')}>← Retour</button>
      </main>
    );
  }
  if (view === 'history') {
    return (
      <main className="card">
        <h1>Mes progrès</h1>
        <div className="stats">
          <div><b>{attempts?.length ?? 0}</b><span>exercices réussis</span></div>
          <div><b>{me.best_streak}</b><span>record de série</span></div>
          <div><b>{me.xp}</b><span>XP</span></div>
        </div>
        <h2>Derniers exercices</h2>
        {(attempts ?? []).length === 0 && <p>Rien pour l'instant.</p>}
        <ul className="history">
          {(attempts ?? []).slice(0, 30).map((a, i) => (
            <li key={i}>
              <span>{longDay(a.played_on)}</span>
              <strong>{titleOf(a.exercise_id, me.track)}</strong>
              <small>{a.tries} essai{a.tries > 1 ? 's' : ''}{a.hints_used ? ' · indice' : ''}</small>
            </li>
          ))}
        </ul>
        <button className="link" onClick={() => setView('home')}>← Retour</button>
      </main>
    );
  }

  // ----- Accueil -----
  const week = [-6, -5, -4, -3, -2, -1, 0].map((o) => localDate(o));
  return (
    <main className="card">
      <header className="top">
        <span className="avatar big">{me.avatar}</span>
        <div>
          <h1>Salut {me.name} !</h1>
          <p className="muted">
            {TRACKS[me.track].name} · niveau {me.level} · {me.xp} XP · 🔥 {streak} jour{streak > 1 ? 's' : ''}
          </p>
        </div>
      </header>

      {toast && <p className="notice ok">{toast}</p>}
      {error && <p className="notice error">{error}</p>}

      <div className="week">
        {week.map((d) => (
          <div key={d} className={'day' + (playedDays.has(d) ? ' on' : '') + (d === today ? ' today' : '')}>
            <span>{shortDay(d)}</span><b>{playedDays.has(d) ? '✓' : '·'}</b>
          </div>
        ))}
      </div>

      <section className="daily">
        <h2>Exercice du jour</h2>
        {next === undefined && !error && <p>Chargement…</p>}
        {next !== undefined && doneToday && (
          <p>🎉 Mission du jour accomplie ! Reviens demain pour un nouvel exercice, ou entraîne-toi en attendant.</p>
        )}
        {next === null && !doneToday && <p>Tu as fini tous les exercices disponibles. 🏆 De nouveaux arrivent bientôt !</p>}
        {next && !doneToday && (
          <>
            <h3>{next.text[me.track].title}</h3>
            <p><strong>Objectif :</strong> {next.text[me.track].goal}</p>
            <button onClick={() => { setToast(''); setView('daily'); }}>C'est parti ! ♟️</button>
          </>
        )}
      </section>

      <div className="menu">
        <button className="secondary" onClick={() => setView('practice')}>💪 S'entraîner</button>
        <button className="secondary" onClick={() => setView('history')}>📈 Mes progrès</button>
      </div>
      <button className="link" onClick={onSwitch}>Changer de profil</button>
    </main>
  );
}
