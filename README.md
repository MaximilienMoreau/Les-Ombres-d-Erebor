<div align="center">

# 🌑 Les Ombres d'Erebor

<p>
  <img src="https://img.shields.io/badge/Langue-FR%20%2F%20EN-c9a84c?style=flat-square" alt="Langues">
  <img src="https://img.shields.io/badge/Rôles-25-4a8fa8?style=flat-square" alt="Rôles">
  <img src="https://img.shields.io/badge/Factions-3-8b2635?style=flat-square" alt="Factions">
  <img src="https://img.shields.io/badge/Stack-HTML%20%2F%20CSS%20%2F%20JS-7a5a1f?style=flat-square" alt="Stack">
</p>

**Jeu de déduction sociale en univers dark fantasy**

*Inspiré du Loup-Garou · Blood on the Clocktower · Two Rooms and a Boom*

</div>

---

## 🎮 Le jeu

Dans **Les Ombres d'Erebor**, chaque joueur incarne un habitant d'une cité en proie à la corruption. Rôles cachés, pouvoirs nocturnes, alliances fragiles et trahisons calculées, chaque partie est unique.

| | Faction | Objectif de victoire |
|:---:|---|---|
| 🌙 | **Conseil de la Lune** | Identifier et éliminer toutes les Ombres |
| 🌑 | **Ombre Souveraine** | Égaler ou dépasser le nombre de Lunaires |
| 🌀 | **Solitaires** | Accomplir un objectif personnel secret |

---

## 📄 Pages du site

| Page | Description |
|---|---|
| [`index.html`](index.html) | Accueil : hero animé, présentation des factions, comment jouer |
| [`rules.html`](rules.html) | Règles complètes : phases de jeu, configuration, victoire |
| [`roles.html`](roles.html) | Galerie des 25 rôles : filtres, recherche, modale de détail |
| [`interactions.html`](interactions.html) | Matrice 25×25 : synergies, conflits, détournements |
| [`night-order.html`](night-order.html) | Ordre de réveil nocturne |
| [`play.html`](play.html) | Interface du Conteur (MJ) |
| [`game.html`](game.html) | Moteur de jeu en ligne : Firebase ou mode local |
| [`shop.html`](shop.html) | Catalogue et demande de disponibilité par email |
| [`compose.html`](compose.html) | Compositeur de partie |
| [`contact.html`](contact.html) | Formulaire de contact |

---

## 🗂️ Structure du projet

```
Les-Ombres-d-Erebor/
│
├── assets/
│   ├── css/
│   │   ├── tokens.css          ← variables globales (couleurs, typo, espacements)
│   │   ├── base.css            ← reset & styles de base
│   │   ├── layout.css          ← nav, footer, conteneurs
│   │   ├── animations.css      ← keyframes & transitions
│   │   └── [page].css          ← styles spécifiques par page
│   │
│   ├── js/
│   │   ├── config/
│   │   │   └── firebase-config.js
│   │   ├── data/               ← SOURCE DE VÉRITÉ
│   │   │   ├── roles.js        ← 25 rôles complets (FR + EN)
│   │   │   ├── interactions.js ← relations entre rôles
│   │   │   ├── i18n.js         ← toutes les traductions FR / EN
│   │   │   └── shop-products.js
│   │   ├── components/
│   │   │   ├── room-client.js   ← transport local / Firebase et données privées
│   │   │   ├── nav.js          ← navigation & menu mobile
│   │   │   ├── modal.js        ← fenêtre de détail des rôles
│   │   │   ├── particles.js    ← animations canvas
│   │   │   ├── lang.js         ← commutateur FR / EN
│   │   │   └── cookie-consent.js
│   │   ├── pages/
│   │   │   ├── game.js         ← moteur de jeu (Firebase + local)
│   │   │   ├── roles.js        ← galerie & filtres
│   │   │   ├── interactions.js ← matrice & tooltips
│   │   │   └── shop.js         ← panier & commande
│   │   └── main.js             ← point d'entrée commun
│   │
│   ├── fonts/
│   └── images/
│
├── index.html
├── rules.html · roles.html · interactions.html · night-order.html
├── game.html · play.html · compose.html
├── shop.html · contact.html · privacy.html · terms.html
├── 404.html
└── favicon.svg
```

---

## ⚙️ Stack technique

| Technologie | Usage |
|---|---|
| HTML / CSS / JS pur | Aucun framework ; outils npm réservés aux tests |
| Canvas API | Système de particules animées (accueil) |
| Firebase Realtime DB | Mode multijoueur en ligne |
| LocalStorage / Web Locks | Salles locales partagées entre onglets du même navigateur |
| Firebase Authentication | Identités anonymes et autorisations des parties en ligne |
| Google Fonts | Cinzel (titres) · Crimson Pro (corps) · Inter (UI) |

