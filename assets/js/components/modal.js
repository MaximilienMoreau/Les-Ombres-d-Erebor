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
    const factionLabel = { lune: 'Conseil de la Lune', ombre: 'Ombre Souveraine', solitaire: 'Solitaire' };
    const diffLabel    = { beginner: 'Débutant', advanced: 'Intermédiaire', expert: 'Expert' };
    const diffEmoji    = { beginner: '⭐', advanced: '⭐⭐', expert: '⭐⭐⭐' };

    // Construire les interactions
    const interactionTags = this.buildInteractionTags(role);

    return `
      <button class="modal-close" aria-label="Fermer">✕</button>

      <div class="modal-header">
        <div class="modal-icon">${role.icon}</div>
        <div class="modal-title-group">
          <h2>${role.name}</h2>
          <div class="modal-meta">
            <span class="faction-badge ${role.faction}">${factionLabel[role.faction]}</span>
            <span class="difficulty-badge ${role.difficulty}" title="Difficulté">
              ${diffEmoji[role.difficulty]} ${diffLabel[role.difficulty]}
            </span>
          </div>
        </div>
      </div>

      <div class="modal-body">
        <div class="modal-section">
          <h4>📖 Lore</h4>
          <p class="modal-lore">${role.lore}</p>
        </div>

        <div class="modal-section">
          <h4>⚡ Pouvoir</h4>
          <p class="modal-power-text">${role.fullPower}</p>
        </div>

        ${role.particularite ? `
        <div class="modal-section">
          <h4>⚠️ Particularité</h4>
          <p class="modal-power-text" style="color: var(--color-gold);">${role.particularite}</p>
        </div>` : ''}

        ${interactionTags ? `
        <div class="modal-section">
          <h4>🔗 Interactions notables</h4>
          <div class="modal-tags">${interactionTags}</div>
        </div>` : ''}
      </div>
    `;
  }

  buildInteractionTags(role) {
    if (typeof INTERACTIONS === 'undefined' || typeof ROLES === 'undefined') return '';

    const tags = [];
    INTERACTIONS.forEach(inter => {
      if (!inter.roles.includes(role.id)) return;
      const partnerId = inter.roles.find(r => r !== role.id);
      const partner   = ROLES.find(r => r.id === partnerId);
      if (!partner) return;

      const label = inter.type === 'synergie'
        ? `🤝 avec ${partner.icon} ${partner.name}`
        : inter.type === 'conflit'
        ? `⚔️ contre ${partner.icon} ${partner.name}`
        : `🔄 détourne ${partner.icon} ${partner.name}`;

      tags.push(`
        <span class="interaction-tag ${inter.type}" title="${inter.description}"
              data-partner="${partnerId}">
          ${label}
        </span>
      `);
    });

    return tags.join('');
  }
}
