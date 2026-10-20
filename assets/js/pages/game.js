/* ============================================
   GAME ENGINE — Les Ombres d'Erebor (Online)
   ============================================ */

// ---- Sécurité ----
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---- Helpers i18n ----
function t(k, ...args) {
  let str = window.i18n?.t(k) || k;
  args.forEach(a => { str = str.replace('%d', a).replace('%s', a); });
  return str;
}
function rl(role, field) {
  const lang = window.i18n?.getCurrentLang?.() || 'fr';
  return (lang === 'en' && role[field + 'En']) ? role[field + 'En'] : role[field];
}

// ---- Événements Crépuscule ----
const CREPUSCULE_EVENTS = [
  { id: 'inondation',   icon: '🌊', title: "L'Inondation",             titleEn: "The Flood",            desc: "Un quartier entier est submergé. Ses habitants doivent fuir vers les quartiers voisins.",                            descEn: "An entire district is submerged. Its inhabitants must flee to neighbouring districts.",                effect: "Le MJ redistribue un quartier entier vers les autres.",           effectEn: "The GM redistributes an entire district to the others." },
  { id: 'miroir',       icon: '🪞', title: "La Malédiction du Miroir",  titleEn: "The Mirror Curse",     desc: "Cette nuit, tous les pouvoirs sont inversés. Les soins deviennent des dégâts, les blocages libèrent.",           descEn: "Tonight, all powers are reversed. Healing becomes damage, blocks become releases.",                      effect: "La prochaine nuit, tous les effets nocturnes sont inversés.",     effectEn: "The next night, all nocturnal effects are inverted." },
  { id: 'apparition',   icon: '👻', title: "L'Apparition",              titleEn: "The Apparition",       desc: "Un esprit errant se manifeste et peut révéler une vérité absolue à l'assemblée.",                                   descEn: "A wandering spirit manifests and may reveal an absolute truth to the assembly.",                         effect: "Un Esprit errant choisit de révéler son rôle ou une information.", effectEn: "A Wandering Spirit chooses to reveal their role or a piece of information." },
  { id: 'pacte',        icon: '🩸', title: "Le Pacte de Sang",           titleEn: "The Blood Pact",       desc: "Deux habitants sont liés par un pacte invisible. Leurs factions doivent être révélées.",                           descEn: "Two inhabitants are bound by an invisible pact. Their factions must be revealed.",                       effect: "Le MJ désigne 2 joueurs aléatoires qui révèlent leur faction (pas leur rôle).", effectEn: "The GM designates 2 random players who reveal their faction (not their role)." },
  { id: 'nuit-blanche', icon: '🌕', title: "La Nuit Blanche",           titleEn: "The White Night",      desc: "La lune pleine baigne Erebor de lumière. Impossible d'agir dans l'obscurité ce tour.",                             descEn: "The full moon bathes Erebor in light. Acting in the dark is impossible this turn.",                      effect: "Pas de phase de Nuit ce tour. Les Ombres perdent leur action.",   effectEn: "No Night phase this turn. The Shadows lose their action." },
  { id: 'exil',         icon: '⛓️', title: "Le Grand Exil",             titleEn: "The Great Exile",      desc: "Un habitant est banni de la ville pour un tour entier. Il ne peut ni agir ni voter.",                               descEn: "An inhabitant is banished from the city for an entire turn. They can neither act nor vote.",              effect: "Le MJ exile un joueur aléatoire pendant un tour.",                effectEn: "The GM exiles a random player for one turn." },
  { id: 'oracle',       icon: '🔮', title: "La Vision Collective",      titleEn: "The Collective Vision", desc: "Une prophétie se répand dans tous les quartiers. Chaque joueur reçoit un fragment d'information anonyme.",          descEn: "A prophecy spreads across all districts. Each player receives an anonymous fragment of information.",    effect: "Le MJ envoie un indice (vrai ou faux) à tous les joueurs.",       effectEn: "The GM sends a hint (true or false) to all players." },
  { id: 'festin',       icon: '🍷', title: "Le Festin des Ombres",      titleEn: "The Shadow Feast",     desc: "Les Ombres peuvent agir deux fois cette nuit. Le Conseil doit redoubler de vigilance.",                             descEn: "The Shadows may act twice this night. The Council must be doubly vigilant.",                             effect: "Les Ombres peuvent soumettre 2 actions cette nuit.",              effectEn: "The Shadows may submit 2 actions this night." },
];

