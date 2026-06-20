# Les Ombres d'Erebor

> Jeu de déduction sociale. 25 rôles. 3 factions. Une nuit sans fin.

Site web officiel du jeu de société **Les Ombres d'Erebor**, inspiré du Loup-Garou, Blood on the Clocktower et Two Rooms and a Boom.

## Présentation

Les Ombres d'Erebor est un jeu de déduction sociale en thème dark fantasy où des joueurs incarnent des rôles cachés répartis en trois factions opposées. Chaque nuit, des pouvoirs s'activent, des alliances se forment et des trahisons se préparent.

## Pages

| Page | Description |
|---|---|
| `index.html` | Accueil — hero animé, présentation, factions, comment jouer |
| `rules.html` | Règles complètes — phases de jeu, configuration, référence rapide |
| `roles.html` | Galerie des 25 rôles avec filtres par faction et modale de détail |
| `interactions.html` | Matrice 25×25 des interactions entre rôles |
| `night-order.html` | Ordre de réveil nocturne |
| `play.html` | Aide de jeu pour le Conteur |
| `game.html` | Suivi de partie |
| `shop.html` | Boutique |
| `contact.html` | Contact |
| `privacy.html` | Politique de confidentialité |
| `terms.html` | Conditions d'utilisation |

## Stack technique

- HTML / CSS / JavaScript pur — aucune dépendance externe
- Animations canvas (particules) sur la page d'accueil
- Internationalisation via `assets/js/i18n.js`
- Données centralisées dans `assets/js/data/`

## Structure

```
Les-Ombres-d-Erebor/
├── assets/
│   ├── css/          # Feuilles de style par page
│   ├── fonts/        # Polices locales
│   ├── images/       # Visuels du jeu
│   └── js/
│       ├── config/   # Configuration globale
│       ├── data/     # Rôles, interactions, produits (source de vérité)
│       ├── pages/    # Scripts par page
│       └── main.js   # Point d'entrée
├── index.html
└── ...
```

## Lancer le site

Ouvrir `index.html` directement dans un navigateur — aucun serveur requis.

Pour un rechargement à chaud, un serveur local suffit :

```bash
npx serve .
# ou
python3 -m http.server
```

## Design

Thème dark fantasy : palette or `#c9a84c`, bleu acier, bordeaux.  
Polices : **Cinzel** (titres) + **Crimson Pro** (corps) via Google Fonts.
