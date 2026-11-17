import { useState } from 'react';
import { Chess } from 'chess.js';
import Board from './Board.jsx';
import { xpFor } from '../lib/content.js';

export default function Exercise({ exercise, track, onFinish, onExit }) {
  const t = exercise.text[track];
  const isQuiz = exercise.type === 'quiz';
  const [fen, setFen] = useState(exercise.fen ?? null);
  const [tries, setTries] = useState(0);
  const [hints, setHints] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [wrong, setWrong] = useState([]);
  const [done, setDone] = useState(false);

  function revealHint() {
    if (showHint) return;
    setShowHint(true);
    setHints((h) => h + 1);
  }

  function fail() {
    const n = tries + 1;
    setTries(n);
    setFeedback(t.fail);
    if (n >= 3) revealHint();   // après 3 essais, on aide
  }

  function succeed(newFen) {
    if (newFen) setFen(newFen);
    setDone(true);
    setFeedback(t.success);
  }

  function tryMove(m) {
    const g = new Chess(fen);
    let mv;
    try { mv = g.move(m); } catch { return; }
    const ok = exercise.type === 'mate_in_1'
      ? g.isCheckmate()
      : mv.san.replace(/[+#]/g, '') === exercise.promote_move;
    if (ok) succeed(g.fen()); else fail();
  }

  function answer(i) {
    if (done || wrong.includes(i)) return;
    if (i === exercise.answer) succeed();
    else { setWrong([...wrong, i]); fail(); }
  }

  const earned = xpFor(exercise, hints);
  const side = exercise.fen && exercise.fen.split(' ')[1] === 'b' ? 'les Noirs' : 'les Blancs';

  return (
    <section className="exercise">
      <p className="goal"><strong>🎯 Objectif :</strong> {t.goal}</p>
      <h3>{t.title}</h3>

      {isQuiz ? (
        <>
          <p className="question">{t.question}</p>
          <div className="choices">
            {exercise.choices[track].map((c, i) => (
              <button key={i} disabled={done || wrong.includes(i)}
                      className={done && i === exercise.answer ? 'good' : ''}
                      onClick={() => answer(i)}>{c}</button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="muted">Tu joues {side}. Touche une pièce, puis sa case d'arrivée.</p>
          <Board fen={fen} disabled={done} onMove={tryMove} />
        </>
      )}

      {feedback && <p className={done ? 'notice ok' : 'notice'}>{feedback}</p>}
      {showHint && !done && <p className="notice hint">💡 {t.hint}</p>}
      {!done && (
        <button className="secondary" onClick={revealHint} disabled={showHint}>
          💡 Indice (XP réduits de moitié)
        </button>
      )}

      {done && (
        <>
          <div className="explain">
            <h4>Pourquoi ça marche ?</h4>
            <p>{t.explanation}</p>
          </div>
          <p className="xp">+{earned} XP ⭐</p>
          <button onClick={() => onFinish({ tries: tries + 1, hints, xp: earned })}>Continuer</button>
        </>
      )}
      <button className="link" onClick={onExit}>Quitter l'exercice</button>
    </section>
  );
}