const NIGHT_ORDER = [
  { id: 'sculpteur',    name: 'Sculpteur de Cauchemars', nameEn: 'Nightmare Sculptor',   icon: '😱', prompt: "Choisit un joueur à bloquer cette nuit (perd son pouvoir).",        promptEn: "Choose a player to block tonight (loses their power).",           needsTarget: true },
  { id: 'mainombre',    name: "Main de l'Ombre",         nameEn: "Shadow's Hand",        icon: '🖤', prompt: "Peut corrompre un joueur du Conseil (irréversible).",               promptEn: "Can corrupt a Council member (irreversible).",                     needsTarget: true },
  { id: 'murmure',      name: "Murmure de l'Abysse",     nameEn: "Abyss Whisper",        icon: '🌑', prompt: "Choisit un joueur pour lui envoyer une fausse information demain.", promptEn: "Choose a player to send false information to tomorrow.",           needsTarget: true },
  { id: 'fauxoracle',   name: 'Fausse Oracle',           nameEn: 'False Oracle',         icon: '🔮', prompt: "Envoie une fausse vision à un joueur.",                            promptEn: "Send a false vision to a player.",                                 needsTarget: true },
  { id: 'assassin',     name: 'Assassin Voilé',          nameEn: 'Veiled Assassin',      icon: '🗡️', prompt: "Élimine un joueur dans son quartier.",                             promptEn: "Eliminate a player in your district.",                             needsTarget: true },
  { id: 'chasseur',     name: "Chasseur de l'Ombre",     nameEn: "Shadow Hunter",        icon: '🏹', prompt: "Peut cibler un joueur pour le tuer (risque mortel si innocent).",   promptEn: "Can target a player to kill them (lethal risk if innocent).",      needsTarget: true, optional: true },
  { id: 'gardien',      name: 'Gardien de la Porte',     nameEn: 'Gate Warden',          icon: '🚪', prompt: "Bloque un joueur dans son quartier (ne peut pas se déplacer).",    promptEn: "Block a player in their district (cannot move).",                  needsTarget: true },
  { id: 'pretresse',    name: 'Prêtresse de la Lune',    nameEn: 'Moon Priestess',       icon: '🌙', prompt: "Protège un joueur de la mort cette nuit.",                         promptEn: "Protect a player from death tonight.",                             needsTarget: true },
  { id: 'voyant',       name: 'Voyant Éclipsé',          nameEn: 'Eclipsed Seer',        icon: '👁️', prompt: "Révèle le rôle exact d'un joueur (usage unique).",                 promptEn: "Reveal a player's exact role (one-time use).",                     needsTarget: true, oneTime: true },
  { id: 'herald',       name: "Héraut de l'Aube",        nameEn: "Herald of the Dawn",   icon: '🌅', prompt: "Reçoit : y a-t-il une Ombre dans son quartier ? (oui/non)",        promptEn: "Receives: is there a Shadow in your district? (yes/no)",          needsTarget: false, gmResolved: true },
  { id: 'archives',     name: 'Maître des Archives',     nameEn: 'Master of Archives',   icon: '📜', prompt: "Reçoit un fragment d'alignement sur un joueur aléatoire.",         promptEn: "Receives an alignment fragment about a random player.",            needsTarget: false, gmResolved: true },
  { id: 'messager',     name: 'Messager Céleste',        nameEn: 'Celestial Messenger',  icon: '🕊️', prompt: "Envoie un message secret à un joueur dans un autre quartier.",     promptEn: "Send a secret message to a player in another district.",           needsTarget: true },
  { id: 'collectionneur', name: 'Collectionneur',        nameEn: 'Collector',            icon: '🗃️', prompt: "Écoute une conversation privée entre deux joueurs.",              promptEn: "Listen to a private conversation between two players.",            needsTarget: true },
  { id: 'assassinmuet', name: 'Assassin Muet',           nameEn: 'Silent Assassin',      icon: '🤫', prompt: "Peut utiliser son unique meurtre cette nuit.",                     promptEn: "Can use their single kill tonight.",                               needsTarget: true, optional: true, oneTime: true },
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

let client = null;
let lastSnapshot = null;
function gameError(error) {
  console.error(error);
  let box = document.getElementById('game-error');
  if (!box) {
    box = document.createElement('div');
    box.id = 'game-error'; box.className = 'game-error'; box.setAttribute('role', 'alert');
    document.querySelector('main').prepend(box);
  }
  box.replaceChildren();
  const text = document.createElement('span');
  text.textContent = window.i18n?.getCurrentLang?.() === 'en'
    ? 'Action failed. Check your connection and retry. ' : 'Action impossible. Vérifiez votre connexion puis réessayez. ';
  const retry = document.createElement('button');
  retry.className = 'btn btn-secondary'; retry.textContent = window.i18n?.getCurrentLang?.() === 'en' ? 'Reconnect' : 'Reconnecter';
  retry.onclick = () => window.location.reload();
  box.append(text, retry);
}
async function init() {
  const params = new URLSearchParams(window.location.search);
  STATE.roomCode = params.get('room') || sessionStorage.getItem('erebor_room');
  if (!STATE.roomCode || !/^[A-HJ-NP-Z2-9]{6}$/.test(STATE.roomCode)) { showView('setup'); return; }
  try {
    client = await new RoomClient(params.get('mode') === 'local').init();
    STATE.playerId = client.uid;
    STATE.isLocal = !client.db;
    updateConnectionBar();
    client.subscribe(STATE.roomCode, data => {
      if (!data || !data.players[STATE.playerId]) { showView('setup'); return; }
      document.getElementById('game-error')?.remove();
      applySnapshot(data);
    }, gameError);
  } catch (error) { gameError(error); }
}

function updateConnectionBar() {
  const dot  = document.querySelector('.connection-dot');
  const text = document.querySelector('.connection-text');
  if (!dot || !text) return;

  if (STATE.isLocal) {
    dot.className  = 'connection-dot local';
    text.textContent = `${t('game.connectionLocal')} ${STATE.roomCode || '—'}`;
  } else if (client?.db) {
    dot.className  = 'connection-dot';
    text.textContent = `${t('game.connectionOnline')} ${STATE.roomCode}`;
  } else {
    dot.className  = 'connection-dot offline';
    text.textContent = t('game.connectionOffline');
  }
}

// ---- Vues ----
function showView(name) {
  document.querySelectorAll('.game-view').forEach(v => v.classList.remove('active'));
  const el = document.getElementById(`view-${name}`);
  if (el) el.classList.add('active');
  STATE.currentView = name;
}

function applySnapshot(data) {
  lastSnapshot = data;
  STATE.isGM = data.gmId === STATE.playerId;
  document.querySelector('.grimoire-toggle')?.classList.toggle('visible', STATE.isGM);
  STATE.players    = data.players || {};
  STATE.phase      = data.phase || 'lobby';
  STATE.round      = data.round || 0;
  STATE.nightStep  = data.nightStep || 0;
  STATE.votes      = data.votes || {};
  STATE.voteResolved = !!data.voteResolved;
  STATE.event      = data.event || null;
  STATE.config     = data.config || STATE.config;

  // Mon rôle
  if (STATE.players[STATE.playerId]) {
    STATE.myRole = STATE.players[STATE.playerId].roleId;
  }

  renderPhase();
  renderHostTools();
}

// ---- Rendu de la phase ----
function renderPhase() {
  const labels = window.i18n?.getCurrentLang?.() === 'en'
    ? { lobby: 'Lobby', night: 'Night', day: 'Day', crepuscule: 'Twilight', gameover: 'Game over' }
    : { lobby: 'Salon', night: 'Nuit', day: 'Jour', crepuscule: 'Crépuscule', gameover: 'Fin de partie' };
  const label = document.getElementById('nav-phase-label');
  if (label) label.textContent = labels[STATE.phase] || '';
  for (const id of ['gm-vote-actions', 'gm-crepuscule-actions']) {
    const panel = document.getElementById(id);
    if (panel) panel.style.display = STATE.isGM ? 'block' : 'none';
  }
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
  if (countEl) countEl.textContent = `${count} ${count > 1 ? t('game.playerCountPlural') : t('game.playerCount')}`;
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
      <div class="player-avatar unassigned">${escapeHtml(initial)}</div>
      <span class="player-name">${escapeHtml(p.name)}</span>
      <span class="player-status-tag ${p.isGM ? 'gm' : 'waiting'}">${p.isGM ? '⚔️ MJ' : t('game.waitingStatus')}</span>
    `;
    list.appendChild(row);
  });
}

// ---- Assigner les rôles (MJ) ----
async function assignRoles() {
  if (!STATE.isGM || STATE.phase !== 'lobby') return;
  const playerIds = Object.keys(STATE.players).filter(uid => !STATE.players[uid].isGM);
  const checkedBoxes = document.querySelectorAll('#role-checkboxes-lobby .role-checkbox-item input:checked');
  const selectedRoles = Array.from(checkedBoxes).map(cb => cb.value);

  if (!playerIds.length || selectedRoles.length !== playerIds.length) {
    alert(window.i18n?.getCurrentLang?.() === 'en' ? `Select exactly ${playerIds.length} roles.` : `Sélectionnez exactement ${playerIds.length} rôles.`);
    return;
  }

  const factions = new Set(selectedRoles.map(id => ROLES.find(role => role.id === id)?.faction));
  if (!factions.has('lune') || !factions.has('ombre')) {
    alert(window.i18n?.getCurrentLang?.() === 'en' ? 'Include at least one Moon and one Shadow role.' : 'Ajoutez au moins un rôle de la Lune et un rôle de l’Ombre.');
    return;
  }

  // Mélanger les rôles (Fisher-Yates)
  const shuffled = [...selectedRoles];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const updates = {};
  playerIds.forEach((uid, i) => {
    updates[`players/${uid}/roleId`] = shuffled[i] || null;
    updates[`players/${uid}/powerUsed`] = false;
    updates[`players/${uid}/district`] = i % 3 + 1;
  });
  // MJ sans rôle (arbitre)
  updates[`players/${STATE.playerId}/roleId`] = 'gm';

  await writeRoom(updates);
  addLog(t('game.logRolesAssigned'), 'gm');
}

// ---- Démarrer la nuit (MJ) ----
async function startNight() {
  if (!STATE.isGM || !['lobby', 'day', 'crepuscule'].includes(STATE.phase)) return;
  const players = Object.values(STATE.players).filter(p => !p.isGM);
  if (!players.length || players.some(p => !p.roleId)) {
    alert(window.i18n?.getCurrentLang?.() === 'en' ? 'Assign all roles first.' : 'Distribuez tous les rôles avant de commencer.');
    return;
  }
  if (STATE.phase !== 'lobby') { await checkVictory(); if (STATE.phase === 'gameover') return; }
  const updates = {
    phase: 'night',
    round: STATE.round + 1,
    nightStep: 0,
    votes: null,
    'event': null,
    currentRole: NIGHT_ORDER[0].id,
  };

  // Reset actions nocturnes
  Object.keys(STATE.players).forEach(uid => {
    updates[`players/${uid}/nightActionDone`]   = false;
    updates[`players/${uid}/nightActionTarget`] = null;
    updates[`players/${uid}/message`] = null;
  });

  await writeRoom(updates);
  addLog(t('game.logNightFalls', STATE.round + 1), 'gm');
}

// ---- NIGHT ----
function renderNight() {
  showView('night');
  const turn = `${STATE.round}:${STATE.nightStep}`;
  if (STATE.turn !== turn) { STATE.selectedNightTarget = null; STATE.nightSubmitted = false; STATE.turn = turn; }

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
      <span class="step-name">${rl(step, 'name')}</span>
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
        <h3 style="color:var(--color-synergie-light);margin-bottom:1rem;">${t('game.allNightActionsResolved')}</h3>
        <button class="gm-btn" onclick="startDay()" style="margin:0 auto;max-width:300px;">${t('game.startDayBtn')}</button>
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
        <span class="submission-actor">${escapeHtml(p.name)}</span>
        <span class="submission-arrow">→</span>
        <span class="submission-target">${escapeHtml(target)}</span>
        <span class="submission-status">${t('game.actionSubmitted')}</span>
      </div>`;
    }).join('');

  panel.innerHTML = `
    <div class="current-role-prompt">
      <h4>${step.icon} ${rl(step, 'name')}</h4>
      <p>${rl(step, 'prompt')}</p>
    </div>
    ${submissions ? `<div class="night-action-submissions">${submissions}</div>` : ''}
    <div style="display:flex;gap:1rem;flex-wrap:wrap;">
      <button class="gm-btn" onclick="advanceNightStep()" style="flex:1;">
        ${t('game.actionResolved')}
      </button>
      ${step.gmResolved ? `<button class="gm-btn" onclick="gmResolvePassive('${step.id}')" style="flex:1;">
        ${t('game.sendPassiveInfo')}
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
  const factionLabel = {
    lune:      t('common.factionLune'),
    ombre:     t('common.factionOmbre'),
    solitaire: t('common.factionSolitaire'),
  };

  // Carte de rôle
  let html = `<p class="player-district">${ui('Votre quartier', 'Your district')} : ${me.district || 1}</p>`;
  if (roleData) {
    html += `
      <div class="role-reveal-card ${roleData.faction}">
        <div class="role-reveal-eyebrow">${t('game.yourSecretRole')}</div>
        <span class="role-reveal-icon">${roleData.icon}</span>
        <h2 class="role-reveal-name">${rl(roleData, 'name')}</h2>
        <span class="faction-badge ${roleData.faction}" style="margin:0 auto 1rem;">${factionLabel[roleData.faction]}</span>
        <p class="role-reveal-power">${rl(roleData, 'shortPower')}</p>
        ${roleData.faction === 'solitaire' ? `<div class="role-reveal-objective">🎯 ${roleData.shortPower}</div>` : ''}
      </div>
    `;
  }

  // Formulaire d'action nocturne
  const currentStep = NIGHT_ORDER[STATE.nightStep];
  const isMyTurn = me.isAlive && !me.arrested && currentStep && roleData && currentStep.id === roleData.id && !(currentStep.oneTime && me.powerUsed);
  if (me.powerUsed && currentStep?.oneTime && currentStep.id === me.roleId) html += `<p role="status">${ui('Votre pouvoir unique a déjà été utilisé.', 'Your one-time power has already been used.')}</p>`;
  if (me.message) html += `<p class="private-message" role="status">${escapeHtml(me.message)}</p>`;

  if (STATE.nightSubmitted || (me && me.nightActionDone)) {
    html += `
      <div class="night-waiting">
        <div class="night-waiting-icon">🌙</div>
        <p>${t('game.actionRegistered')}</p>
      </div>
    `;
  } else if (isMyTurn && currentStep.needsTarget) {
    const alivePlayers = Object.entries(STATE.players)
      .filter(([uid, p]) => p.isAlive && (uid !== STATE.playerId || roleData.id === 'pretresse') && !p.isGM && (!['assassin', 'gardien'].includes(roleData.id) || p.district === me.district))
      .map(([uid, p]) => `
        <button class="target-btn" data-uid="${uid}" onclick="selectTarget('${uid}', this)">
          <span class="t-icon">👤</span>
          <span class="t-name">${escapeHtml(p.name)}</span>
        </button>
      `).join('');

    html += `
      <div class="night-action-form">
        <h3>${t('game.yourAction')} ${rl(currentStep, 'name')}</h3>
        <p>${rl(currentStep, 'prompt')}</p>
        <div class="target-grid">${alivePlayers}</div>
        ${currentStep.optional ? `<button class="btn btn-secondary" onclick="skipNightAction()" style="width:100%;margin-bottom:0.5rem;">${t('game.skipAction')}</button>` : ''}
        <button class="btn btn-primary" onclick="submitNightAction()" style="width:100%;" id="submit-night-btn" disabled>
          ${t('game.confirmAction')}
        </button>
      </div>
    `;
  } else {
    html += `
      <div class="night-waiting">
        <div class="night-waiting-icon">🌙</div>
        <p>${isMyTurn ? t('game.yourTurn') : t('game.notYourTurn')}</p>
      </div>
    `;
  }

  panel.innerHTML = html;
  const selected = [...panel.querySelectorAll('.target-btn')].find(button => button.dataset.uid === STATE.selectedNightTarget);
  if (selected) selectTarget(STATE.selectedNightTarget, selected);
}

