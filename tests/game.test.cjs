const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
function engine() {
  const updates = [], alerts = [];
  const context = { console, crypto: webcrypto, URLSearchParams,
    document: { addEventListener() {}, querySelectorAll() { return []; }, getElementById() { return null; } },
    addEventListener() {}, alert: message => alerts.push(message), prompt: () => null,
    sessionStorage: { getItem() { return null; } },
  };
  context.window = context; vm.createContext(context);
  vm.runInContext(fs.readFileSync('assets/js/data/roles.js', 'utf8'), context);
  vm.runInContext(fs.readFileSync('assets/js/pages/game.js', 'utf8'), context);
  context.save = async changes => { updates.push(changes); vm.runInContext('Object.assign(STATE, __updates)', Object.assign(context, { __updates: changes })); };
  vm.runInContext("writeRoom = save; addLog = () => {}; renderVotePanel = () => {}; STATE.isGM = true; STATE.playerId = 'gm'; STATE.phase = 'day'; STATE.players = { gm: { isGM: true, isAlive: true }, a: { name:'A', isAlive:true, roleId:'herald' }, b: { name:'B', isAlive:true, roleId:'assassin' }, c: { name:'C', isAlive:true, roleId:'pretresse' } };", context);
  return { context, updates, alerts, run: code => vm.runInContext(code, context) };
}
test('tied vote eliminates nobody and cannot be resolved twice', async () => {
  const e = engine(); e.run("STATE.votes = {a:'b', b:'a'}"); await e.run('resolveVote()');
  assert.equal(e.updates.some(u => Object.keys(u).some(k => k.endsWith('/isAlive'))), false);
  assert.equal(e.updates.length, 1); await e.run('resolveVote()'); assert.equal(e.updates.length, 1);
});
test('dead and arrested voters do not affect execution', async () => {
  const e = engine(); e.run("STATE.players.c.isAlive = false; STATE.votes = {a:'b',b:'b',c:'a'}"); await e.run('resolveVote()');
  assert.equal(e.updates.some(u => u['players/b/isAlive'] === false), true);
});
test('living membership and phase are required to vote or act', async () => {
  const e = engine(); e.run("STATE.isGM = false; STATE.playerId='a'; STATE.players.a.isAlive=false");
  await e.run("submitVote('b')"); assert.equal(e.updates.length, 0);
  e.run("STATE.players.a.isAlive=true; STATE.phase='night'; STATE.nightStep=9");
  assert.equal(e.run('canActAtNight()'), true);
  e.run('STATE.players.a.nightActionDone=true'); assert.equal(e.run('canActAtNight()'), false);
});
test('victory conditions and round limit', async () => {
  for (const [setup, expected] of [["STATE.players.b.isAlive=false", 'lune'], ["STATE.players.c.isAlive=false", 'ombre'], ["STATE.round=6", 'ombre']]) {
    const e=engine(); e.run(setup); await e.run('checkVictory()'); assert.equal(e.updates.at(-1).winner.faction, expected);
  }
});
test('distribution requires an exact number of roles and host authority', async () => {
  const e=engine(); e.run("STATE.phase='lobby'"); await e.run('assignRoles()');
  assert.equal(e.alerts.length,1); assert.equal(e.updates.length,0);
  e.run("document.querySelectorAll = () => [{value:'herald'}, {value:'assassin'}, {value:'pretresse'}]"); await e.run('assignRoles()');
  const assigned = Object.entries(e.updates[0]).filter(([k]) => k.endsWith('/roleId') && k !== 'players/gm/roleId').map(([,v])=>v);
  assert.deepEqual(assigned.sort(), ['assassin','herald','pretresse']);
  e.run('STATE.isGM=false'); await e.run('assignRoles()'); assert.equal(e.updates.length,1);
});
