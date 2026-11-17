// Vérifie que chaque exercice du programme est valide.
// Usage (après `npm install`) : npm run validate
import { readFileSync } from 'node:fs';
import { Chess } from 'chess.js';

const data = JSON.parse(readFileSync(new URL('../content/curriculum.json', import.meta.url)));
let errors = 0;
const ids = new Set();
const fail = (id, msg) => { errors++; console.error(`✗ ${id} : ${msg}`); };

for (const mod of data.modules) {
  for (const ex of mod.exercises) {
    if (ids.has(ex.id)) fail(ex.id, 'identifiant en double');
    ids.add(ex.id);
    for (const track of ['explorer', 'strategist']) {
      const t = ex.text?.[track];
      if (!t) { fail(ex.id, `texte manquant pour la piste ${track}`); continue; }
      for (const k of ['title', 'goal', 'explanation', 'hint']) if (!t[k]) fail(ex.id, `${track}.${k} manquant`);
    }
    if (ex.type === 'quiz') {
      const ch = Array.isArray(ex.choices) ? ex.choices : ex.choices?.explorer;
      if (!ch || typeof ex.answer !== 'number' || ex.answer >= ch.length) fail(ex.id, 'choices/answer invalides');
      else console.log(`✓ ${ex.id} quiz`);
      continue;
    }
    let game;
    try { game = new Chess(ex.fen); } catch (e) { fail(ex.id, `FEN invalide (${e.message})`); continue; }

    if (ex.type === 'mate_in_1') {
      const mates = game.moves().filter((san) => { const g = new Chess(ex.fen); g.move(san); return g.isCheckmate(); });
      if (mates.length === 0) fail(ex.id, 'aucun mat en 1 dans cette position');
      else console.log(`✓ ${ex.id} mats en 1 : ${mates.join(', ')}`);
    } else if (ex.type === 'promote') {
      if (!game.moves().includes(ex.promote_move)) fail(ex.id, `coup ${ex.promote_move} illégal`);
      else console.log(`✓ ${ex.id} promotion ${ex.promote_move}`);
    } else if (ex.type === 'move_piece') {
      const ok = game.moves({ verbose: true }).some((m) => m.to === ex.target && m.piece === ex.piece);
      if (!ok) fail(ex.id, `aucun coup de ${ex.piece} vers ${ex.target}`);
      else console.log(`✓ ${ex.id} ${ex.piece} → ${ex.target}`);
    } else fail(ex.id, `type inconnu : ${ex.type}`);
  }
}
console.log(errors ? `\n${errors} erreur(s)` : '\nTout est valide ✔');
process.exit(errors ? 1 : 0);
