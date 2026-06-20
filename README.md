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
| [`shop.html`](shop.html) | Boutique : coffrets physiques |
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
| HTML / CSS / JS pur | Aucun framework, aucune dépendance npm |
| Canvas API | Système de particules animées (accueil) |
| Firebase Realtime DB | Mode multijoueur en ligne |
| SessionStorage | Mode local (sans serveur) |
| Google Fonts | Cinzel (titres) · Crimson Pro (corps) · Inter (UI) |

---

## 🚀 Lancer le site

**Sans serveur**. Ouvrir directement dans un navigateur :

```bash
open index.html
```

**Avec rechargement automatique :**

```bash
npx serve .
# ou
python3 -m http.server
```

**Mode multijoueur en ligne :**
Renseigner les clés dans `assets/js/config/firebase-config.js` et passer `configured: true`.

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
