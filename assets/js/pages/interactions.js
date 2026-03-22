/* ============================================
   INTERACTIONS PAGE — Matrice 25×25
   ============================================ */

(function initInteractionsPage() {
  const tableContainer = document.getElementById('matrix-container');
  const mobileSelect   = document.getElementById('mobile-role-select');
  const mobileList     = document.getElementById('mobile-interactions-list');
  const tooltip        = document.getElementById('matrix-tooltip');

  if (typeof ROLES === 'undefined' || typeof INTERACTIONS === 'undefined') return;

  // ---- Construction de la matrice desktop ----
  if (tableContainer) {
    buildMatrix();
  }

  // ---- Sélecteur mobile ----
  if (mobileSelect && mobileList) {
    buildMobileSelect();
    mobileSelect.addEventListener('change', () => {
      buildMobileList(mobileSelect.value);
    });
  }

  function buildMatrix() {
    const table = document.createElement('table');
    table.className = 'matrix-table';
    table.setAttribute('role', 'grid');

    // ---- En-têtes de colonnes ----
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Coin vide
    const corner = document.createElement('th');
    corner.className = 'matrix-corner';
    corner.setAttribute('aria-label', 'Rôles');
    headerRow.appendChild(corner);

    // Colonnes (axe Y)
    ROLES.forEach(role => {
      const th = document.createElement('th');
      th.className = 'matrix-col-header';
      th.setAttribute('scope', 'col');
      th.innerHTML = `
        <div class="col-header-inner" data-role="${role.id}" title="${role.name}">
          <span class="col-header-text">${role.icon} ${role.name}</span>
        </div>
      `;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    // ---- Corps du tableau ----
    const tbody = document.createElement('tbody');

    ROLES.forEach(rowRole => {
      const tr = document.createElement('tr');

      // En-tête de ligne (axe X)
      const rowTh = document.createElement('th');
      rowTh.className = 'matrix-row-header';
      rowTh.setAttribute('scope', 'row');
      rowTh.innerHTML = `
        <div class="row-header-inner" data-role="${rowRole.id}" title="${rowRole.name}">
          <span class="row-icon">${rowRole.icon}</span>
          <span class="row-name">${rowRole.name}</span>
        </div>
      `;
      tr.appendChild(rowTh);

      // Cellules
      ROLES.forEach(colRole => {
        const td = document.createElement('td');
        td.setAttribute('role', 'gridcell');
        td.setAttribute('data-row', rowRole.id);
        td.setAttribute('data-col', colRole.id);

        if (rowRole.id === colRole.id) {
          td.className = 'matrix-cell diagonal';
          td.innerHTML = `<div class="cell-inner">—</div>`;
        } else {
          const inter = getInteraction(rowRole.id, colRole.id);
          if (inter) {
            td.className = `matrix-cell ${inter.type}`;
            td.setAttribute('data-interaction', JSON.stringify({
              rowName: rowRole.name, colName: colRole.name,
              rowIcon: rowRole.icon, colIcon: colRole.icon,
              type: inter.type, emoji: inter.emoji,
              desc: inter.description,
            }));
            td.innerHTML = `<div class="cell-inner">${inter.emoji}</div>`;
            td.setAttribute('tabindex', '0');
            td.setAttribute('aria-label', `${rowRole.name} — ${colRole.name}: ${inter.type}`);
          } else {
            td.className = 'matrix-cell none';
            td.innerHTML = `<div class="cell-inner"></div>`;
          }
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);

    // ---- Tooltip ----
    bindTooltip(table);

    // ---- Focus mode (clic sur en-tête) ----
    bindFocusMode(table);
  }

  function bindTooltip(table) {
    if (!tooltip) return;

    table.addEventListener('mousemove', (e) => {
      const cell = e.target.closest('.matrix-cell[data-interaction]');
      if (!cell) {
        tooltip.classList.remove('visible');
        return;
      }

      const data = JSON.parse(cell.dataset.interaction);
      const typeLabels = {
        synergie: '🤝 Synergie',
        conflit:  '⚔️ Conflit',
        detournement: '🔄 Détournement',
      };

      tooltip.innerHTML = `
        <div class="tooltip-roles">
          ${data.rowIcon} ${data.rowName}
          <span class="tooltip-vs">×</span>
          ${data.colIcon} ${data.colName}
        </div>
        <div class="tooltip-type ${data.type}">${typeLabels[data.type] || data.type}</div>
        <p class="tooltip-desc">${data.desc}</p>
      `;

      const rect   = tooltip.getBoundingClientRect();
      const margin = 12;
      let x = e.clientX + margin;
      let y = e.clientY + margin;

      // Éviter de sortir de l'écran
      if (x + 280 > window.innerWidth)  x = e.clientX - 280 - margin;
      if (y + rect.height > window.innerHeight) y = e.clientY - rect.height - margin;

      tooltip.style.left = `${x}px`;
      tooltip.style.top  = `${y}px`;
      tooltip.classList.add('visible');
    });

    table.addEventListener('mouseleave', () => {
      tooltip.classList.remove('visible');
    });
  }

  function bindFocusMode(table) {
    let focusedRole = null;

    table.addEventListener('click', (e) => {
      const header = e.target.closest('[data-role]');
      if (!header) {
        // Clic ailleurs → dé-focus
        if (focusedRole) {
          focusedRole = null;
          clearFocus(table);
        }
        return;
      }

      const roleId = header.dataset.role;
      if (focusedRole === roleId) {
        focusedRole = null;
        clearFocus(table);
      } else {
        focusedRole = roleId;
        applyFocus(table, roleId);
      }
    });
  }

  function applyFocus(table, roleId) {
    table.classList.add('focus-mode');
    table.querySelectorAll('.matrix-cell').forEach(cell => {
      const row = cell.dataset.row;
      const col = cell.dataset.col;
      cell.classList.remove('focused-row', 'focused-col');
      if (row === roleId) cell.classList.add('focused-row');
      if (col === roleId) cell.classList.add('focused-col');
    });
    // En-têtes
    table.querySelectorAll('[data-role]').forEach(h => {
      h.classList.toggle('focused', h.dataset.role === roleId);
    });
  }

  function clearFocus(table) {
    table.classList.remove('focus-mode');
    table.querySelectorAll('.matrix-cell').forEach(cell => {
      cell.classList.remove('focused-row', 'focused-col');
    });
    table.querySelectorAll('[data-role]').forEach(h => {
      h.classList.remove('focused');
    });
  }

  // ---- Mobile ----
  function buildMobileSelect() {
    const grouped = [
      { label: 'Conseil de la Lune', roles: ROLES.filter(r => r.faction === 'lune') },
      { label: 'Ombre Souveraine',   roles: ROLES.filter(r => r.faction === 'ombre') },
      { label: 'Solitaires',         roles: ROLES.filter(r => r.faction === 'solitaire') },
    ];

    grouped.forEach(g => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = g.label;
      g.roles.forEach(role => {
        const opt = document.createElement('option');
        opt.value = role.id;
        opt.textContent = `${role.icon} ${role.name}`;
        optgroup.appendChild(opt);
      });
      mobileSelect.appendChild(optgroup);
    });

    // Initial
    if (ROLES.length > 0) {
      mobileSelect.value = ROLES[0].id;
      buildMobileList(ROLES[0].id);
    }
  }

  function buildMobileList(roleId) {
    if (!mobileList) return;
    mobileList.innerHTML = '';

    const relevant = INTERACTIONS.filter(i => i.roles.includes(roleId));

    if (relevant.length === 0) {
      mobileList.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;padding:2rem;">Aucune interaction répertoriée.</p>';
      return;
    }

    const typeLabels = { synergie: 'Synergie', conflit: 'Conflit', detournement: 'Détournement' };

    relevant.forEach(inter => {
      const partnerId = inter.roles.find(r => r !== roleId);
      const partner   = ROLES.find(r => r.id === partnerId);
      if (!partner) return;

      const card = document.createElement('div');
      card.className = `mobile-interaction-card ${inter.type}`;
      card.innerHTML = `
        <div class="card-icon">${inter.emoji}</div>
        <div class="card-body">
          <div class="card-title">${partner.icon} ${partner.name}
            <span class="interaction-tag ${inter.type}" style="margin-left:8px;">${typeLabels[inter.type]}</span>
          </div>
          <p class="card-desc">${inter.description}</p>
        </div>
      `;
      mobileList.appendChild(card);
    });
  }

  // ---- Compteur de stats ----
  const stats = { synergie: 0, conflit: 0, detournement: 0 };
  INTERACTIONS.forEach(i => { if (stats[i.type] !== undefined) stats[i.type]++; });

  const statEls = {
    synergie:     document.getElementById('stat-synergies'),
    conflit:      document.getElementById('stat-conflits'),
    detournement: document.getElementById('stat-detournements'),
  };
  Object.entries(statEls).forEach(([k, el]) => {
    if (el) el.textContent = stats[k];
  });
})();
