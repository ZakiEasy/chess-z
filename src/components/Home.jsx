import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { exercises, nextExercise, levelFromXp, xpProgress, THEMES, TRACKS } from '../lib/content.js';
import { BADGES, newlyEarned } from '../lib/badges.js';
import { localDate, currentStreak, shortDay, longDay } from '../lib/dates.js';
import Exercise from './Exercise.jsx';
import Collection from './Collection.jsx';
import Confetti from './Confetti.jsx';

const titleOf = (id, track) => exercises.find((e) => e.id === id)?.text[track]?.title ?? id;

export default function Home({ child, onSwitch }) {
  const [me, setMe] = useState(child);
  const [attempts, setAttempts] = useState(null); // null = chargement
  const [owned, setOwned] = useState(new Set());
  const [view, setView] = useState('home'); // home | daily | history | practice | review | collection
  const [reviewEx, setReviewEx] = useState(null);
  const [toast, setToast] = useState('');
  const [celebrate, setCelebrate] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase
      .from('exercise_attempts')
      .select('exercise_id, played_on, tries, hints_used, created_at')
      .eq('child_id', child.id)
      .eq('success', true)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => (error ? setError(error.message) : setAttempts(data)));
    supabase
      .from('child_badges')
      .select('badge_id')
      .eq('child_id', child.id)
      .then(({ data }) => data && setOwned(new Set(data.map((r) => r.badge_id))));
  }, [child.id]);

  const today = localDate();
  const successIds = useMemo(() => new Set((attempts ?? []).map((a) => a.exercise_id)), [attempts]);
  const playedDays = useMemo(() => new Set((attempts ?? []).map((a) => a.played_on)), [attempts]);
  const doneToday = playedDays.has(today);
  const next = attempts ? nextExercise(successIds) : undefined;
  const streak = currentStreak(me);
  const theme = THEMES.find((t) => t.id === (me.theme ?? 'classic')) ?? THEMES[0];
  const prog = xpProgress(me.xp);

  async function updateChild(patch) {
    const { data, error } = await supabase.from('children').update(patch).eq('id', me.id).select().single();
    if (error) {
      return /theme/i.test(error.message)
        ? 'La colonne « theme » manque : exécute supabase/migrations/002_theme.sql dans Supabase.'
        : error.message;
    }
    setMe(data);
    return null;
  }

  async function finishDaily(exercise, result) {
    setError('');
    const { error: e1 } = await supabase.from('exercise_attempts').insert({
      child_id: me.id, exercise_id: exercise.id, success: true,
      tries: result.tries, hints_used: result.hints, played_on: today,
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
      .eq('id', me.id).select().single();
    if (e2) { setError(e2.message); return; }

    const newAttempt = { exercise_id: exercise.id, played_on: today, tries: result.tries,
                         hints_used: result.hints, created_at: new Date().toISOString() };
    const allAttempts = [newAttempt, ...attempts];
    const ids = new Set([...successIds, exercise.id]);

    // Badges
    const earned = newlyEarned({ attempts: allAttempts, streak: newStreak, level, xp, successIds: ids }, owned);
    if (earned.length) {
      const { error: e3 } = await supabase.from('child_badges').upsert(
        earned.map((b) => ({ child_id: me.id, badge_id: b.id })),
        { onConflict: 'child_id,badge_id', ignoreDuplicates: true });
      if (e3) setError(e3.message);
      else setOwned(new Set([...owned, ...earned.map((b) => b.id)]));
    }

    setToast(
      `+${result.xp} XP · 🔥 série de ${newStreak} jour${newStreak > 1 ? 's' : ''}` +
      (level > me.level ? ` · 🎉 niveau ${level} !` : '') +
      earned.map((b) => ` · ${b.icon} Nouveau badge : ${b.title}`).join('')
    );
    if (earned.length || level > me.level) setCelebrate((n) => n + 1);
    setAttempts(allAttempts);
    setMe(data);
    setView('home');
  }

  // ----- Écrans plein écran -----
  if (view === 'daily' && next) {
    return (
      <main className="card">
        <Exercise key={next.id} exercise={next} track={me.track} theme={theme}
                  onFinish={(r) => finishDaily(next, r)} onExit={() => setView('home')} />
        {error && <p className="notice error">{error}</p>}
      </main>
    );
  }
  if (view === 'review' && reviewEx) {
    return (
      <main className="card">
        <Exercise key={'r-' + reviewEx.id} exercise={reviewEx} track={me.track} theme={theme} review
                  onFinish={() => setView('practice')} onExit={() => setView('practice')} />
      </main>
    );
  }
  if (view === 'collection') {
    return <Collection me={me} owned={owned} onUpdate={updateChild} onBack={() => setView('home')} />;
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
          <div><b>{owned.size}/{BADGES.length}</b><span>badges</span></div>
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
      {celebrate > 0 && <Confetti key={celebrate} />}
      <header className="top">
        <span className="avatar big">{me.avatar}</span>
        <div>
          <h1>Salut {me.name} !</h1>
          <p className="muted">
            {TRACKS[me.track].name} · niveau {me.level} · {me.xp} XP · 🔥 {streak} jour{streak > 1 ? 's' : ''}
          </p>
        </div>
      </header>

      <div className="xpbar" title={`${prog.into}/${prog.span} XP`}>
        <div className="bar"><i style={{ width: `${(prog.into / prog.span) * 100}%` }} /></div>
        <small>{prog.span - prog.into} XP avant le niveau {prog.next}</small>
      </div>

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
        <button className="secondary" onClick={() => setView('collection')}>🎁 Collection</button>
        <button className="secondary" onClick={() => setView('history')}>📈 Progrès</button>
      </div>
      <button className="link" onClick={onSwitch}>Changer de profil</button>
    </main>
  );
}