---

## 🚀 Lancer le site

Le site reste statique. Servez-le en HTTP pour que les onglets partagent la même origine :

```bash
python3 -m http.server 8000
```

Ouvrez `http://localhost:8000/play.html`. Sans Firebase, créez une salle puis rejoignez-la depuis d’autres onglets **du même navigateur et du même profil**. Chaque onglet conserve son identité pendant les navigations et rechargements. Les onglets partagent leur état via `localStorage` et les événements `storage`, avec Web Locks pour sérialiser les écritures lorsque disponibles. Le mode local est une démonstration sur un appareil : ses rôles sont accessibles dans le stockage du navigateur. Il ne connecte pas plusieurs appareils sur le Wi-Fi.

Pour forcer ce mode même si Firebase est configuré, ouvrez `play.html?mode=local`.

**Mode multijoueur en ligne**

1. Créez un projet Firebase et une Realtime Database.
2. Activez **Authentication → Sign-in method → Anonymous** et vérifiez les domaines autorisés pour votre hébergement.
3. Publiez le contenu de [`database.rules.json`](database.rules.json) dans les règles Realtime Database, ou utilisez `npx firebase deploy --only database --project VOTRE_PROJECT_ID` après connexion à votre compte. Ne passez pas la base en mode test public.
4. Renseignez `assets/js/config/firebase-config.js`, puis passez `configured` à `true`.
5. Servez le site en HTTPS en production. Testez avec plusieurs appareils ou sessions de navigateur indépendantes.

Les nouvelles salles utilisent `rooms/{code}/public` pour la phase, les sièges et les votes, et `rooms/{code}/secrets/{uid}` pour les rôles, les cibles nocturnes et les messages privés. Les joueurs ne lisent que leurs secrets ; le MJ authentifié lit tous les secrets et arbitre les phases. Les rôles sont révélés en fin de partie. L’URL `?gm=1` n’accorde aucun droit. Les sièges numérotés limitent les entrées concurrentes à la capacité configurée, sans écraser un joueur existant. Une reconnexion dans la même session conserve le rôle. Les anciennes salles au format précédent doivent être recréées.

Le MJ reste responsable de la résolution des pouvoirs et des objectifs individuels des Solitaires. Les informations passives sont adressées uniquement aux joueurs concernés. La session anonyme en ligne est conservée dans l’onglet : fermer cette session ou effacer son stockage peut faire perdre l’identité et l’accès à son rôle.

**Boutique**

Le panier conserve au maximum dix exemplaires par produit et ignore les données invalides. La boutique ne traite aucun paiement ni aucune commande. La demande de disponibilité prépare un email avec les produits choisis ; l’utilisateur envoie lui-même ce message. Les prix et frais affichés sont indicatifs jusqu’à confirmation.

**Validation**

Node.js 20 et Java 11 ou plus sont nécessaires aux outils de test. Le site lui-même n’a pas besoin de npm pour fonctionner.

```bash
npm ci
npm test
npm run test:rules
npx playwright install chromium
npm run test:e2e
```

Les tests couvrent les votes, les égalités, les conditions de victoire, la distribution, les identités locales et les chemins publics/privés. L’émulateur Firebase vérifie les accès non authentifiés, l’usurpation du MJ, la confidentialité, la capacité et les permissions des votes/actions. Chromium vérifie une partie locale entre onglets, la reconnexion, les fenêtres au clavier et le chargement des pages. Aucun test ne contacte le formulaire de production ni n’envoie d’email.

Documentation Firebase : [règles de sécurité](https://firebase.google.com/docs/database/security), [authentification anonyme](https://firebase.google.com/docs/auth/web/anonymous-auth).

---

## 🎨 Design

> Thème **dark fantasy** · Palette sombre avec accents or, acier et bordeaux

| Rôle | Police | Source |
|---|---|---|
| Titres | **Cinzel** | Google Fonts |
| Corps de texte | **Crimson Pro** | Google Fonts |
| Interface | **Inter** | Google Fonts |

| Couleur | Hex | Usage |
|---|---|---|
| Or lunaire | `#c9a84c` | Accent principal, CTA |
| Bleu acier | `#4a8fa8` | Faction Lune |
| Bordeaux | `#8b2635` | Faction Ombre |
| Bronze | `#7a5a1f` | Faction Solitaires |
| Fond profond | `#06080f` | Arrière-plan global |

---

<div align="center">

© 2027 **Les Ombres d'Erebor** · Tous droits réservés

</div>
