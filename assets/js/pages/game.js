/* ============================================
   GAME ENGINE — Les Ombres d'Erebor (Online)
   ============================================ */

// ---- Événements Crépuscule ----
const CREPUSCULE_EVENTS = [
  { id: 'inondation',   icon: '🌊', title: "L'Inondation",          desc: "Un quartier entier est submergé. Ses habitants doivent fuir vers les quartiers voisins.",                            effect: "Le MJ redistribue un quartier entier vers les autres." },
  { id: 'miroir',       icon: '🪞', title: "La Malédiction du Miroir", desc: "Cette nuit, tous les pouvoirs sont inversés. Les soins deviennent des dégâts, les blocages libèrent.",           effect: "La prochaine nuit, tous les effets nocturnes sont inversés." },
  { id: 'apparition',   icon: '👻', title: "L'Apparition",           desc: "Un esprit errant se manifeste et peut révéler une vérité absolue à l'assemblée.",                                   effect: "Un Esprit errant choisit de révéler son rôle ou une information." },
  { id: 'pacte',        icon: '🩸', title: "Le Pacte de Sang",        desc: "Deux habitants sont liés par un pacte invisible. Leurs factions doivent être révélées.",                           effect: "Le MJ désigne 2 joueurs aléatoires qui révèlent leur faction (pas leur rôle)." },
  { id: 'nuit-blanche', icon: '🌕', title: "La Nuit Blanche",        desc: "La lune pleine baigne Erebor de lumière. Impossible d'agir dans l'obscurité ce tour.",                             effect: "Pas de phase de Nuit ce tour. Les Ombres perdent leur action." },
  { id: 'exil',         icon: '⛓️', title: "Le Grand Exil",          desc: "Un habitant est banni de la ville pour un tour entier. Il ne peut ni agir ni voter.",                               effect: "Le MJ exile un joueur aléatoire pendant un tour." },
  { id: 'oracle',       icon: '🔮', title: "La Vision Collective",   desc: "Une prophétie se répand dans tous les quartiers. Chaque joueur reçoit un fragment d'information anonyme.",          effect: "Le MJ envoie un indice (vrai ou faux) à tous les joueurs." },
  { id: 'festin',       icon: '🍷', title: "Le Festin des Ombres",   desc: "Les Ombres peuvent agir deux fois cette nuit. Le Conseil doit redoubler de vigilance.",                             effect: "Les Ombres peuvent soumettre 2 actions cette nuit." },
];

const NIGHT_ORDER = [
  { id: 'sculpteur',   name: 'Sculpteur de Cauchemars', icon: '😱', prompt: "Choisit un joueur à bloquer cette nuit (perd son pouvoir).",        needsTarget: true },
  { id: 'mainombre',   name: "Main de l'Ombre",         icon: '🖤', prompt: "Peut corrompre un joueur du Conseil (irréversible).",               needsTarget: true },
  { id: 'murmure',     name: "Murmure de l'Abysse",     icon: '🌑', prompt: "Choisit un joueur pour lui envoyer une fausse information demain.", needsTarget: true },
  { id: 'fauxoracle',  name: 'Fausse Oracle',           icon: '🔮', prompt: "Envoie une fausse vision à un joueur.",                            needsTarget: true },
  { id: 'assassin',    name: 'Assassin Voilé',          icon: '🗡️', prompt: "Élimine un joueur dans son quartier.",                             needsTarget: true },
  { id: 'chasseur',    name: "Chasseur de l'Ombre",     icon: '🏹', prompt: "Peut cibler un joueur pour le tuer (risque mortel si innocent).",   needsTarget: true, optional: true },
  { id: 'gardien',     name: 'Gardien de la Porte',     icon: '🚪', prompt: "Bloque un joueur dans son quartier (ne peut pas se déplacer).",    needsTarget: true },
  { id: 'pretresse',   name: 'Prêtresse de la Lune',    icon: '🌙', prompt: "Protège un joueur de la mort cette nuit.",                         needsTarget: true },
  { id: 'voyant',      name: 'Voyant Éclipsé',          icon: '👁️', prompt: "Révèle le rôle exact d'un joueur (usage unique).",                 needsTarget: true, oneTime: true },
  { id: 'herald',      name: "Héraut de l'Aube",        icon: '🌅', prompt: "Reçoit : y a-t-il une Ombre dans son quartier ? (oui/non)",        needsTarget: false, gmResolved: true },
  { id: 'archives',    name: 'Maître des Archives',     icon: '📜', prompt: "Reçoit un fragment d'alignement sur un joueur aléatoire.",         needsTarget: false, gmResolved: true },
  { id: 'messager',    name: 'Messager Céleste',        icon: '🕊️', prompt: "Envoie un message secret à un joueur dans un autre quartier.",     needsTarget: true },
  { id: 'collectionneur', name: 'Collectionneur',       icon: '🗃️', prompt: "Écoute une conversation privée entre deux joueurs.",              needsTarget: true },
  { id: 'assassinmuet', name: 'Assassin Muet',          icon: '🤫', prompt: "Peut utiliser son unique meurtre cette nuit.",                     needsTarget: true, optional: true },
];

