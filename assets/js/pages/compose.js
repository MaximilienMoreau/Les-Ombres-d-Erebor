/* ============================================
       COMPOSITEUR DE PARTIE — Les Ombres d'Erebor
       ============================================ */

    const COMPOSITIONS = {
      8:  { lune:5,  ombre:2, solitaire:1 },
      9:  { lune:5,  ombre:3, solitaire:1 },
      10: { lune:6,  ombre:3, solitaire:1 },
      11: { lune:7,  ombre:3, solitaire:1 },
      12: { lune:7,  ombre:3, solitaire:2 },
      13: { lune:8,  ombre:4, solitaire:1 },
      14: { lune:8,  ombre:4, solitaire:2 },
      15: { lune:9,  ombre:4, solitaire:2 },
      16: { lune:9,  ombre:5, solitaire:2 },
      17: { lune:10, ombre:5, solitaire:2 },
      18: { lune:10, ombre:5, solitaire:3 },
      19: { lune:10, ombre:6, solitaire:3 },
      20: { lune:10, ombre:6, solitaire:4 },
    };

    const DIFF_LABELS = {
      beginner: { fr: 'Débutant', en: 'Beginner' },
      advanced: { fr: 'Avancé',   en: 'Advanced'  },
      expert:   { fr: 'Expert',   en: 'Expert'    },
    };

    let selectedPlayers = 10;
    let selectedDiff = 'standard';
    let currentComposition = null;

    // Détecter la langue active
    function getLang() {
      const btn = document.querySelector('.lang-option.active');
      return btn ? btn.dataset.lang : 'fr';
    }

    // Mélange Fisher-Yates
    function shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    // Filtrer les rôles selon la difficulté
    function filterByDiff(roles, diff) {
      if (diff === 'beginner') {
        return roles.filter(r => r.difficulty === 'beginner' || r.difficulty === 'advanced');
      }
      if (diff === 'expert') {
        // Trier pour prioriser les expert en premier
        return [...roles].sort((a, b) => {
          const order = { expert: 0, advanced: 1, beginner: 2 };
          return (order[a.difficulty] ?? 1) - (order[b.difficulty] ?? 1);
        });
      }
      return roles; // standard = tous
    }

    // Tirer N rôles d'une faction
    function pickRoles(faction, count, diff) {
      const pool = (typeof ROLES !== 'undefined') ? ROLES.filter(r => r.faction === faction) : [];
      const filtered = filterByDiff(pool, diff);

      if (diff === 'expert') {
        // Priorité aux expert mais compléter si besoin
        const experts  = filtered.filter(r => r.difficulty === 'expert');
        const others   = shuffle(filtered.filter(r => r.difficulty !== 'expert'));
        const combined = [...shuffle(experts), ...others];
        return combined.slice(0, count);
      }

      // Prefer simpler roles, then explicitly report any expert fallback needed.
      return [...shuffle(filtered), ...shuffle(pool.filter(role => !filtered.includes(role)))].slice(0, count);
    }

    // Créer une card HTML pour un rôle
    function createRoleCard(role) {
      const lang = getLang();
      const name   = lang === 'en' ? (role.nameEn || role.name) : role.name;
      const nameAlt = lang === 'en' ? role.name : (role.nameEn || role.name);
      const diffLabel = DIFF_LABELS[role.difficulty] || { fr: role.difficulty, en: role.difficulty };

      const card = document.createElement('div');
      card.className = `role-card ${role.faction}`;
      card.dataset.role = role.id;
      card.innerHTML = `
        <div class="role-card-icon">${role.icon}</div>
        <div class="role-card-name">${name}</div>
        <div class="role-card-name-en">${nameAlt}</div>
        <span class="role-card-diff ${role.difficulty}">${lang === 'en' ? diffLabel.en : diffLabel.fr}</span>
      `;
      return card;
    }

    // Générer la composition
    function generate() {
      const comp = COMPOSITIONS[selectedPlayers];
      if (!comp) return;
      currentComposition = { count: selectedPlayers, difficulty: selectedDiff, lune: pickRoles('lune', comp.lune, selectedDiff), ombre: pickRoles('ombre', comp.ombre, selectedDiff), solitaire: pickRoles('solitaire', comp.solitaire, selectedDiff) };
      renderComposition();
      document.getElementById('compose-results').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    }
    function renderComposition() {
      if (!currentComposition) return;
      const comp = COMPOSITIONS[currentComposition.count];
      if (!comp) return;

      const warn = document.getElementById('compose-warn');
      const results = document.getElementById('compose-results');
      warn.classList.remove('visible');

      const luneRoles       = currentComposition.lune;
      const ombreRoles      = currentComposition.ombre;
      const solitaireRoles  = currentComposition.solitaire;

      const total = luneRoles.length + ombreRoles.length + solitaireRoles.length;

      const extraExperts = currentComposition.difficulty === 'beginner' ? [...luneRoles, ...ombreRoles, ...solitaireRoles].filter(role => role.difficulty === 'expert').length : 0;
      if (extraExperts) {
        warn.classList.add('visible');
        warn.textContent = getLang() === 'en' ? `${extraExperts} expert role(s) added to fill the game. For a simpler game, use fewer players.` : `${extraExperts} rôle(s) expert(s) ajouté(s) pour compléter la partie. Réduisez le nombre de joueurs pour une partie plus simple.`;
      }
      // Avertissement si pas assez de rôles disponibles
      if (total < currentComposition.count) {
        const lang = getLang();
        warn.className = 'compose-warn visible';
        warn.textContent = lang === 'en'
          ? `⚠ Not enough roles available for the selected difficulty. Try a less restrictive level.`
          : `⚠ Pas assez de rôles disponibles pour cette difficulté. Essayez un niveau moins restrictif.`;
      }

      // Résumé
      const summary = document.getElementById('compose-summary');
      const lang = getLang();
      summary.innerHTML = `
        <span class="summary-item lune">🌙 ${luneRoles.length} <span class="lang-fr">Lune</span><span class="lang-en">Moon</span></span>
        <span class="summary-sep">·</span>
        <span class="summary-item ombre">🌑 ${ombreRoles.length} <span class="lang-fr">Ombres</span><span class="lang-en">Shadows</span></span>
        <span class="summary-sep">·</span>
        <span class="summary-item solitaire">🌀 ${solitaireRoles.length} <span class="lang-fr">Solitaires</span><span class="lang-en">Loners</span></span>
        <span class="summary-sep">=</span>
        <span class="summary-total">${total} <span class="lang-fr">joueurs</span><span class="lang-en">players</span></span>
      `;

      // Compteurs
      document.getElementById('count-lune').textContent = `${luneRoles.length} / ${comp.lune}`;
      document.getElementById('count-ombre').textContent = `${ombreRoles.length} / ${comp.ombre}`;
      document.getElementById('count-solitaire').textContent = `${solitaireRoles.length} / ${comp.solitaire}`;

      // Cards
      const fillCards = (containerId, roles) => {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        roles.forEach((role, i) => {
          const card = createRoleCard(role);
          card.style.animationDelay = `${i * 0.05}s`;
          container.appendChild(card);
        });
      };

      fillCards('cards-lune', luneRoles);
      fillCards('cards-ombre', ombreRoles);
      fillCards('cards-solitaire', solitaireRoles);

      results.classList.add('visible');

    }

    // ===== Sélecteurs joueurs =====
    document.querySelectorAll('.player-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedPlayers = parseInt(btn.dataset.players, 10);
        document.getElementById('player-count-display').textContent = selectedPlayers;
      });
    });

    // ===== Sélecteurs difficulté =====
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedDiff = btn.dataset.diff;
      });
    });

    // ===== Boutons générer / reroll =====
    document.getElementById('btn-generate').addEventListener('click', generate);
    document.getElementById('btn-reroll').addEventListener('click', generate);

    // Régénérer quand la langue change (pour les labels)
    document.addEventListener('langchange', () => {
      if (document.getElementById('compose-results').classList.contains('visible')) {
        renderComposition();
      }
    });
