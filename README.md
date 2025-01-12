# Exam - EBDD

## Sommaire

- [Installation](#installation)
- [Historique des commits](#historique-des-commits)
- [Créateur](#créateur)
- [Copyright et licence](#copyright-et-licence)

## Installation

Pour récuperer le projet, vous pouvez utiliser la ligne de commande git suivante :

```git
$ git clone https://github.com/Christmann-Julian/bdd-exam
```
Ou vous pouvez télécharger le fichier .zip du projet en vous rendant sur le [github](https://github.com/Christmann-Julian/bdd-exam) du projet.

Puis vous devez installer les packages npm du projet en lançant:

```bash
cd api
```

```bash
npm install
```

Ensuite vous devez récupérer dans ./api/src/migrations le fichier ***schema-bdd-exam.sql*** et le fichier ***data-bdd-exam.sql***. Puis vous devez les importer dans un sgdb mysql.

Enfin vous devez modifier les informations de connexion à la base de données dans le fichier .api/src/server.js

```js
// BDD information
const connection = await mysql.createConnection({
    host: "localhost",
    database: "bdd-exam",
    user: "votre nom",
    password: "votre mot de passe",
});
```

Maintenant vous êtes prêt à lancer le server avec :

```bash
cd api
```

```bash
npm run dev
```

## Historique des commits

Vous trouverez ci-dessous un historique des commits sinon vous pouvez naviguez entre les branches git pour voir l'évolution du projet.

1. Version 1 du projet (branche version-1)
    - initialisation du projet
    - packages + migrations
    - Les routes de la v1
2. Version 2 du projet (branche version-2)
    - Sécurité des requêtes SQL et validation des entrées
    - autres améliorations et fonctions avancées
3. Partie optionnelle (branche version-optionnelle)
    - Optionnel : mise en place d’une authentification JWT

:warning: La branche main est un merge des 3 branches.

## Créateur

**Christmann-Julian**

- <https://github.com/Christmann-Julian>

## Copyright et licence

Code et documentation copyright 2025. Le Code du projet est publié sous [Licence MIT ](https://fr.wikipedia.org/wiki/Licence_MIT).