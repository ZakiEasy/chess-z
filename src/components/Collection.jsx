import { useState } from 'react';
import { AVATAR_CATALOG, THEMES } from '../lib/content.js';
import { BADGES } from '../lib/badges.js';

export default function Collection({ me, owned, onUpdate, onBack }) {
  const [error, setError] = useState('');
  const currentTheme = me.theme ?? 'classic';

  async function change(patch) {
    setError('');
    const err = await onUpdate(patch);
    if (err) setError(err);
  }

  return (
    <main className="card">
      <h1>Ma collection</h1>
      <p className="muted">Gagne des niveaux pour débloquer de nouveaux avatars et thèmes !</p>
      {error && <p className="notice error">{error}</p>}

      <h2>Avatars</h2>
      <div className="avatars">
        {AVATAR_CATALOG.map((a) => {
          const open = me.level >= a.level;
          return (
            <button key={a.emoji} disabled={!open} title={open ? '' : `Niveau ${a.level}`}
                    className={'avatar' + (a.emoji === me.avatar ? ' sel' : '') + (open ? '' : ' locked')}
                    onClick={() => change({ avatar: a.emoji })}>
              {open ? a.emoji : '🔒'}
              {!open && <small>niv. {a.level}</small>}
            </button>
          );
        })}
      </div>

      <h2>Thèmes d'échiquier</h2>
      <div className="themes">
        {THEMES.map((t) => {
          const open = me.level >= t.level;
          return (
            <button key={t.id} disabled={!open} className={'theme' + (t.id === currentTheme ? ' sel' : '')}
                    onClick={() => change({ theme: t.id })}>
              <span className="swatch" style={{ '--a': t.light, '--b': t.dark }} />
              <strong>{t.name}</strong>
              <small>{open ? (t.id === currentTheme ? 'Choisi' : 'Choisir') : `🔒 niveau ${t.level}`}</small>
            </button>
          );
        })}
      </div>

      <h2>Badges ({BADGES.filter((b) => owned.has(b.id)).length}/{BADGES.length})</h2>
      <div className="badges">
        {BADGES.map((b) => {
          const got = owned.has(b.id);
          return (
            <div key={b.id} className={'badge' + (got ? ' got' : '')}>
              <span className="icon">{got ? b.icon : '🔒'}</span>
              <strong>{b.title}</strong>
              <small>{b.soon && !got ? 'Bientôt disponible' : b.desc}</small>
            </div>
          );
        })}
      </div>
      <button className="link" onClick={onBack}>← Retour</button>
    </main>
  );
}