// ---- App State ----
let STATE = {
  roomCode: null,
  playerId: null,
  isGM: false,
  isLocal: false,
  players: {},
  phase: 'lobby',
  round: 0,
  nightStep: 0,
  votes: {},
  event: null,
  config: { playerCount: 10, roundCount: 6 },
  myRole: null,
  selectedNightTarget: null,
  nightSubmitted: false,
};

let db = null;
let roomRef = null;

// ---- Init ----
function init() {
  const params = new URLSearchParams(window.location.search);
  STATE.roomCode = params.get('room') || sessionStorage.getItem('erebor_room');
  STATE.isGM     = params.get('gm') === '1' || sessionStorage.getItem('erebor_is_gm') === 'true';
  STATE.isLocal  = params.get('mode') === 'local' || !FIREBASE_CONFIG.configured;
  STATE.playerId = getOrCreateUID();

  // Connexion Firebase ou mode local
  if (FIREBASE_CONFIG.configured && !STATE.isLocal) {
    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      db = firebase.database();
    } catch(e) { console.warn('Firebase:', e); STATE.isLocal = true; }
  }

  // Indicateur connexion
  updateConnectionBar();

  if (!STATE.roomCode) {
    showView('setup');
    return;
  }

  if (STATE.isLocal && STATE.isGM && !STATE.roomCode) {
    setupLocalRoom();
    return;
  }

  showView('lobby');
  syncRoom();

  // Afficher le grimoire si GM
  if (STATE.isGM) {
    document.querySelector('.grimoire-toggle')?.classList.add('visible');
  }
}

function getOrCreateUID() {
  let uid = sessionStorage.getItem('erebor_uid');
  if (!uid) {
    uid = 'u' + Date.now() + Math.random().toString(36).slice(2, 7);
    sessionStorage.setItem('erebor_uid', uid);
  }
  return uid;
}

function updateConnectionBar() {
  const dot  = document.querySelector('.connection-dot');
  const text = document.querySelector('.connection-text');
  if (!dot || !text) return;

  if (STATE.isLocal) {
    dot.className  = 'connection-dot local';
    text.textContent = `Mode local · Salle : ${STATE.roomCode || '—'}`;
  } else if (db) {
    dot.className  = 'connection-dot';
    text.textContent = `Connecté · Salle : ${STATE.roomCode}`;
  } else {
    dot.className  = 'connection-dot offline';
    text.textContent = 'Non connecté';
  }
}

// ---- Vues ----
function showView(name) {
  document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(`view-${name}`);
  if (el) el.classList.add('active');
  STATE.currentView = name;
}

// ---- Sync depuis Firebase ou LocalStorage ----
function syncRoom() {
  if (db) {
    roomRef = db.ref(`rooms/${STATE.roomCode}`);
    roomRef.on('value', snap => {
      if (!snap.exists()) { showView('setup'); return; }
      applySnapshot(snap.val());
    });
  } else {
    loadLocalRoom();
  }
}

