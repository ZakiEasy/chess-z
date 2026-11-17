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
