# Échecs pour enfants — état du projet

> Colle ce fichier (et joins les fichiers utiles) au début de chaque nouvelle session.

## Objectif
Application web d'apprentissage des échecs pour enfants (pistes **explorer 7-10 ans** et **strategist 10-14 ans**), basée sur *Chess Fundamentals* de Capablanca (1921, domaine public). Exercice du jour avec objectif + explication, gamification (XP, niveaux, séries, badges), parties contre un robot et module « apprendre à perdre ».

## Stack
- Front : React + Vite (site statique, Render gratuit)
- Base de données et comptes : Supabase (compte parent + profils enfants)
- Règles : chess.js · Échiquier : react-chessboard · Robot : Stockfish WASM (navigateur)
- Contenu pédagogique : fichiers JSON dans le dépôt (`content/`), la base ne stocke que la progression

## Décisions
- Pas d'authentification enfant : profils sélectionnables dans le compte parent (PIN facultatif).
- L'exercice du jour = prochain exercice non réussi du programme, plus une révision.
- Une défaite ne retire jamais d'XP ; badge « Bon perdant » (cf. `content/resilience.json`).
- Textes rédigés pour l'app (pas de copie de la traduction française de 2014, qui reste protégée).

## Avancement
- [x] Session 1 : schéma Supabase (`supabase/schema.sql`), programme module 1-2 (`content/curriculum.json`), messages de résilience et badges (`content/resilience.json`), script de validation (`scripts/validate-content.mjs`, **à exécuter**)
- [x] Session 2 (code écrit, **non testé** : pas de réseau pour `npm install`) : squelette Vite + React, connexion Supabase, compte parent (email + mot de passe), profils enfants, écran d'accueil avec exercice du jour (aperçu)
- [x] Session 3 (code écrit, **non testé**) : échiquier maison (toucher-déposer, coups légaux via chess.js), moteur d'exercices (mate_in_1, promote, quiz), indices, XP et niveau enregistrés. Correctif email : `emailRedirectTo`
- [x] Session 4 (code écrit, **non testé**) : un nouvel exercice par jour, séries (streak, date locale), semaine en cours, historique « Mes progrès », entraînement libre (sans XP), type `move_piece`, module 0 (déplacements des pièces, 8 exercices) et 3 mats de plus (m1-e5 à e7). Contenu : 16 exercices
- [ ] Session 5 : XP, niveaux, badges, récompenses
- [ ] Session 6 : parties contre le robot + flux après défaite
- [ ] Session 7 : espace parent, finitions, déploiement Render
- [ ] Session 8+ : nouveaux modules (mats en séquence, pion et opposition, développement, parties commentées)

## À fournir à la session 2
- URL et clé `anon` du projet Supabase (jamais la clé `service_role`)
- Dépôt GitHub relié à Render (ou ZIP du projet)
STATE.md…]()