function loadLocalRoom() {
  const raw = sessionStorage.getItem(`room_${STATE.roomCode}`);
  if (!raw) { showView('setup'); return; }
  applySnapshot(JSON.parse(raw));

  // Polling léger pour le mode local (même onglet)
  setInterval(() => {
    const r = sessionStorage.getItem(`room_${STATE.roomCode}`);
    if (r) applySnapshot(JSON.parse(r));
  }, 1500);
}

function saveLocalRoom(data) {
  if (STATE.isLocal || !db) {
    sessionStorage.setItem(`room_${STATE.roomCode}`, JSON.stringify(data));
  }
}

function applySnapshot(data) {
  STATE.players    = data.players || {};
  STATE.phase      = data.phase || 'lobby';
  STATE.round      = data.round || 0;
  STATE.nightStep  = data.nightStep || 0;
  STATE.votes      = data.votes || {};
  STATE.event      = data.event || null;
  STATE.config     = data.config || STATE.config;

  // Mon rôle
  if (STATE.players[STATE.playerId]) {
    STATE.myRole = STATE.players[STATE.playerId].roleId;
  }

  renderPhase();
}

// ---- Rendu de la phase ----
function renderPhase() {
  switch(STATE.phase) {
    case 'lobby':       renderLobby();      break;
    case 'night':       renderNight();      break;
    case 'day':         renderDay();        break;
    case 'crepuscule':  renderCrepuscule(); break;
    case 'gameover':    renderGameover();   break;
    default:            showView('lobby');
  }
}

// ---- LOBBY ----
function renderLobby() {
  showView('lobby');

  // Code de salle
  const codeEl = document.getElementById('lobby-room-code');
  if (codeEl) codeEl.textContent = STATE.roomCode;

  // Liste des joueurs
  renderPlayerList();

  // Contrôles MJ
  const gmPanel = document.getElementById('gm-lobby-panel');
  if (gmPanel) gmPanel.style.display = STATE.isGM ? 'flex' : 'none';

  // Nombre de joueurs connectés
  const count = Object.keys(STATE.players).length;
  const countEl = document.getElementById('player-list-count');
  if (countEl) countEl.textContent = `${count} joueur${count > 1 ? 's' : ''} connecté${count > 1 ? 's' : ''}`;
}

function renderPlayerList() {
  const list = document.getElementById('player-list-body');
  if (!list) return;
  list.innerHTML = '';

  Object.entries(STATE.players).forEach(([uid, p]) => {
    const row = document.createElement('div');
    row.className = 'player-row';
    const initial = (p.name || '?')[0].toUpperCase();
    row.innerHTML = `
      <div class="player-avatar unassigned">${initial}</div>
      <span class="player-name">${p.name}</span>
      <span class="player-status-tag ${p.isGM ? 'gm' : 'waiting'}">${p.isGM ? '⚔️ MJ' : '⏳ Attente'}</span>
    `;
    list.appendChild(row);
  });
}

// ---- Assigner les rôles (MJ) ----
async function assignRoles() {
  const playerIds = Object.keys(STATE.players).filter(uid => !STATE.players[uid].isGM);
  const checkedBoxes = document.querySelectorAll('.role-checkbox-item input:checked');
  const selectedRoles = Array.from(checkedBoxes).map(cb => cb.value);

  if (selectedRoles.length < playerIds.length) {
    alert(`Sélectionnez au moins ${playerIds.length} rôles pour les joueurs.`);
    return;
  }

  // Mélanger les rôles
  const shuffled = selectedRoles.sort(() => Math.random() - 0.5);

  const updates = {};
  playerIds.forEach((uid, i) => {
    updates[`players/${uid}/roleId`] = shuffled[i] || null;
  });
  // MJ sans rôle (arbitre)
  updates[`players/${STATE.playerId}/roleId`] = 'gm';

  await writeRoom(updates);
  addLog('🃏 Les rôles ont été attribués. La nuit va tomber...', 'gm');
}

