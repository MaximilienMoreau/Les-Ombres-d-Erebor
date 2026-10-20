const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const { webcrypto } = require('node:crypto');
function environment(storage = new Map()) {
  const context = { console, crypto: webcrypto, FIREBASE_CONFIG: { configured: false }, navigator: {},
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
    addEventListener() {}, removeEventListener() {} };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(fs.readFileSync('assets/js/components/room-client.js', 'utf8'), context);
  return context;
}
test('local room survives navigation, shares tabs and enforces capacity', async () => {
  const storage = new Map();
  const gmEnv = environment(storage), gm = await new gmEnv.RoomClient().init();
  const code = await gm.create('Conteur', { playerCount: 2, roundCount: 5 });
  const aEnv = environment(storage), a = await new aEnv.RoomClient().init();
  const bEnv = environment(storage), b = await new bEnv.RoomClient().init();
  assert.notEqual(a.uid, gm.uid);
  await a.join(code, 'Alice'); await b.join(code, 'Bob');
  const third = await new (environment(storage)).RoomClient().init();
  await assert.rejects(third.join(code, 'Charlie'), /complète/);
  let snapshot;
  gm.subscribe(code, data => { snapshot = data; }, error => { throw error; });
  assert.equal(Object.keys(snapshot.players).length, 3);
  await gm.write({ [`players/${a.uid}/roleId`]: 'herald', [`players/${b.uid}/roleId`]: 'assassin', phase: 'night' });
  assert.equal(snapshot.players[a.uid].roleId, 'herald');
  await a.join(code, 'Reconnexion');
  assert.equal((await a.readPublic(code)).seats[0].name, 'Alice');
  const restored = await new gmEnv.RoomClient().init();
  assert.equal(restored.uid, gm.uid);
  const another = await new (environment(storage)).RoomClient().init();
  await assert.rejects(another.join(code, 'Charlie'), /déjà commencé/);
});
test('private fields never enter public state and targets round trip through seat indices', async () => {
  const storage = new Map(), env = environment(storage), gm = await new env.RoomClient().init();
  const code = await gm.create('MJ', { playerCount: 2, roundCount: 5 });
  const a = await new (environment(storage)).RoomClient().init();
  const b = await new (environment(storage)).RoomClient().init();
  await a.join(code, 'A'); await b.join(code, 'B');
  let snapshot;
  gm.subscribe(code, data => { snapshot = data; }, error => { throw error; });
  await gm.write({ [`players/${a.uid}/roleId`]: 'herald', [`players/${a.uid}/nightActionTarget`]: b.uid, [`votes/${a.uid}`]: b.uid, [`players/${a.uid}/message`]: 'secret' });
  const stored = JSON.parse(storage.get('erebor_room_v2_' + code));
  assert.equal(JSON.stringify(stored.public).includes('herald'), false);
  assert.equal(JSON.stringify(stored.public).includes('secret'), false);
  assert.equal(stored.secrets[a.uid].seat, '0');
  assert.equal(stored.secrets[a.uid].nightActionTarget, '1');
  assert.equal(snapshot.players[a.uid].nightActionTarget, b.uid);
  assert.equal(snapshot.votes[a.uid], b.uid);
  await gm.write({ votes: null });
  assert.deepEqual(Object.keys(snapshot.votes), []);
});
test('room codes are valid and malformed input cannot join', async () => {
  const env = environment(), client = await new env.RoomClient().init();
  for (let i = 0; i < 100; i++) assert.match(client.codeValue(), /^[A-HJ-NP-Z2-9]{6}$/);
  await assert.rejects(client.join('../bad', 'A'), /invalide/);
  await assert.rejects(client.create('A', { playerCount: 100, roundCount: 5 }), /invalide/);
  assert.throws(() => env.EreborRoom.setPath({}, '__proto__/injected', true), /Invalid/);
});
