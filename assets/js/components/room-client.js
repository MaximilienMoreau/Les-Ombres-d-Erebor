/* Public room state and private player data use separate database branches.
   Local rooms are shared by tabs on this device; they are not confidential. */
(function (root) {
  'use strict';
  const PREFIX = 'erebor_room_v2_';
  const secretFields = new Set(['roleId', 'nightActionDone', 'nightActionTarget', 'message']);
  const copy = value => JSON.parse(JSON.stringify(value));
  function setPath(object, path, value) {
    const parts = path.split('/');
    if (parts.some(p => ['__proto__', 'constructor', 'prototype'].includes(p))) throw new Error('Invalid path');
    let cursor = object;
    for (const key of parts.slice(0, -1)) cursor = cursor[key] ||= {};
    if (value === null) delete cursor[parts.at(-1)];
    else cursor[parts.at(-1)] = value;
  }
  function player(uid, name, isGM = false) { return { uid, name, isGM, isAlive: true }; }
  function normalize(data, secrets = {}) {
    const result = { ...data, players: {} };
    Object.values(data.seats || {}).forEach(p => {
      const privateData = secrets[p.uid] || {};
      result.players[p.uid] = { ...p, ...privateData, nightActionTarget: data.seats?.[privateData.nightActionTarget]?.uid || null };
    });
    result.votes = Object.fromEntries(Object.entries(data.votes || {}).map(([uid, slot]) => [uid, data.seats?.[slot]?.uid]));
    return result;
  }
  function localUID() {
    // window.name survives navigation, but a new tab gets its own identity.
    if (!/^erebor:u[\w-]+$/.test(root.name || '')) root.name = 'erebor:u' + crypto.randomUUID();
    return root.name.slice(7);
  }
  function message(fr, en) { return root.i18n?.getCurrentLang?.() === 'en' ? en : fr; }
  class RoomClient {
    constructor(forceLocal = false) { this.forceLocal = forceLocal; this.uid = null; this.db = null; this.data = null; this.code = null; this.unsubscribe = () => {}; }
    async init() {
      if (this.forceLocal || !FIREBASE_CONFIG.configured) { this.uid = localUID(); return this; }
      if (!root.firebase?.auth) throw new Error(message('Connexion indisponible. Réessayez.', 'Connection unavailable. Please retry.'));
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      const auth = firebase.auth();
      await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
      const user = auth.currentUser || (await auth.signInAnonymously()).user;
      this.uid = user.uid;
      this.db = firebase.database();
      return this;
    }
    codeValue() {
      const bytes = crypto.getRandomValues(new Uint8Array(6));
      return Array.from(bytes, x => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[x % 32]).join('');
    }
    async create(name, config) {
      if (!name || name.length > 20 || !Number.isInteger(config.playerCount) || config.playerCount < 2 || config.playerCount > 20 || !Number.isInteger(config.roundCount) || config.roundCount < 1 || config.roundCount > 12) throw new Error(message('Configuration invalide.', 'Invalid configuration.'));
      const data = { gmId: this.uid, phase: 'lobby', round: 0, nightStep: 0, config, createdAt: Date.now(), seats: { gm: player(this.uid, name, true) } };
      for (let attempt = 0; attempt < 8; attempt++) {
        const code = this.codeValue();
        if (this.db) {
          // Rules allow creation only at an unused code, preventing overwrites.
          const exists = await this.db.ref(`rooms/${code}/public`).get();
          if (exists.exists()) continue;
          await this.db.ref(`rooms/${code}/public`).set(data);
        } else {
          if (localStorage.getItem(PREFIX + code)) continue;
          localStorage.setItem(PREFIX + code, JSON.stringify({ public: data, secrets: {} }));
        }
        return code;
      }
      throw new Error(message('Création impossible. Réessayez.', 'Could not create room. Please retry.'));
    }
    async readPublic(code) {
      if (this.db) return (await this.db.ref(`rooms/${code}/public`).get()).val();
      return JSON.parse(localStorage.getItem(PREFIX + code) || 'null')?.public;
    }
    async join(code, name) {
      if (!/^[A-HJ-NP-Z2-9]{6}$/.test(code) || !name || name.length > 20) throw new Error(message('Nom ou code invalide.', 'Invalid name or room code.'));
      const join = async () => {
        const data = await this.readPublic(code);
        if (!data) throw new Error(message('Salle introuvable.', 'Room not found.'));
        if (Object.values(data.seats || {}).some(p => p.uid === this.uid)) return; // Reconnect without resetting role.
        if (data.phase !== 'lobby') throw new Error(message('Cette partie a déjà commencé.', 'This game has already started.'));
        for (let slot = 0; slot < data.config.playerCount; slot++) {
          if (data.seats?.[slot]) continue;
          if (this.db) {
            const result = await this.db.ref(`rooms/${code}/public/seats/${slot}`).transaction(current => current === null ? player(this.uid, name) : undefined);
            if (!result.committed) continue;
          } else {
            const room = JSON.parse(localStorage.getItem(PREFIX + code));
            room.public.seats[slot] = player(this.uid, name);
            localStorage.setItem(PREFIX + code, JSON.stringify(room));
          }
          return;
        }
        throw new Error(message('Cette salle est complète.', 'This room is full.'));
      };
      return !this.db && navigator.locks ? navigator.locks.request(PREFIX + code, join) : join();
    }
    subscribe(code, callback, onError) {
      this.unsubscribe(); this.code = code;
      if (!this.db) {
        const update = () => {
          try {
            const room = JSON.parse(localStorage.getItem(PREFIX + code) || 'null');
            this.data = room?.public || null;
            callback(room ? normalize(room.public, room.secrets) : null);
          } catch (error) { onError(error); }
        };
        const handler = event => { if (event.key === PREFIX + code || event.key === null) update(); };
        root.addEventListener('storage', handler);
        this.refresh = update;
        this.unsubscribe = () => root.removeEventListener('storage', handler);
        update(); return;
      }
      let secrets = {}, privateRef = null, publicData = null, secretPath = null;
      const emit = () => { if (publicData) callback(normalize(publicData, secrets)); };
      const privateHandler = snap => { secrets = secretPath.endsWith('/' + this.uid) ? { [this.uid]: snap.val() || {} } : (snap.val() || {}); emit(); };
      const publicRef = this.db.ref(`rooms/${code}/public`);
      const publicHandler = snap => {
        publicData = snap.val(); this.data = publicData;
        if (!publicData) { callback(null); return; }
        const isMember = Object.values(publicData.seats || {}).some(p => p.uid === this.uid);
        if (!isMember) { callback(null); return; }
        const path = `rooms/${code}/secrets` + (publicData.gmId === this.uid || publicData.phase === 'gameover' ? '' : '/' + this.uid);
        if (path !== secretPath) {
          if (privateRef) privateRef.off('value', privateHandler);
          secretPath = path; secrets = {};
          privateRef = this.db.ref(path); privateRef.on('value', privateHandler, onError);
        }
        emit();
      };
      publicRef.on('value', publicHandler, onError);
      this.unsubscribe = () => { publicRef.off('value', publicHandler); if (privateRef) privateRef.off('value', privateHandler); };
    }
    async write(updates) {
      if (!this.data) throw new Error('Room not loaded');
      const translated = {};
      for (const [path, originalValue] of Object.entries(updates)) {
        let value = originalValue;
        const parts = path.split('/');
        if (parts[0] === 'players') {
          const [, uid, field] = parts;
          if (secretFields.has(field)) {
            const slot = Object.keys(this.data.seats || {}).find(k => this.data.seats[k].uid === uid);
            if (field === 'nightActionTarget' && value !== null) value = Object.keys(this.data.seats).find(k => this.data.seats[k].uid === value);
            if (field === 'roleId') translated[`secrets/${uid}/seat`] = slot;
            translated[`secrets/${uid}/${field}`] = value;
          }
          else {
            const slot = Object.keys(this.data.seats || {}).find(k => this.data.seats[k].uid === uid);
            if (slot === undefined) throw new Error('Unknown player');
            translated[`public/seats/${slot}/${field}`] = value;
          }
        } else {
          if (parts[0] === 'votes' && value !== null) value = Object.keys(this.data.seats).find(k => this.data.seats[k].uid === value);
          if (value === undefined) throw new Error('Unknown target');
          translated['public/' + path] = value;
        }
      }
      if (this.db) return this.db.ref(`rooms/${this.code}`).update(translated);
      const write = () => {
        const room = JSON.parse(localStorage.getItem(PREFIX + this.code));
        if (!room) throw new Error('Room not found');
        Object.entries(translated).forEach(([path, value]) => setPath(room, path, value));
        localStorage.setItem(PREFIX + this.code, JSON.stringify(room));
        this.refresh();
      };
      return navigator.locks ? navigator.locks.request(PREFIX + this.code, write) : write();
    }
  }
  root.RoomClient = RoomClient;
  root.EreborRoom = { normalize, setPath, copy };
})(window);
