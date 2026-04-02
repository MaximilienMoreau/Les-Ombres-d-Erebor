/* ============================================
   MODAL — Fenêtre de détail d'un rôle
   ============================================ */

class RoleModal {
  constructor() {
    this.overlay = document.getElementById('role-modal-overlay');
    this.modal   = document.getElementById('role-modal');
    if (!this.overlay || !this.modal) return;

    this.closeBtn = this.modal.querySelector('.modal-close');
    this.bindEvents();
  }

  bindEvents() {
    // Fermer bouton
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    // Fermer overlay
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    // Fermer Échap
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  }

  open(role) {
    if (!role || !this.overlay) return;

    // Faction sur la modal
    this.modal.className = `modal ${role.faction}`;

    // Contenu
    this.modal.innerHTML = this.buildContent(role);

    // Réattacher le close
    const closeBtn = this.modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    // Ouvrir
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Scroll to top
    this.modal.scrollTop = 0;
  }

  close() {
    if (!this.overlay) return;
    this.overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  buildContent(role) {
    const lang = window.i18n?.getCurrentLang?.() || 'fr';
    function rl(r, field) {
      return (lang === 'en' && r[field + 'En']) ? r[field + 'En'] : r[field];
    }
    const t = (k) => window.i18n?.t(k) || k;

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
    const diffEmoji = { beginner: '⭐', advanced: '⭐⭐', expert: '⭐⭐⭐' };

    const interactionTags = this.buildInteractionTags(role, lang);

    return `
    <button class="modal-close" aria-label="${t('modal.close')}">✕</button>

    <div class="modal-header">
      <div class="modal-icon">${role.icon}</div>
      <div class="modal-title-group">
        <h2>${rl(role, 'name')}</h2>
        <div class="modal-meta">
          <span class="faction-badge ${role.faction}">${factionLabel[role.faction]}</span>
          <span class="difficulty-badge ${role.difficulty}" title="${t('modal.difficultyTitle')}">
            ${diffEmoji[role.difficulty]} ${diffLabel[role.difficulty]}
          </span>
        </div>
      </div>
    </div>

    <div class="modal-body">
      <div class="modal-section">
        <h4>📖 Lore</h4>
        <p class="modal-lore">${rl(role, 'lore')}</p>
      </div>

      <div class="modal-section">
        <h4>${t('modal.sectionPower')}</h4>
        <p class="modal-power-text">${rl(role, 'fullPower')}</p>
      </div>

      ${role.particularite ? `
      <div class="modal-section">
        <h4>${t('modal.sectionParticularity')}</h4>
        <p class="modal-power-text" style="color: var(--color-gold);">${rl(role, 'particularite')}</p>
      </div>` : ''}

      ${interactionTags ? `
      <div class="modal-section">
        <h4>${t('modal.sectionInteractions')}</h4>
        <div class="modal-tags">${interactionTags}</div>
      </div>` : ''}
    </div>
  `;
  }

  buildInteractionTags(role, lang) {
    if (typeof INTERACTIONS === 'undefined' || typeof ROLES === 'undefined') return '';
    const t = (k) => window.i18n?.t(k) || k;
    function rl(r, field) {
      return (lang === 'en' && r[field + 'En']) ? r[field + 'En'] : r[field];
    }

    const tags = [];
    INTERACTIONS.forEach(inter => {
      if (!inter.roles.includes(role.id)) return;
      const partnerId = inter.roles.find(r => r !== role.id);
      const partner   = ROLES.find(r => r.id === partnerId);
      if (!partner) return;

      const label = inter.type === 'synergie'
        ? `🤝 ${t('modal.interactionWith')} ${partner.icon} ${rl(partner, 'name')}`
        : inter.type === 'conflit'
        ? `⚔️ ${t('modal.interactionAgainst')} ${partner.icon} ${rl(partner, 'name')}`
        : `🔄 ${t('modal.interactionSubverts')} ${partner.icon} ${rl(partner, 'name')}`;

      const desc = (lang === 'en' && inter.descriptionEn) ? inter.descriptionEn : inter.description;

      tags.push(`
        <span class="interaction-tag ${inter.type}" title="${desc}"
              data-partner="${partnerId}">
          ${label}
        </span>
      `);
    });

    return tags.join('');
  }
}
