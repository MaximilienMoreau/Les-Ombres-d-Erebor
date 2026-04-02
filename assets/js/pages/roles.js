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

  function rl(role, field) {
    const lang = window.i18n?.getCurrentLang?.() || 'fr';
    return (lang === 'en' && role[field + 'En']) ? role[field + 'En'] : role[field];
  }
  function t(k) { return window.i18n?.t(k) || k; }

  const FACTION_META = {
    lune:      { emoji: '🌙', key: 'common.factionLune' },
    ombre:     { emoji: '🌑', key: 'common.factionOmbre' },
    solitaire: { emoji: '🌀', key: 'common.factionSolitaire' },
  };

  function matchesSearch(role) {
    return role.name.toLowerCase().includes(currentSearch)
        || role.shortPower.toLowerCase().includes(currentSearch)
        || (role.nameEn && role.nameEn.toLowerCase().includes(currentSearch))
        || (role.shortPowerEn && role.shortPowerEn.toLowerCase().includes(currentSearch));
  }

  function buildCard(role, indexInGroup) {
    const factionLabel = {
      lune:      t('common.factionLune'),
      ombre:     t('common.factionOmbre'),
      solitaire: t('common.factionSolitaire'),
    };
    const diffLabel = {
      beginner: t('common.diffBeginner'),
      advanced: t('common.diffAdvanced'),
      expert:   t('common.diffExpert'),
    };
    const card = document.createElement('div');
    card.className = `role-card ${role.faction} reveal`;
    card.style.animationDelay = `${(indexInGroup % 8) * 0.05}s`;
    card.setAttribute('data-role', role.id);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-label', `${t('roles.ariaRole')} ${rl(role, 'name')}`);
    card.innerHTML = `
      <div class="role-card-top"></div>
      <div class="role-card-body">
        <div class="role-icon-wrapper">${role.icon}</div>
        <div class="role-name">${rl(role, 'name')}</div>
        <p class="role-power-short">${rl(role, 'shortPower')}</p>
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
    return card;
  }

  // Construire les cartes
  function buildCards() {
    grid.innerHTML = '';
    let visible = 0;
    const factions = currentFaction === 'all' ? ['lune', 'ombre', 'solitaire'] : [currentFaction];
    const groupHeadings = currentFaction === 'all';

    factions.forEach(faction => {
      const factionRoles = ROLES.filter(r => r.faction === faction && matchesSearch(r));
      if (factionRoles.length === 0) return;

      if (groupHeadings) {
        const heading = document.createElement('div');
        heading.className = `roles-faction-heading ${faction}`;
        heading.innerHTML = `
          <span class="roles-faction-heading-icon">${FACTION_META[faction].emoji}</span>
          <span class="roles-faction-heading-name">${t(FACTION_META[faction].key)}</span>
          <span class="roles-faction-heading-count">${factionRoles.length}</span>
        `;
        grid.appendChild(heading);
      }

      factionRoles.forEach((role, i) => {
        visible++;
        const card = buildCard(role, i);
        grid.appendChild(card);
        requestAnimationFrame(() => {
          setTimeout(() => card.classList.add('visible'), (i % 8) * 50);
        });
      });
    });

    if (countEl) {
      countEl.innerHTML = `<strong>${visible}</strong> ${visible > 1 ? t('roles.countPlural') : t('roles.countSingular')}`;
    }

    if (visible === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--color-text-muted);">
          <div style="font-size:3rem;margin-bottom:1rem;">🌑</div>
          <p>${t('roles.emptySearch')}</p>
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

  // Rebuild on language change
  document.addEventListener('langchange', () => buildCards());
})();
