# Mentions légales — logiciels et ressources tiers

Ce dépôt contient principalement du code original développé pour **ChessMaster Local**, distribué sous licence MIT (voir `LICENSE`).

Les logiciels et ressources tiers mentionnés dans ce document ne sont pas nécessairement inclus dans le dépôt. Lorsqu'ils sont chargés ou téléchargés automatiquement, ils proviennent de leurs sources respectives et restent soumis à leurs propres licences.

## Stockfish 19 — GPLv3

* **Rôle :** moteur d'échecs utilisé par ChessMaster Local pour les parties contre l'ordinateur et l'analyse.
* **Utilisation :** deux instances locales peuvent être utilisées simultanément, l'une pour les coups de l'adversaire et l'autre pour l'analyse.
* **Projet :** Stockfish.
* **Licence :** GNU General Public License version 3 (GPLv3).
* **Auteurs :** les contributeurs du projet Stockfish. La liste des auteurs est disponible dans le fichier `AUTHORS` du projet.
* **Source officielle :** https://github.com/official-stockfish/Stockfish
* **Version utilisée :** Stockfish 19 (`sf_19`).
* **Téléchargement :** le script `node scripts/download-stockfish.js` télécharge automatiquement l'archive officielle Stockfish pour Windows depuis les releases du projet.
* **Installation locale :** l'archive est téléchargée dans le dossier `engines/`, puis les exécutables nécessaires sont installés localement.
* **Dépôt Git :** les exécutables Stockfish ne sont pas inclus dans ce dépôt et sont exclus par `.gitignore`.
* **Modification :** ChessMaster Local n'apporte pas de modification au code source de Stockfish téléchargé.
* **NNUE :** les fichiers de réseau neuronal utilisés par Stockfish font partie de la distribution Stockfish et restent soumis aux conditions de licence applicables à Stockfish.

La licence GPLv3 de Stockfish est indépendante de la licence MIT du code original de ChessMaster Local.

## chess.js — BSD-2-Clause

* **Rôle :** bibliothèque JavaScript utilisée pour la gestion et la validation des règles du jeu d'échecs, notamment les positions FEN et les coups.
* **Auteur principal :** Jeff Hlywa et les contributeurs du projet.
* **Licence :** BSD 2-Clause.
* **Installation :** la version utilisée côté backend est installée via `npm install` et n'est pas incluse directement dans le dépôt Git.
* **Source :** le paquet `chess.js` disponible sur npm.

## Express — MIT

* **Rôle :** serveur HTTP utilisé par le backend de ChessMaster Local.
* **Licence :** MIT.
* **Installation :** installé comme dépendance npm via `npm install`.
* **Dépôt :** projet Express.js.

## ws — MIT

* **Rôle :** communication WebSocket utilisée notamment pour les fonctionnalités multijoueur en réseau local.
* **Licence :** MIT.
* **Installation :** installé comme dépendance npm via `npm install`.
* **Dépôt :** projet `ws`.

## cors — MIT

* **Rôle :** gestion des règles Cross-Origin Resource Sharing (CORS) du serveur backend.
* **Licence :** MIT.
* **Installation :** installé comme dépendance npm via `npm install`.
* **Dépôt :** projet `cors`.

## chess.js 0.10.3 — CDN

* **Rôle :** gestion des règles du jeu d'échecs côté navigateur dans le frontend.
* **Version :** 0.10.3.
* **Chargement :** la bibliothèque est chargée depuis cdnjs et n'est pas stockée directement dans le dépôt.
* **Licence :** BSD 2-Clause.
* **Source :** bibliothèque `chess.js`.

La présence de cette dépendance côté frontend ne modifie pas la licence du code original de ChessMaster Local.

## Fraunces et DM Sans — Google Fonts

* **Rôle :** polices utilisées pour l'interface utilisateur.
* **Chargement :** les polices sont chargées depuis Google Fonts.
* **Licence :** SIL Open Font License 1.1 (OFL).
* **Projet :** Google Fonts.

Les fichiers de police ne sont pas inclus directement dans le dépôt lorsqu'ils sont chargés depuis le service Google Fonts.

## Pièces d'échecs SVG — style Cburnett

* **Rôle :** représentation graphique des pièces sur l'échiquier.
* **Style :** Cburnett.
* **Origine :** jeu de pièces largement utilisé dans différents projets et ressources liés aux échecs, notamment dans l'écosystème Lichess et Wikimedia.
* **Licence :** la licence exacte dépend des fichiers et de leur source d'origine. Les fichiers utilisés doivent conserver les mentions de licence applicables à leur distribution.
* **Emplacement dans le projet :** les références utilisées par le frontend sont définies dans `frontend/`, notamment dans l'objet `PIECES` de `app.js`.
* **Remplacement :** les pièces peuvent être remplacées par un autre jeu de pièces respectant une licence compatible avec le projet.

Aucune revendication de propriété sur les œuvres graphiques tierces n'est faite par ChessMaster Local.

## Dépendances npm

Les dépendances installées avec `npm install` restent soumises à leurs propres licences.

Le répertoire `node_modules/` n'est pas versionné dans Git et est exclu du dépôt. Les licences et notices des dépendances npm peuvent être consultées dans leurs paquets respectifs après installation.

## Licence du code original

Sauf indication contraire explicite dans ce document ou dans les fichiers concernés, le code original développé pour ChessMaster Local est distribué sous licence MIT.

Voir le fichier `LICENSE` pour le texte complet de la licence MIT.

## Résumé

| Composant         | Utilisation              | Licence                   | Inclus dans Git |
| ----------------- | ------------------------ | ------------------------- | --------------- |
| ChessMaster Local | Code original du projet  | MIT                       | Oui             |
| Stockfish 19      | Moteur d'échecs          | GPLv3                     | Non             |
| chess.js          | Règles d'échecs          | BSD-2-Clause              | Non             |
| Express           | Serveur HTTP             | MIT                       | Non             |
| ws                | WebSocket                | MIT                       | Non             |
| cors              | CORS backend             | MIT                       | Non             |
| chess.js 0.10.3   | Règles d'échecs frontend | BSD-2-Clause              | Non             |
| Fraunces          | Police                   | SIL OFL 1.1               | Non             |
| DM Sans           | Police                   | SIL OFL 1.1               | Non             |
| Cburnett          | Pièces d'échecs SVG      | Selon les fichiers/source | À vérifier      |

Les informations de ce document décrivent les composants et ressources utilisés par le projet et ne remplacent pas les textes de licence officiels applicables à chacun d'eux.
