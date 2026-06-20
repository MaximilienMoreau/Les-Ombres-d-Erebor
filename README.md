<div align="center">

# 🌑 Les Ombres d'Erebor

**Jeu de déduction sociale · 25 rôles · 3 factions · Une nuit sans fin**

*Inspiré du Loup-Garou, Blood on the Clocktower et Two Rooms and a Boom*

---

</div>

## Le jeu

Dans **Les Ombres d'Erebor**, chaque joueur incarne un habitant d'une cité dark fantasy en proie à la corruption. Rôles cachés, pouvoirs nocturnes, alliances fragiles et trahisons calculées chaque partie est unique.

| Faction | Emoji | Objectif |
|---|:---:|---|
| Conseil de la Lune | 🌙 | Identifier et éliminer toutes les Ombres |
| Ombre Souveraine | 🌑 | Égaler ou dépasser le nombre de Lunaires |
| Solitaires | 🌀 | Accomplir un objectif personnel secret |

---

## Pages du site

| Page | Contenu |
|---|---|
| `index.html` | Accueil : hero animé (canvas), présentation, factions, comment jouer |
| `rules.html` | Règles complètes : phases de jeu, configuration, conditions de victoire |
| `roles.html` | Galerie des 25 rôles — filtres par faction, recherche, modale de détail |
| `interactions.html` | Matrice 25×25 — synergies, conflits et détournements entre rôles |
| `night-order.html` | Ordre de réveil nocturne complet |
| `play.html` | Interface du Conteur (MJ) |
| `game.html` | Moteur de jeu en ligne (Firebase / mode local) |
| `shop.html` | Boutique — coffrets physiques |
| `compose.html` | Compositeur de partie — sélection des rôles |
| `contact.html` | Formulaire de contact |
| `privacy.html` | Politique de confidentialité |
| `terms.html` | Conditions générales d'utilisation |

---

## Stack technique

```
HTML · CSS · JavaScript : aucun framework, aucune dépendance npm
```

- **Animations** : système de particules canvas sur la page d'accueil
- **Internationalisation** : FR / EN via `assets/js/data/i18n.js` + `lang.js`
- **Multijoueur** : Firebase Realtime Database (ou mode local sessionStorage)
- **Données** : source de vérité centralisée dans `assets/js/data/`

---

## Structure

```
Les-Ombres-d-Erebor/
├── assets/
│   ├── css/
│   │   ├── tokens.css          variables globales (couleurs, typo, espacements)
│   │   ├── base.css / layout.css / animations.css
│   │   └── [page].css          styles spécifiques par page
│   ├── js/
│   │   ├── config/
│   │   │   └── firebase-config.js
│   │   ├── data/
│   │   │   ├── roles.js        25 rôles (FR + EN)
│   │   │   ├── interactions.js relations entre rôles
│   │   │   ├── i18n.js         traductions FR / EN
│   │   │   └── shop-products.js
│   │   ├── components/
│   │   │   ├── nav.js · modal.js · particles.js
│   │   │   ├── lang.js         commutateur de langue
│   │   │   └── cookie-consent.js
│   │   ├── pages/
│   │   │   ├── game.js         moteur de jeu complet
│   │   │   ├── roles.js · interactions.js · shop.js
│   │   └── main.js
│   ├── fonts/
│   └── images/
├── index.html
├── rules.html · roles.html · interactions.html
├── game.html · play.html · night-order.html · compose.html
├── shop.html · contact.html · privacy.html · terms.html
├── 404.html
└── favicon.svg
```

---

## Lancer le site

Ouvrir directement dans un navigateur — aucun serveur requis :

```bash
open index.html
```

Pour le rechargement automatique :

```bash
npx serve .
# ou
python3 -m http.server
```

Pour le mode multijoueur en ligne, configurer Firebase dans `assets/js/config/firebase-config.js` et passer `configured: true`.

---

## Design

| Élément | Valeur |
|---|---|
| Thème | Dark fantasy |
| Couleur principale | Or `#c9a84c` |
| Factions | Bleu acier `#4a8fa8` · Bordeaux `#8b2635` · Bronze `#7a5a1f` |
| Police titres | **Cinzel** (Google Fonts) |
| Police corps | **Crimson Pro** (Google Fonts) |
| Police UI | **Inter** |

---

<div align="center">

© 2027 Les Ombres d'Erebor · Tous droits réservés

</div>