// ---- Démarrer la nuit (MJ) ----
async function startNight() {
  const updates = {
    phase: 'night',
    round: STATE.round + 1,
    nightStep: 0,
    votes: null,
    'event': null,
  };

  // Reset actions nocturnes
  Object.keys(STATE.players).forEach(uid => {
    updates[`players/${uid}/nightActionDone`]   = false;
    updates[`players/${uid}/nightActionTarget`] = null;
  });

  await writeRoom(updates);
  addLog(`🌑 Tour ${STATE.round + 1} — La nuit tombe sur Erebor...`, 'gm');
}

// ---- NIGHT ----
function renderNight() {
  showView('night');
  STATE.selectedNightTarget = null;
  STATE.nightSubmitted = false;

  renderNightOrder();
  updateGrimoire();

  if (STATE.isGM) {
    renderGMNightPanel();
  } else {
    renderPlayerNightPanel();
  }
}

function renderNightOrder() {
  const list = document.getElementById('night-step-list');
  if (!list) return;
  list.innerHTML = '';

  NIGHT_ORDER.forEach((step, index) => {
    const li = document.createElement('li');
    li.className = `night-step-item ${index < STATE.nightStep ? 'done' : index === STATE.nightStep ? 'current' : 'pending'}`;
    li.innerHTML = `
      <span class="step-icon">${step.icon}</span>
      <span class="step-name">${step.name}</span>
      <div class="step-check"></div>
    `;
    list.appendChild(li);
  });
}

function renderGMNightPanel() {
  const panel = document.getElementById('gm-night-content');
  if (!panel) return;
  panel.style.display = 'block';
  document.getElementById('player-night-content')?.setAttribute('style', 'display:none');

  const step = NIGHT_ORDER[STATE.nightStep];
  if (!step) {
    panel.innerHTML = `
      <div style="text-align:center;padding:2rem;">
        <div style="font-size:3rem;margin-bottom:1rem;">✅</div>
        <h3 style="color:var(--color-synergie-light);margin-bottom:1rem;">Toutes les actions nocturnes sont résolues</h3>
        <button class="gm-btn" onclick="startDay()" style="margin:0 auto;max-width:300px;">☀️ Lancer la phase de Jour</button>
      </div>
    `;
    return;
  }

  // Soumissions reçues
  const submissions = Object.entries(STATE.players)
    .filter(([, p]) => p.nightActionDone && !p.isGM)
    .map(([uid, p]) => {
      const target = p.nightActionTarget ? (STATE.players[p.nightActionTarget]?.name || p.nightActionTarget) : '—';
      return `<div class="submission-item">
        <span class="submission-actor">${p.name}</span>
        <span class="submission-arrow">→</span>
        <span class="submission-target">${target}</span>
        <span class="submission-status">✓ Soumis</span>
      </div>`;
    }).join('');

  panel.innerHTML = `
    <div class="current-role-prompt">
      <h4>${step.icon} ${step.name}</h4>
      <p>${step.prompt}</p>
    </div>
    ${submissions ? `<div class="night-action-submissions">${submissions}</div>` : ''}
    <div style="display:flex;gap:1rem;flex-wrap:wrap;">
      <button class="gm-btn" onclick="advanceNightStep()" style="flex:1;">
        ✓ Action résolue → Suivant
      </button>
      ${step.gmResolved ? `<button class="gm-btn" onclick="gmResolvePassive('${step.id}')" style="flex:1;">
        📤 Envoyer l'info passive
      </button>` : ''}
    </div>
  `;
}

