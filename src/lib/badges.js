import { exercises } from './content.js';

const moduleDone = (id, ids) =>
  exercises.filter((e) => e.moduleId === id).every((e) => ids.has(e.id));

// ctx = { attempts, streak, level, xp, successIds }
export const BADGES = [
  { id: 'first_exercise', icon: '🌱', title: 'Premier pas', desc: 'Réussir ton premier exercice', check: (c) => c.attempts.length >= 1 },
  { id: 'ex_5', icon: '♟️', title: 'Apprenti', desc: 'Réussir 5 exercices', check: (c) => c.attempts.length >= 5 },
  { id: 'ex_15', icon: '🎓', title: 'Élève appliqué', desc: 'Réussir 15 exercices', check: (c) => c.attempts.length >= 15 },
  { id: 'streak_3', icon: '🔥', title: 'Trois jours de suite', desc: 'Jouer 3 jours d\u2019affilée', check: (c) => c.streak >= 3 },
  { id: 'streak_7', icon: '🏅', title: 'Semaine de champion', desc: 'Jouer 7 jours d\u2019affilée', check: (c) => c.streak >= 7 },
  { id: 'no_hint', icon: '🧠', title: 'Cerveau en feu', desc: 'Réussir 10 exercices sans indice', check: (c) => c.attempts.filter((a) => a.hints_used === 0).length >= 10 },
  { id: 'level_3', icon: '⭐', title: 'Niveau 3', desc: 'Atteindre le niveau 3', check: (c) => c.level >= 3 },
  { id: 'level_5', icon: '🌟', title: 'Niveau 5', desc: 'Atteindre le niveau 5', check: (c) => c.level >= 5 },
  { id: 'module_m0', icon: '🐴', title: 'Maître des déplacements', desc: 'Terminer le module des déplacements', check: (c) => moduleDone('m0', c.successIds) },
  { id: 'module_m1', icon: '👑', title: 'Chasseur de mats', desc: 'Terminer le module des mats éclair', check: (c) => moduleDone('m1', c.successIds) },
  // Débloqués par les parties contre le robot (session 6)
  { id: 'good_loser', icon: '🤝', title: 'Bon perdant', desc: 'Terminer une défaite avec poignée de main et bilan', soon: true },
  { id: 'comeback', icon: '💪', title: 'Revanche courageuse', desc: 'Rejouer juste après une défaite', soon: true },
  { id: 'learner', icon: '📘', title: 'J\u2019apprends de mes erreurs', desc: 'Remplir 3 bilans de défaite', soon: true },
];

export function newlyEarned(ctx, ownedIds) {
  return BADGES.filter((b) => !b.soon && !ownedIds.has(b.id) && b.check(ctx));
}
