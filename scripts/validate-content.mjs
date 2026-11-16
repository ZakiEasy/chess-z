// Vérifie que chaque exercice du programme est valide.
// Usage (après `npm i chess.js`) : node scripts/validate-content.mjs
// NB : ce script n'a pas encore été exécuté (pas d'accès réseau en session 1).
import { readFileSync } from 'node:fs';
import { Chess } from 'chess.js';

const data = JSON.parse(readFileSync(new URL('../content/curriculum.json', import.meta.url)));
let errors = 0;
const fail = (id, msg) => { errors++; console.error(`✗ ${id} : ${msg}`); };

for (const mod of data.modules) {
  for (const ex of mod.exercises) {
    for (const track of ['explorer', 'strategist']) {
      if (!ex.text?.[track]) fail(ex.id, `texte manquant pour la piste ${track}`);
    }
    if (ex.type === 'quiz') {
      if (typeof ex.answer !== 'number') fail(ex.id, 'answer manquant');
      continue;
    }
    let game;
    try { game = new Chess(ex.fen); } catch (e) { fail(ex.id, `FEN invalide (${e.message})`); continue; }

    if (ex.type === 'mate_in_1') {
      const mates = game.moves().filter((san) => {
        const g = new Chess(ex.fen); g.move(san); return g.isCheckmate();
      });
      if (mates.length === 0) fail(ex.id, 'aucun mat en 1 dans cette position');
      else console.log(`✓ ${ex.id} mats en 1 : ${mates.join(', ')}`);
    }
    if (ex.type === 'promote') {
      const ok = game.moves().includes(ex.promote_move);
      if (!ok) fail(ex.id, `coup ${ex.promote_move} illégal`);
      else console.log(`✓ ${ex.id} promotion ${ex.promote_move}`);
    }
  }
}
process.exit(errors ? 1 : 0);