function renderPlayerNightPanel() {
  const panel = document.getElementById('player-night-content');
  if (!panel) return;
  panel.style.display = 'block';
  document.getElementById('gm-night-content')?.setAttribute('style', 'display:none');

  const me = STATE.players[STATE.playerId];
  if (!me) return;

  const roleData = ROLES.find(r => r.id === me.roleId);
  const factionLabel = { lune: 'Conseil de la Lune', ombre: 'Ombre Souveraine', solitaire: 'Solitaire' };

  // Carte de rôle
  let html = '';
  if (roleData) {
    html += `
      <div class="role-reveal-card ${roleData.faction}">
        <div class="role-reveal-eyebrow">Votre rôle secret</div>
        <span class="role-reveal-icon">${roleData.icon}</span>
        <h2 class="role-reveal-name">${roleData.name}</h2>
        <span class="faction-badge ${roleData.faction}" style="margin:0 auto 1rem;">${factionLabel[roleData.faction]}</span>
        <p class="role-reveal-power">${roleData.shortPower}</p>
        ${roleData.faction === 'solitaire' ? `<div class="role-reveal-objective">🎯 ${roleData.shortPower}</div>` : ''}
      </div>
    `;
  }

  // Formulaire d'action nocturne
  const currentStep = NIGHT_ORDER[STATE.nightStep];
  const isMyTurn = currentStep && roleData && currentStep.id === roleData.id;

  if (STATE.nightSubmitted || (me && me.nightActionDone)) {
    html += `
      <div class="night-waiting">
        <div class="night-waiting-icon">🌙</div>
        <p>Votre action a été enregistrée. Attendez la résolution de la phase nocturne.</p>
      </div>
    `;
  } else if (isMyTurn && currentStep.needsTarget) {
    const alivePlayers = Object.entries(STATE.players)
      .filter(([uid, p]) => p.isAlive && uid !== STATE.playerId && !p.isGM)
      .map(([uid, p]) => `
        <button class="target-btn" data-uid="${uid}" onclick="selectTarget('${uid}', this)">
          <span class="t-icon">👤</span>
          <span class="t-name">${p.name}</span>
        </button>
      `).join('');

    html += `
      <div class="night-action-form">
        <h3>⚡ Votre action : ${currentStep.name}</h3>
        <p>${currentStep.prompt}</p>
        <div class="target-grid">${alivePlayers}</div>
        ${currentStep.optional ? `<button class="btn btn-secondary" onclick="skipNightAction()" style="width:100%;margin-bottom:0.5rem;">Passer mon action</button>` : ''}
        <button class="btn btn-primary" onclick="submitNightAction()" style="width:100%;" id="submit-night-btn" disabled>
          ✓ Confirmer l'action
        </button>
      </div>
    `;
  } else {
    html += `
      <div class="night-waiting">
        <div class="night-waiting-icon">🌙</div>
        <p>${isMyTurn ? "C'est votre tour..." : "Ce n'est pas encore votre tour. Attendez dans l'obscurité."}</p>
      </div>
    `;
  }

  panel.innerHTML = html;
}