function selectTarget(uid, btn) {
  STATE.selectedNightTarget = uid;
  document.querySelectorAll('.target-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  document.getElementById('submit-night-btn')?.removeAttribute('disabled');
}

async function submitNightAction() {
  if (!canActAtNight() || !STATE.selectedNightTarget || !STATE.players[STATE.selectedNightTarget]?.isAlive) return;
  const updates = {
    [`players/${STATE.playerId}/nightActionDone`]:   true,
    [`players/${STATE.playerId}/nightActionTarget`]: STATE.selectedNightTarget,
  };
  if (NIGHT_ORDER[STATE.nightStep]?.oneTime) updates[`players/${STATE.playerId}/powerUsed`] = true;
  await writeRoom(updates);
  STATE.nightSubmitted = true;
  renderPlayerNightPanel();
}

async function skipNightAction() {
  if (!canActAtNight() || !NIGHT_ORDER[STATE.nightStep]?.optional) return;
  const updates = {
    [`players/${STATE.playerId}/nightActionDone`]: true,
    [`players/${STATE.playerId}/nightActionTarget`]: null,
  };
  await writeRoom(updates);
  STATE.nightSubmitted = true;
  renderPlayerNightPanel();
}

async function advanceNightStep() {
  if (!STATE.isGM || STATE.phase !== 'night') return;
  const nextStep = STATE.nightStep + 1;
  if (nextStep >= NIGHT_ORDER.length) {
    await writeRoom({ nightStep: NIGHT_ORDER.length, currentRole: null });
  } else {
    await writeRoom({ nightStep: nextStep, currentRole: NIGHT_ORDER[nextStep].id });
  }
}

// ---- Démarrer le jour (MJ) ----
async function startDay() {
  if (!STATE.isGM || STATE.phase !== 'night' || STATE.nightStep < NIGHT_ORDER.length) return;
  const updates = { phase: 'day', votes: null, voteResolved: false };
  await writeRoom(updates);
  addLog(t('game.logDayRises'), 'gm');
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

function appendLog(body, log) {
  const entry = document.createElement('div'); entry.className = 'feed-entry';
  const icon = document.createElement('span'); icon.className = 'feed-icon';
  icon.textContent = log.type === 'death' ? '💀' : log.type === 'gm' ? '⚔️' : '📣';
  const text = document.createElement('span'); text.className = 'feed-text'; text.textContent = log.text;
  const time = document.createElement('span'); time.className = 'feed-ts';
  time.textContent = new Date(log.ts).toLocaleTimeString(window.i18n?.getCurrentLang?.() === 'en' ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit' });
  entry.append(icon, text, time); body.append(entry);
}
function renderEventFeed() {
  const body = document.getElementById('event-feed-body');
  if (!body) return;
  body.replaceChildren();
  Object.values(lastSnapshot?.logs || {}).sort((a, b) => a.ts - b.ts).slice(-100).forEach(log => appendLog(body, log));
  body.scrollTop = body.scrollHeight;
}
function addLog(text, type = 'normal') {
  if (!STATE.isGM || !client) return;
  client.write({ [`logs/${crypto.randomUUID()}`]: { text, type, ts: Date.now() } }).catch(gameError);
}

function renderVotePanel() {
  const panel = document.getElementById('vote-candidates');
  if (!panel) return;

  const me = STATE.players[STATE.playerId];
  const arrested = !me?.isAlive || me.arrested;
  const myVote   = STATE.votes[STATE.playerId];

  panel.innerHTML = '';
  Object.entries(STATE.players)
    .filter(([, p]) => p.isAlive && !p.isGM)
    .forEach(([uid, p]) => {
      const voteCount = Object.values(STATE.votes || {}).filter(v => v === uid).length;
      const total     = Object.keys(STATE.players).filter(id => STATE.players[id].isAlive && !STATE.players[id].isGM).length;
      const pct       = total > 0 ? Math.round((voteCount / total) * 100) : 0;

      const item = document.createElement('div');
      item.className = `vote-candidate${myVote === uid ? ' voted' : ''}${arrested ? ' arrested' : ''}`;
      item.innerHTML = `
        <span class="vote-candidate-name">👤 ${escapeHtml(p.name)}</span>
        ${STATE.isGM ? `<div class="vote-bar-wrapper"><div class="vote-bar" style="width:${pct}%"></div></div><span class="vote-count-text">${voteCount}</span>` : ''}
        ${!STATE.isGM && !arrested && !STATE.voteResolved ? `<button class="btn btn-secondary" onclick="submitVote('${uid}')" style="padding:0.25rem 0.75rem;font-size:0.75rem;">${t('game.accuseBtn')}</button>` : ''}
      `;
      panel.appendChild(item);
    });
}

async function submitVote(targetId) {
  const me = STATE.players[STATE.playerId], target = STATE.players[targetId];
  if (STATE.isGM || STATE.voteResolved || STATE.phase !== 'day' || !me?.isAlive || me.arrested || !target?.isAlive || target.isGM) return;
  await writeRoom({ [`votes/${STATE.playerId}`]: targetId });
  renderVotePanel();
}

async function resolveVote() {
  if (!STATE.isGM || STATE.phase !== 'day' || STATE.voteResolved) return;
  await writeRoom({ voteResolved: true });
  if (client) {
    const latest = await client.readPublic(STATE.roomCode);
    if (latest) STATE.votes = EreborRoom.normalize(latest).votes;
  }
  const tallies = {};
  Object.entries(STATE.votes || {}).forEach(([voter, target]) => {
    const p = STATE.players[voter], candidate = STATE.players[target];
    if (p?.isAlive && !p.isGM && !p.arrested && candidate?.isAlive && !candidate.isGM) tallies[target] = (tallies[target] || 0) + 1;
  });
  const sorted = Object.entries(tallies).sort((a, b) => b[1] - a[1]);
  const topId = sorted.length && (!sorted[1] || sorted[0][1] > sorted[1][1]) ? sorted[0][0] : null;

  if (topId && STATE.players[topId]) {
    const name = STATE.players[topId].name;
    await writeRoom({ [`players/${topId}/isAlive`]: false });
    addLog(`💀 ${name} ${t('game.logPlayerExecuted')}`, 'death');
    await checkVictory();
  } else {
    addLog(t('game.logTie'), 'normal');
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
      <span class="alive-player-name">${escapeHtml(p.name)} · ${ui('Quartier', 'District')} ${p.district || 1}</span>
      <span class="alive-player-status">${p.isAlive ? t('game.alive') : t('game.dead')}</span>
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
  if (!STATE.isGM || STATE.phase !== 'day') return;
  await checkVictory();
  if (STATE.phase === 'gameover') return;
  const event = CREPUSCULE_EVENTS[Math.floor(Math.random() * CREPUSCULE_EVENTS.length)];
  await writeRoom({ phase: 'crepuscule', event });
  const lang = window.i18n?.getCurrentLang?.() || 'fr';
  const evTitle = (lang === 'en' && event.titleEn) ? event.titleEn : event.title;
  addLog(`${t('game.logCrepuscule')} ${evTitle}`, 'event');
}

function renderCrepuscule() {
  showView('crepuscule');
  document.querySelectorAll('#view-crepuscule button').forEach(button => { button.hidden = !STATE.isGM; });
  const ev = STATE.event;
  if (!ev) return;

  const iconEl  = document.getElementById('event-icon');
  const titleEl = document.getElementById('event-title');
  const descEl  = document.getElementById('event-desc');
  const effectEl = document.getElementById('event-effect');

  const lang = window.i18n?.getCurrentLang?.() || 'fr';
  if (iconEl)   iconEl.textContent  = ev.icon;
  if (titleEl)  titleEl.textContent = (lang === 'en' && ev.titleEn) ? ev.titleEn : ev.title;
  if (descEl)   descEl.textContent  = (lang === 'en' && ev.descEn) ? ev.descEn : ev.desc;
  if (effectEl) effectEl.textContent = `${t('game.eventEffect')} ${(lang === 'en' && ev.effectEn) ? ev.effectEn : ev.effect}`;
}

async function continueToCrepuscule() {
  await startCrepuscule();
}

async function continueToNextNight() {
  await startNight();
}

// ---- Vérifier victoire ----
async function checkVictory() {
  if (!STATE.isGM || STATE.phase === 'lobby' || STATE.phase === 'gameover') return;
  const alive = Object.entries(STATE.players).filter(([, p]) => p.isAlive && !p.isGM);
  const lune   = alive.filter(([, p]) => {
    const r = ROLES.find(r => r.id === p.roleId);
    return r && r.faction === 'lune';
  });
  const ombre  = alive.filter(([, p]) => {
    const r = ROLES.find(r => r.id === p.roleId);
    return r && r.faction === 'ombre';
  });
  const solitaire = alive.filter(([, p]) => {
    const r = ROLES.find(r => r.id === p.roleId);
    return r && r.faction === 'solitaire';
  });

  if (lune.length === 0 && ombre.length === 0 && solitaire.length > 0) {
    await writeRoom({ phase: 'gameover', winner: { faction: 'solitaire' } });
  } else if (ombre.length === 0 && lune.length > 0) {
    await writeRoom({ phase: 'gameover', winner: { faction: 'lune' } });
  } else if (ombre.length >= lune.length) {
    await writeRoom({ phase: 'gameover', winner: { faction: 'ombre' } });
  } else if (STATE.round >= STATE.config.roundCount) {
    await writeRoom({ phase: 'gameover', winner: { faction: 'ombre', timeout: true } });
  }
}

async function declareSolitaireVictory() {
  if (!STATE.isGM || STATE.phase === 'gameover') return;
  await writeRoom({ phase: 'gameover', winner: { faction: 'solitaire' } });
  addLog(t('game.logSolitaireWin') || 'Un Solitaire a rempli sa condition de victoire.', 'event');
}

// ---- GAME OVER ----
function renderGameover() {
  showView('gameover');

  if (lastSnapshot?.winner) applyGameover(lastSnapshot.winner);
}

function applyGameover(winner) {
  const banner   = document.getElementById('gameover-banner');
  const nameEl   = document.getElementById('gameover-winner-name');
  const subtitleEl = document.getElementById('gameover-subtitle');

  if (banner) banner.className = `gameover-winner-banner ${winner.faction}`;

  const factionNames = {
    lune:      t('common.factionLune'),
    ombre:     t('common.factionOmbre'),
    solitaire: t('common.factionSolitaire'),
  };
  const winnerName = factionNames[winner.faction] || winner.faction;
  if (nameEl) nameEl.textContent = winner.timeout
    ? `${winnerName} (${window.i18n?.getCurrentLang?.() === 'en' ? 'time out' : 'temps écoulé'})`
    : winnerName;

  const icons = { lune: '🌙', ombre: '🌑', solitaire: '🌀' };
  const iconEl = document.getElementById('gameover-icon');
  if (iconEl) iconEl.textContent = icons[winner.faction] || '🏆';

  const subtitles = {
    lune:      t('game.victoryLune'),
    ombre:     t('game.victoryOmbre'),
    solitaire: t('game.victorySolitaire'),
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
        <div class="rri-player">${escapeHtml(p.name)}</div>
        <div class="rri-role">${escapeHtml(rl(roleData, 'name'))}</div>
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
      <span class="g-player">${escapeHtml(p.name)}</span>
      <span class="g-role">${roleData ? rl(roleData, 'name') : t('game.notAssigned')}</span>
      <div class="g-status ${statusClass}"></div>
    `;
    body.appendChild(row);
  });
}

function toggleGrimoire() {
  if (!STATE.isGM) return;
  const panel = document.getElementById('grimoire-panel');
  if (panel) panel.classList.toggle('open');
}

function canActAtNight() {
  const me = STATE.players[STATE.playerId];
  return STATE.phase === 'night' && me?.isAlive && !me.arrested && !me.isGM && !me.nightActionDone && !(NIGHT_ORDER[STATE.nightStep]?.oneTime && me.powerUsed) && me.roleId === NIGHT_ORDER[STATE.nightStep]?.id;
}
async function writeRoom(updates) {
  if (!client) throw new Error('Room not connected');
  if (!STATE.isGM) {
    const own = `players/${STATE.playerId}/`;
    if (!Object.keys(updates).every(path => path === `votes/${STATE.playerId}` || path === own + 'nightActionDone' || path === own + 'nightActionTarget' || path === own + 'powerUsed')) throw new Error('Forbidden action');
  }
  await client.write(updates);
}

// ---- Rôles (sélection GM) ----
function buildRoleCheckboxes() {
  const container = document.getElementById('role-checkboxes-lobby');
  if (!container || typeof ROLES === 'undefined') return;
  container.innerHTML = '';

  ROLES.forEach(role => {
    const label = document.createElement('label');
    label.className = 'role-checkbox-item';
    label.innerHTML = `
      <input type="checkbox" value="${role.id}" ${['herald','assassin','pretresse','gardien','murmure','archives'].includes(role.id) ? 'checked' : ''}>
      <span class="rci-icon">${role.icon}</span>
      <span class="rci-name">${rl(role, 'name')}</span>
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
      if (btn) { btn.textContent = t('game.copied'); setTimeout(() => btn.textContent = t('game.copyCode'), 2000); }
    }).catch(gameError);
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
window.continueToCrepuscule    = continueToCrepuscule;
window.continueToNextNight     = continueToNextNight;
window.declareSolitaireVictory = declareSolitaireVictory;
window.checkVictory = checkVictory;
window.hostUpdatePlayer = hostUpdatePlayer;
window.toggleGrimoire    = toggleGrimoire;
window.gmResolvePassive  = async function(roleId) {
  if (!STATE.isGM) return;
  const msg = prompt(t('game.passiveInfoPrompt', roleId));
  if (msg) {
    const updates = {};
    Object.entries(STATE.players).filter(([, p]) => p.roleId === roleId && p.isAlive).forEach(([uid]) => { updates[`players/${uid}/message`] = msg.slice(0, 2000); });
    await writeRoom(updates);
  }
};

['assignRoles', 'startNight', 'startDay', 'advanceNightStep', 'submitNightAction', 'skipNightAction', 'submitVote', 'resolveVote', 'continueToCrepuscule', 'continueToNextNight', 'declareSolitaireVictory', 'gmResolvePassive', 'checkVictory', 'hostUpdatePlayer'].forEach(name => {
  const action = window[name];
  let busy = false;
  window[name] = async (...args) => {
    if (busy) return;
    busy = true;
    try { return await action(...args); } catch (error) { gameError(error); } finally { busy = false; }
  };
});
window.addEventListener('pagehide', () => client?.unsubscribe());
document.addEventListener('langchange', () => {
  const selected = [...document.querySelectorAll('.role-checkbox-item input:checked')].map(input => input.value);
  buildRoleCheckboxes();
  document.querySelectorAll('.role-checkbox-item input').forEach(input => { input.checked = selected.includes(input.value); });
  if (lastSnapshot) { renderPhase(); renderHostTools(); updateConnectionBar(); }
});

function ui(fr, en) { return window.i18n?.getCurrentLang?.() === 'en' ? en : fr; }
function renderHostTools() {
  let panel = document.getElementById('host-tools');
  if (!panel) {
    panel = document.createElement('section'); panel.id = 'host-tools'; panel.className = 'host-tools';
    document.getElementById('game-main').append(panel);
  }
  panel.hidden = !STATE.isGM || STATE.phase === 'gameover';
  if (panel.hidden) return;
  const heading = document.createElement('h2'); heading.textContent = ui('Arbitrage du MJ', 'GM adjudication');
  const note = document.createElement('p');
  note.textContent = ui('Gérez les vies, les quartiers et les blocages. Les pouvoirs uniques sont consommés à la soumission ; vous pouvez les rétablir en cas d’erreur. Vérifiez la victoire après vos arbitrages.', 'Manage lives, districts and restrictions. One-time powers are consumed on submission; you can restore them after a mistake. Check victory after adjudicating.');
  panel.replaceChildren(heading, note);
  Object.entries(STATE.players).filter(([, p]) => !p.isGM).forEach(([uid, player]) => {
    const row = document.createElement('div'); row.className = 'host-player'; row.dataset.uid = uid;
    const name = document.createElement('strong'); name.textContent = player.name;
    const life = document.createElement('button'); life.className = 'btn btn-secondary'; life.dataset.action = 'life';
    life.textContent = player.isAlive ? ui('Éliminer', 'Eliminate') : ui('Ressusciter', 'Revive');
    life.setAttribute('aria-label', `${life.textContent} ${player.name}`);
    life.onclick = () => window.hostUpdatePlayer(uid, 'isAlive', !player.isAlive);
    const districtLabel = document.createElement('label'); districtLabel.textContent = ui('Quartier ', 'District ');
    const district = document.createElement('select'); district.className = 'form-select'; district.dataset.action = 'district';
    district.setAttribute('aria-label', `${ui('Quartier de', 'District for')} ${player.name}`);
    for (let i = 1; i <= 3; i++) { const option = document.createElement('option'); option.value = i; option.textContent = `${ui('Quartier', 'District')} ${i}`; district.append(option); }
    district.value = player.district || 1; district.onchange = () => window.hostUpdatePlayer(uid, 'district', Number(district.value));
    districtLabel.append(district);
    const blocked = document.createElement('button'); blocked.className = 'btn btn-secondary'; blocked.dataset.action = 'arrested';
    blocked.textContent = player.arrested ? ui('Lever le blocage', 'Lift restriction') : ui('Bloquer les actions et le vote', 'Restrict actions and voting');
    blocked.setAttribute('aria-pressed', String(!!player.arrested)); blocked.onclick = () => window.hostUpdatePlayer(uid, 'arrested', !player.arrested);
    row.append(name, life, districtLabel, blocked);
    if (NIGHT_ORDER.find(step => step.id === player.roleId)?.oneTime) {
      const power = document.createElement('button'); power.className = 'btn btn-secondary'; power.dataset.action = 'power';
      power.textContent = player.powerUsed ? ui('Rétablir le pouvoir unique', 'Restore one-time power') : ui('Marquer le pouvoir utilisé', 'Mark power used');
      power.onclick = () => window.hostUpdatePlayer(uid, 'powerUsed', !player.powerUsed); row.append(power);
    }
    panel.append(row);
  });
  const victory = document.createElement('button'); victory.className = 'btn btn-primary'; victory.textContent = ui('Vérifier la victoire', 'Check victory');
  victory.onclick = () => window.checkVictory(); panel.append(victory);
}
async function hostUpdatePlayer(uid, field, value) {
  if (!STATE.isGM || !STATE.players[uid] || STATE.players[uid].isGM || STATE.phase === 'gameover') return;
  if (!['isAlive', 'district', 'arrested', 'powerUsed'].includes(field)) return;
  if (field === 'district' ? ![1, 2, 3].includes(value) : typeof value !== 'boolean') return;
  await writeRoom({ [`players/${uid}/${field}`]: value });
  if (field === 'isAlive') addLog(`${STATE.players[uid].name} — ${value ? ui('ressuscité', 'revived') : ui('éliminé', 'eliminated')}`, value ? 'revive' : 'death');
}
