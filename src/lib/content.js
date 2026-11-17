import curriculum from '../../content/curriculum.json';

export const modules = curriculum.modules;

// Liste à plat des exercices, dans l'ordre du programme
export const exercises = modules.flatMap((m) =>
  m.exercises.map((ex) => ({ ...ex, moduleId: m.id, moduleTitle: m.title }))
);

export const TRACKS = {
  explorer: { label: '7-10 ans', name: 'Explorateur' },
  strategist: { label: '10-14 ans', name: 'Stratège' },
};

export const AVATARS = ['🐴', '🦉', '🐉', '🦁', '🦊', '🐼', '🚀', '⭐'];

// Prochain exercice non réussi (null si tout est fait)
export function nextExercise(successIds) {
  return exercises.find((e) => !successIds.has(e.id)) ?? null;
}

// XP gagnés : réduits de moitié si un indice a été utilisé
export function xpFor(exercise, hintsUsed) {
  return hintsUsed > 0 ? Math.ceil(exercise.xp / 2) : exercise.xp;
}

// 1 niveau tous les 30 XP
export function levelFromXp(xp) {
  return 1 + Math.floor(xp / LEVEL_XP);
}

// Messages par défaut quand un exercice n'en fournit pas
export const DEFAULT_TEXT = {
  explorer: { success: 'Bravo, c\u2019est la bonne r\u00e9ponse !', fail: 'Pas tout \u00e0 fait\u2026 essaie encore !' },
  strategist: { success: 'Correct !', fail: 'Ce n\u2019est pas le coup attendu. R\u00e9fl\u00e9chis au d\u00e9placement de la pi\u00e8ce.' },
};

export const LEVEL_XP = 30;

// Progression vers le niveau suivant
export function xpProgress(xp) {
  return { into: xp % LEVEL_XP, span: LEVEL_XP, next: levelFromXp(xp) + 1 };
}

// Récompenses à débloquer avec le niveau
export const UNLOCKABLE_AVATARS = [
  { emoji: '🦄', level: 2 }, { emoji: '🐯', level: 3 }, { emoji: '🤖', level: 4 },
  { emoji: '👑', level: 5 }, { emoji: '🧙', level: 6 },
];
export const AVATAR_CATALOG = [...AVATARS.map((emoji) => ({ emoji, level: 1 })), ...UNLOCKABLE_AVATARS];

export const THEMES = [
  { id: 'classic', name: 'Classique', level: 1, light: '#f0d9b5', dark: '#b58863' },
  { id: 'forest', name: 'Forêt', level: 2, light: '#e6efc8', dark: '#6f9a5a' },
  { id: 'ocean', name: 'Océan', level: 3, light: '#dbeaf5', dark: '#5b8db8' },
  { id: 'candy', name: 'Bonbon', level: 4, light: '#ffe3ee', dark: '#e58fb1' },
  { id: 'night', name: 'Nuit', level: 5, light: '#9aa3b8', dark: '#3d4663' },
];