function selectTarget(uid, btn) {
  STATE.selectedNightTarget = uid;
  document.querySelectorAll('.target-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('submit-night-btn')?.removeAttribute('disabled');
}

async function submitNightAction() {
  if (!STATE.selectedNightTarget) return;
  STATE.nightSubmitted = true;
  const updates = {
    [`players/${STATE.playerId}/nightActionDone`]:   true,
    [`players/${STATE.playerId}/nightActionTarget`]: STATE.selectedNightTarget,
  };
  await writeRoom(updates);
  renderPlayerNightPanel();
}

async function skipNightAction() {
  STATE.nightSubmitted = true;
  const updates = {
    [`players/${STATE.playerId}/nightActionDone`]: true,
    [`players/${STATE.playerId}/nightActionTarget`]: null,
  };
  await writeRoom(updates);
  renderPlayerNightPanel();
}

async function advanceNightStep() {
  const nextStep = STATE.nightStep + 1;
  if (nextStep >= NIGHT_ORDER.length) {
    await writeRoom({ nightStep: NIGHT_ORDER.length });
  } else {
    await writeRoom({ nightStep: nextStep });
  }
}

// ---- Démarrer le jour (MJ) ----
async function startDay() {
  const updates = { phase: 'day', votes: null };
  await writeRoom(updates);
  addLog('☀️ Le jour se lève sur Erebor. Discutez et votez !', 'gm');
}

// ---- DAY ----
function renderDay() {
  showView('day');
  renderEventFeed();
  renderVotePanel();
  renderAlivePlayers();
  renderGMDayControls();
  updateGrimoire();
}

function renderEventFeed() {
  const body = document.getElementById('event-feed-body');
  if (!body || !STATE.event) return;
}

function addLog(text, type = 'normal') {
  const body = document.getElementById('event-feed-body');
  if (!body) return;

  const entry = document.createElement('div');
  entry.className = 'feed-entry';
  const icon = type === 'death' ? '💀' : type === 'revive' ? '✨' : type === 'event' ? '🌀' : type === 'gm' ? '⚔️' : '📣';
  entry.innerHTML = `
    <span class="feed-icon">${icon}</span>
    <span class="feed-text ${type}">${text}</span>
    <span class="feed-ts">${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
  `;
  body.appendChild(entry);
  body.scrollTop = body.scrollHeight;

  // Persister dans Firebase
  if (db) db.ref(`rooms/${STATE.roomCode}/logs`).push({ text, type, ts: Date.now() });
}

function renderVotePanel() {
  const panel = document.getElementById('vote-candidates');
  if (!panel) return;

  const me = STATE.players[STATE.playerId];
  const arrested = me && me.arrested;
  const myVote   = STATE.votes[STATE.playerId];

  panel.innerHTML = '';
  Object.entries(STATE.players)
    .filter(([, p]) => p.isAlive && !p.isGM)
    .forEach(([uid, p]) => {
      const voteCount = Object.values(STATE.votes || {}).filter(v => v === uid).length;
      const total     = Object.keys(STATE.players).filter(id => STATE.players[id].isAlive).length;
      const pct       = total > 0 ? Math.round((voteCount / total) * 100) : 0;

      const item = document.createElement('div');
      item.className = `vote-candidate${myVote === uid ? ' voted' : ''}${arrested ? ' arrested' : ''}`;
      item.innerHTML = `
        <span class="vote-candidate-name">👤 ${p.name}</span>
        ${STATE.isGM ? `<div class="vote-bar-wrapper"><div class="vote-bar" style="width:${pct}%"></div></div><span class="vote-count-text">${voteCount}</span>` : ''}
        ${!STATE.isGM && !arrested ? `<button class="btn btn-secondary" onclick="submitVote('${uid}')" style="padding:0.25rem 0.75rem;font-size:0.75rem;">Accuser</button>` : ''}
      `;
      panel.appendChild(item);
    });
}

async function submitVote(targetId) {
  await writeRoom({ [`votes/${STATE.playerId}`]: targetId });
  renderVotePanel();
}

async function resolveVote() {
  const tallies = {};
  Object.values(STATE.votes || {}).forEach(v => { tallies[v] = (tallies[v] || 0) + 1; });
  let topId = null, topCount = 0;
  Object.entries(tallies).forEach(([uid, count]) => {
    if (count > topCount) { topId = uid; topCount = count; }
  });

  if (topId && STATE.players[topId]) {
    const name = STATE.players[topId].name;
    await writeRoom({ [`players/${topId}/isAlive`]: false });
    addLog(`💀 ${name} a été exécuté par vote du peuple.`, 'death');
    await checkVictory();
  } else {
    addLog('🤝 Égalité — aucun joueur n\'est exécuté.', 'normal');
  }
}

function renderAlivePlayers() {
  const list = document.getElementById('alive-players-list');
  if (!list) return;
  list.innerHTML = '';

  Object.entries(STATE.players).forEach(([, p]) => {
    if (p.isGM) return;
    const row = document.createElement('div');
    row.className = 'alive-player-row';
    const status = p.isAlive ? 'alive' : 'dead';
    row.innerHTML = `
      <div class="alive-indicator ${status}"></div>
      <span class="alive-player-name">${p.name}</span>
      <span class="alive-player-status">${p.isAlive ? 'En vie' : '💀 Mort'}</span>
    `;
    list.appendChild(row);
  });
}

function renderGMDayControls() {
  const panel = document.getElementById('gm-day-controls');
  if (!panel) return;
  panel.style.display = STATE.isGM ? 'flex' : 'none';
}

// ---- CRÉPUSCULE (MJ) ----
async function startCrepuscule() {
  const event = CREPUSCULE_EVENTS[Math.floor(Math.random() * CREPUSCULE_EVENTS.length)];
  await writeRoom({ phase: 'crepuscule', event });
  addLog(`🌅 Crépuscule : ${event.title}`, 'event');
}

function renderCrepuscule() {
  showView('crepuscule');
  const ev = STATE.event;
  if (!ev) return;

  const iconEl  = document.getElementById('event-icon');
  const titleEl = document.getElementById('event-title');
  const descEl  = document.getElementById('event-desc');
  const effectEl = document.getElementById('event-effect');

  if (iconEl)   iconEl.textContent  = ev.icon;
  if (titleEl)  titleEl.textContent = ev.title;
  if (descEl)   descEl.textContent  = ev.desc;
  if (effectEl) effectEl.textContent = `Effet : ${ev.effect}`;
}

async function continueToCrepuscule() {
  await startCrepuscule();
}

async function continueToNextNight() {
  await startNight();
}

// ---- Vérifier victoire ----
async function checkVictory() {
  const alive = Object.entries(STATE.players).filter(([, p]) => p.isAlive && !p.isGM);
  const lune   = alive.filter(([, p]) => {
    const r = ROLES.find(r => r.id === p.roleId);
    return r && r.faction === 'lune';
  });
  const ombre  = alive.filter(([, p]) => {
    const r = ROLES.find(r => r.id === p.roleId);
    return r && r.faction === 'ombre';
  });

  if (ombre.length === 0) {
    await writeRoom({ phase: 'gameover', winner: { faction: 'lune', name: 'Conseil de la Lune' } });
  } else if (ombre.length >= lune.length) {
    await writeRoom({ phase: 'gameover', winner: { faction: 'ombre', name: 'Ombre Souveraine' } });
  } else if (STATE.round >= STATE.config.roundCount) {
    await writeRoom({ phase: 'gameover', winner: { faction: 'ombre', name: 'Ombre Souveraine (temps écoulé)' } });
  }
}

// ---- GAME OVER ----
function renderGameover() {
  showView('gameover');

  // Lire les données depuis Firebase
  if (db) {
    db.ref(`rooms/${STATE.roomCode}/winner`).get().then(snap => {
      if (snap.exists()) applyGameover(snap.val());
    });
  }
}

function applyGameover(winner) {
  const banner   = document.getElementById('gameover-banner');
  const nameEl   = document.getElementById('gameover-winner-name');
  const subtitleEl = document.getElementById('gameover-subtitle');

  if (banner) banner.className = `gameover-winner-banner ${winner.faction}`;
  if (nameEl) nameEl.textContent = winner.name;

  const icons = { lune: '🌙', ombre: '🌑', solitaire: '🌀' };
  const iconEl = document.getElementById('gameover-icon');
  if (iconEl) iconEl.textContent = icons[winner.faction] || '🏆';

  const subtitles = {
    lune:   'La lumière triomphe des ténèbres. Erebor est sauvée.',
    ombre:  'Les Ombres ont gagné. Erebor sombre dans la nuit éternelle.',
    solitaire: 'Un destin solitaire s\'accomplit hors des lignes de faction.'
  };
  if (subtitleEl) subtitleEl.textContent = subtitles[winner.faction] || '';

  // Révéler les rôles
  const grid = document.getElementById('role-reveal-grid');
  if (grid) {
    grid.innerHTML = '';
    Object.entries(STATE.players).forEach(([, p]) => {
      const roleData = ROLES.find(r => r.id === p.roleId);
      if (!roleData) return;
      const item = document.createElement('div');
      item.className = 'role-reveal-item';
      item.innerHTML = `
        <div class="rri-icon">${roleData.icon}</div>
        <div class="rri-player">${p.name}</div>
        <div class="rri-role">${roleData.name}</div>
      `;
      grid.appendChild(item);
    });
  }
}

// ---- Grimoire (GM) ----
function updateGrimoire() {
  if (!STATE.isGM) return;
  const body = document.getElementById('grimoire-body');
  if (!body) return;
  body.innerHTML = '';

  Object.entries(STATE.players).forEach(([, p]) => {
    if (p.isGM) return;
    const roleData = ROLES.find(r => r.id === p.roleId);
    const row = document.createElement('div');
    row.className = 'grimoire-row';
    const statusClass = p.isAlive ? 'alive' : 'dead';
    row.innerHTML = `
      <span class="g-icon">${roleData?.icon || '❓'}</span>
      <span class="g-player">${p.name}</span>
      <span class="g-role">${roleData?.name || 'Non assigné'}</span>
      <div class="g-status ${statusClass}"></div>
    `;
    body.appendChild(row);
  });
}

function toggleGrimoire() {
  const panel = document.getElementById('grimoire-panel');
  if (panel) panel.classList.toggle('open');
}

// ---- Écriture Firebase ou LocalStorage ----
async function writeRoom(updates) {
  if (db) {
    if (typeof updates === 'object' && !Array.isArray(updates)) {
      // Vérifier si ce sont des updates partiels ou un objet complet
      const hasNestedPaths = Object.keys(updates).some(k => k.includes('/'));
      if (hasNestedPaths) {
        await db.ref(`rooms/${STATE.roomCode}`).update(updates);
      } else {
        await db.ref(`rooms/${STATE.roomCode}`).update(updates);
      }
    }
  } else {
    // Mode local
    const raw = sessionStorage.getItem(`room_${STATE.roomCode}`) || '{}';
    const room = JSON.parse(raw);
    // Appliquer les mises à jour (supporte les chemins plats)
    Object.entries(updates).forEach(([key, val]) => {
      const parts = key.split('/');
      let obj = room;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      obj[parts[parts.length - 1]] = val;
    });
    sessionStorage.setItem(`room_${STATE.roomCode}`, JSON.stringify(room));
    applySnapshot(room);
  }
}

// ---- Rôles (sélection GM) ----
function buildRoleCheckboxes() {
  const container = document.getElementById('role-checkboxes-setup');
  if (!container || typeof ROLES === 'undefined') return;
  container.innerHTML = '';

  ROLES.forEach(role => {
    const label = document.createElement('label');
    label.className = 'role-checkbox-item';
    label.innerHTML = `
      <input type="checkbox" value="${role.id}" ${['herald','assassin','pretresse','gardien','murmure','archives'].includes(role.id) ? 'checked' : ''}>
      <span class="rci-icon">${role.icon}</span>
      <span class="rci-name">${role.name}</span>
      <span class="rci-faction ${role.faction}"></span>
    `;
    container.appendChild(label);
  });
}

// ---- Setup view (depuis game.html directement sans room) ----
document.addEventListener('DOMContentLoaded', () => {
  buildRoleCheckboxes();
  init();

  // Tabs (Créer / Rejoindre dans la vue setup)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`)?.classList.add('active');
    });
  });

  // Copier code salle
  document.getElementById('copy-room-code')?.addEventListener('click', () => {
    navigator.clipboard.writeText(STATE.roomCode || '').then(() => {
      const btn = document.getElementById('copy-room-code');
      if (btn) { btn.textContent = '✓ Copié !'; setTimeout(() => btn.textContent = '📋 Copier', 2000); }
    });
  });
});

// Exposer pour HTML onclick
window.assignRoles       = assignRoles;
window.startNight        = startNight;
window.startDay          = startDay;
window.advanceNightStep  = advanceNightStep;
window.submitNightAction = submitNightAction;
window.skipNightAction   = skipNightAction;
window.selectTarget      = selectTarget;
window.submitVote        = submitVote;
window.resolveVote       = resolveVote;
window.continueToCrepuscule = continueToCrepuscule;
window.continueToNextNight  = continueToNextNight;
window.toggleGrimoire    = toggleGrimoire;
window.gmResolvePassive  = function(roleId) {
  const msg = prompt(`Message pour le joueur "${roleId}" (info passive) :`);
  if (msg) addLog(`[Info MJ → ${roleId}] ${msg}`, 'gm');
};
