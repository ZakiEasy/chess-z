import { useMemo, useState } from 'react';
import { Chess } from 'chess.js';

// \uFE0E force l'affichage en texte (évite les emojis sur iPhone/Mac)
const GLYPH = { k: '♚\uFE0E', q: '♛\uFE0E', r: '♜\uFE0E', b: '♝\uFE0E', n: '♞\uFE0E', p: '♟\uFE0E' };
const PROMO = [['q', 'Dame'], ['r', 'Tour'], ['b', 'Fou'], ['n', 'Cavalier']];
const FILES = 'abcdefgh';

export default function Board({ fen, orientation = 'w', theme, disabled, onMove }) {
  const game = useMemo(() => new Chess(fen), [fen]);
  const [selected, setSelected] = useState(null);
  const [pending, setPending] = useState(null);

  const turn = game.turn();           // trait actuel (sélection des pièces)
  const rows = [0, 1, 2, 3, 4, 5, 6, 7];
  const cols = [0, 1, 2, 3, 4, 5, 6, 7];
  const rr = orientation === 'w' ? rows : [...rows].reverse();   // orientation FIXE : ne change plus après un coup
  const cc = orientation === 'w' ? cols : [...cols].reverse();
  const board = game.board();

  const targets = selected ? game.moves({ square: selected, verbose: true }) : [];

  function click(sq, piece) {
    if (disabled || pending) return;
    if (selected) {
      const m = targets.filter((t) => t.to === sq);
      if (m.length) {
        if (m.some((t) => t.promotion)) setPending({ from: selected, to: sq });
        else onMove({ from: selected, to: sq });
        setSelected(null);
        return;
      }
    }
    if (piece && piece.color === turn) setSelected(sq === selected ? null : sq);
    else setSelected(null);
  }

  function choosePromotion(p) {
    onMove({ ...pending, promotion: p });
    setPending(null);
  }

  return (
    <div className="board-wrap">
      <div className="board" role="grid" aria-label="Échiquier"
           style={theme ? { '--sq-light': theme.light, '--sq-dark': theme.dark } : undefined}>
        {rr.map((r, ri) =>
          cc.map((c, ci) => {
            const sq = FILES[c] + (8 - r);
            const piece = board[r][c];
            const dark = (r + c) % 2 === 1;
            const isTarget = targets.some((t) => t.to === sq);
            const cls = ['sq', dark ? 'dark' : 'light', sq === selected ? 'sel' : '', isTarget ? 'target' : ''].join(' ');
            return (
              <button key={sq} className={cls} onClick={() => click(sq, piece)} aria-label={sq}>
                {piece && <span className={`piece ${piece.color}`}>{GLYPH[piece.type]}</span>}
                {ci === 0 && <i className="rank">{8 - r}</i>}
                {ri === 7 && <i className="file">{FILES[c]}</i>}
              </button>
            );
          })
        )}
      </div>
      {pending && (
        <div className="promo">
          <p>Ton pion devient…</p>
          {PROMO.map(([p, label]) => (
            <button key={p} onClick={() => choosePromotion(p)}>{label}</button>
          ))}
        </div>
      )}
    </div>
  );
}
