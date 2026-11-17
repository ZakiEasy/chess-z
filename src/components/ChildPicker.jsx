import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase.js';
import { AVATARS, TRACKS } from '../lib/content.js';

export default function ChildPicker({ user, onPick }) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [track, setTrack] = useState('explorer');

  async function load() {
    const { data, error } = await supabase.from('children').select('*').order('created_at');
    if (error) setError(error.message); else setChildren(data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    setError('');
    const { error } = await supabase
      .from('children')
      .insert({ parent_id: user.id, name: name.trim(), avatar, track });
    if (error) setError(error.message);
    else { setName(''); load(); }
  }

  async function remove(c) {
    if (!window.confirm(`Supprimer le profil de ${c.name} et toute sa progression ?`)) return;
    const { error } = await supabase.from('children').delete().eq('id', c.id);
    if (error) setError(error.message); else load();
  }

  return (
    <main className="card">
      <h1>Qui joue aujourd'hui ?</h1>
      {loading && <p>Chargement…</p>}
      <div className="profiles">
        {children.map((c) => (
          <div key={c.id} className="profile">
            <button className="profile-main" onClick={() => onPick(c)}>
              <span className="avatar">{c.avatar}</span>
              <strong>{c.name}</strong>
              <small>{TRACKS[c.track].name} · {TRACKS[c.track].label}</small>
            </button>
            <button className="link danger" onClick={() => remove(c)}>Supprimer</button>
          </div>
        ))}
      </div>

      <h2>Ajouter un enfant</h2>
      <form onSubmit={add}>
        <label>Prénom
          <input required maxLength={30} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="avatars" role="radiogroup" aria-label="Avatar">
          {AVATARS.map((a) => (
            <button type="button" key={a} className={a === avatar ? 'avatar sel' : 'avatar'}
                    onClick={() => setAvatar(a)}>{a}</button>
          ))}
        </div>
        <label>Âge
          <select value={track} onChange={(e) => setTrack(e.target.value)}>
            {Object.entries(TRACKS).map(([k, v]) => (
              <option key={k} value={k}>{v.label} ({v.name})</option>
            ))}
          </select>
        </label>
        <button>Ajouter</button>
      </form>
      {error && <p className="notice error">{error}</p>}
      <button className="link" onClick={() => supabase.auth.signOut()}>Se déconnecter</button>
    </main>
  );
}
