/* ============================================
   ROLES PAGE — Galerie & Filtres
   ============================================ */

(function initRolesPage() {
  const grid       = document.getElementById('roles-grid');
  const countEl    = document.getElementById('roles-count');
  const searchEl   = document.getElementById('roles-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const modalOv    = document.getElementById('role-modal-overlay');

  if (!grid) return;

  let currentFaction = 'all';
  let currentSearch  = '';

  // Instancier la modale
  const modal = new RoleModal();

  // Construire les cartes
  function buildCards() {
    grid.innerHTML = '';
    let visible = 0;

    ROLES.forEach((role, index) => {
      const matchFaction = currentFaction === 'all' || role.faction === currentFaction;
      const matchSearch  = role.name.toLowerCase().includes(currentSearch)
                        || role.shortPower.toLowerCase().includes(currentSearch);

      if (!matchFaction || !matchSearch) return;
      visible++;

      const card = document.createElement('div');
      card.className = `role-card ${role.faction} reveal`;
      card.style.animationDelay = `${(visible % 8) * 0.05}s`;
      card.setAttribute('data-role', role.id);
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Voir le rôle ${role.name}`);

      const factionLabel = { lune: 'Conseil de la Lune', ombre: 'Ombre Souveraine', solitaire: 'Solitaire' };
      const diffLabel    = { beginner: 'Débutant', advanced: 'Intermédiaire', expert: 'Expert' };

      card.innerHTML = `
        <div class="role-card-top"></div>
        <div class="role-card-body">
          <div class="role-icon-wrapper">${role.icon}</div>
          <div class="role-name">${role.name}</div>
          <p class="role-power-short">${role.shortPower}</p>
        </div>
        <div class="role-card-footer">
          <span class="faction-badge ${role.faction}">${factionLabel[role.faction]}</span>
          <span class="difficulty-badge ${role.difficulty}">${diffLabel[role.difficulty]}</span>
        </div>
      `;

      card.addEventListener('click', () => modal.open(role));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); modal.open(role); }
      });

      grid.appendChild(card);

      // Déclencher le reveal
      requestAnimationFrame(() => {
        setTimeout(() => card.classList.add('visible'), (visible % 8) * 50);
      });
    });

    if (countEl) {
      const lang = window.i18n?.getCurrentLang() || 'fr';
      const word = visible === 1
        ? window.i18n?.t('roles.countSingular') || 'rôle affiché'
        : window.i18n?.t('roles.countPlural') || 'rôles affichés';
      countEl.innerHTML = `<strong>${visible}</strong> ${word}`;
    }

    if (visible === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--color-text-muted);">
          <div style="font-size:3rem;margin-bottom:1rem;">🌑</div>
          <p>Aucun rôle ne correspond à votre recherche.</p>
        </div>
      `;
    }
  }

  // Filtres
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFaction = btn.dataset.faction || 'all';
      buildCards();
    });
  });

  // Recherche
  if (searchEl) {
    searchEl.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      buildCards();
    });
  }

  // Initial
  buildCards();

  // Re-build cards when language changes
  document.addEventListener('langchange', () => {
    // re-build cards with new language
    buildCards();
  });
})();
