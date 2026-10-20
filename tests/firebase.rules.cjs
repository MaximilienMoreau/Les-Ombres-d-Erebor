const { test, before, after, beforeEach } = require('node:test');
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { ref, set, get, update, runTransaction } = require('firebase/database');
const fs = require('node:fs');
const assert = require('node:assert/strict');
let env;
const db = uid => uid ? env.authenticatedContext(uid).database() : env.unauthenticatedContext().database();
const publicRoom = { gmId:'gm', phase:'lobby', round:0, nightStep:0, createdAt:1, config:{playerCount:2,roundCount:5}, seats:{gm:{uid:'gm',name:'MJ',isGM:true,isAlive:true}} };
before(async () => { env=await initializeTestEnvironment({projectId:'demo-erebor',database:{rules:fs.readFileSync('database.rules.json','utf8'),host:'127.0.0.1',port:9000}}); });
after(async () => { await env?.cleanup(); });
beforeEach(async () => {
  await env.clearDatabase();
  await set(ref(db('gm'),'rooms/ABC234/public'),publicRoom);
});
async function join(uid, slot) { return set(ref(db(uid),`rooms/ABC234/public/seats/${slot}`),{uid,name:uid,isGM:false,isAlive:true}); }
async function start() {
  await join('a',0); await join('b',1);
  await update(ref(db('gm'),'rooms/ABC234'),{
    'secrets/a/roleId':'assassin','secrets/a/seat':'0','secrets/b/roleId':'herald','secrets/b/seat':'1',
    'public/phase':'night','public/currentRole':'assassin'
  });
}
test('unauthenticated access, listing rooms and claiming the host are rejected', async () => {
  await assertFails(get(ref(db(),'rooms/ABC234/public')));
  await assertFails(get(ref(db('a'),'rooms')));
  await assertFails(set(ref(db('a'),'rooms/ABC234/public/gmId'),'a'));
  await assertFails(set(ref(db('a'),'rooms/ABC234/public'),{...publicRoom,gmId:'a'}));
});
test('joining validates capacity, identity, phase and public schema', async () => {
  await assertSucceeds(join('a',0));
  await assertSucceeds(join('b',1));
  await assertFails(join('c',2));
  await assertFails(set(ref(db('c'),'rooms/ABC234/public/seats/0'),{uid:'a',name:'Fake',isGM:false,isAlive:true}));
  await assertFails(set(ref(db('c'),'rooms/ABC234/public/seats/-1'),{uid:'c',name:'Fake',isGM:false,isAlive:true}));
  await assertFails(set(ref(db('c'),'rooms/ABC234/public/seats/01'),{uid:'c',name:'Fake',isGM:false,isAlive:true}));
  await assertFails(set(ref(db('a'),'rooms/ABC234/public/seats/0/roleId'),'assassin'));
  await assertFails(set(ref(db('a'),'rooms/ABC234/public/phase'),'day'));
});
test('join transactions work and a full slot cannot be overwritten', async () => {
  const result=await assertSucceeds(runTransaction(ref(db('a'),'rooms/ABC234/public/seats/0'), value => value === null ? {uid:'a',name:'A',isGM:false,isAlive:true} : undefined));
  assert.equal(result.committed,true);
  await assertFails(join('b',0));
  await update(ref(db('gm'),'rooms/ABC234/public'),{phase:'night'});
  await assertFails(join('b',1));
});
test('only the host can read all roles; players read only their own', async () => {
  await start();
  await assertSucceeds(get(ref(db('gm'),'rooms/ABC234/secrets')));
  await assertSucceeds(get(ref(db('a'),'rooms/ABC234/secrets/a')));
  await assertFails(get(ref(db('a'),'rooms/ABC234/secrets/b')));
  await assertFails(get(ref(db('a'),'rooms/ABC234/secrets')));
  await assertFails(get(ref(db('a'),'rooms/ABC234')));
  await assertFails(set(ref(db('a'),'rooms/ABC234/secrets/a/roleId'),'herald'));
  await assertFails(set(ref(db('a'),'rooms/ABC234/secrets/a/seat'),'1'));
});
test('night actions require a living actor, their turn and a valid target', async () => {
  await start();
  await assertFails(set(ref(db('b'),'rooms/ABC234/secrets/b/nightActionDone'),true));
  await assertFails(set(ref(db('a'),'rooms/ABC234/secrets/a/nightActionTarget'),'gm'));
  await assertSucceeds(update(ref(db('a'),'rooms/ABC234/secrets/a'),{nightActionDone:true,nightActionTarget:'1'}));
  await assertFails(set(ref(db('a'),'rooms/ABC234/secrets/a/nightActionTarget'),'0'));
  await update(ref(db('gm'),'rooms/ABC234'),{'secrets/a/nightActionDone':false,'public/seats/0/isAlive':false});
  await assertFails(set(ref(db('a'),'rooms/ABC234/secrets/a/nightActionDone'),true));
});
test('votes require day phase, a living voter and target; locked votes cannot change', async () => {
  await start();
  await assertFails(set(ref(db('a'),'rooms/ABC234/public/votes/a'),'1'));
  await update(ref(db('gm'),'rooms/ABC234/public'),{phase:'day',voteResolved:false});
  await assertSucceeds(set(ref(db('a'),'rooms/ABC234/public/votes/a'),'1'));
  await assertFails(set(ref(db('a'),'rooms/ABC234/public/votes/b'),'0'));
  await assertFails(set(ref(db('a'),'rooms/ABC234/public/votes/a'),'gm'));
  await update(ref(db('gm'),'rooms/ABC234/public'),{'seats/0/isAlive':false});
  await assertFails(set(ref(db('a'),'rooms/ABC234/public/votes/a'),'1'));
  await update(ref(db('gm'),'rooms/ABC234/public'),{voteResolved:true});
  await assertFails(set(ref(db('b'),'rooms/ABC234/public/votes/b'),'1'));
});
test('roles become readable at the end of the game', async () => {
  await start();
  await update(ref(db('gm'),'rooms/ABC234/public'),{phase:'gameover'});
  await assertSucceeds(get(ref(db('a'),'rooms/ABC234/secrets')));
});
test('online transport preserves private roles, targets and final reveals end to end', async () => {
  const vm = require('node:vm');
  const { webcrypto } = require('node:crypto');
  const context={ console, crypto:webcrypto, FIREBASE_CONFIG:{configured:true}, navigator:{}, addEventListener(){}, removeEventListener(){} };
  context.window=context; vm.createContext(context);
  vm.runInContext(fs.readFileSync('assets/js/components/room-client.js','utf8'),context);
  function client(uid) { const c=new context.RoomClient(); c.uid=uid; c.db=db(uid); return c; }
  const gm=client('host'), a=client('player-a'), b=client('player-b');
  const code=await gm.create('Conteur',{playerCount:2,roundCount:5});
  await a.join(code,'Alice'); await b.join(code,'Bob');
  const states={}; let failure;
  for (const [key,c] of Object.entries({gm,a,b})) c.subscribe(code,snapshot=>{states[key]=snapshot;},error=>{failure=error;});
  async function until(predicate) {
    const start=Date.now();
    while (!predicate()) {
      if (failure) throw failure;
      if (Date.now()-start > 4000) throw new Error('Timed out waiting for room snapshot');
      await new Promise(resolve=>setTimeout(resolve,10));
    }
  }
  try {
    await until(()=>states.gm && states.a && states.b);
    await gm.write({'players/host/roleId':'gm','players/player-a/roleId':'assassin','players/player-b/roleId':'herald',phase:'night',currentRole:'assassin'});
    await until(()=>states.a.players['player-a'].roleId==='assassin' && states.b.players['player-b'].roleId==='herald');
    assert.equal(states.a.players['player-b'].roleId,undefined);
    assert.equal(states.b.players['player-a'].roleId,undefined);
    await a.write({'players/player-a/nightActionDone':true,'players/player-a/nightActionTarget':'player-b'});
    await until(()=>states.gm.players['player-a'].nightActionTarget==='player-b');
    assert.equal(states.b.players['player-a'].nightActionTarget,null);
    await gm.write({phase:'gameover',winner:{faction:'ombre'}});
    await until(()=>states.a.players['player-b'].roleId==='herald');
    assert.equal(states.a.winner.faction,'ombre');
  } finally { gm.unsubscribe(); a.unsubscribe(); b.unsubscribe(); }
});
test('one-time powers cannot be reused or restored by players',async()=>{
 await start();
 await update(ref(db('gm'),'rooms/ABC234'),{'secrets/a/roleId':'voyant','public/currentRole':'voyant'});
 await assertSucceeds(update(ref(db('a'),'rooms/ABC234/secrets/a'),{nightActionDone:true,nightActionTarget:'1',powerUsed:true}));
 await assertFails(set(ref(db('a'),'rooms/ABC234/secrets/a/powerUsed'),false));
 await update(ref(db('gm'),'rooms/ABC234/secrets/a'),{nightActionDone:false});
 await assertFails(set(ref(db('a'),'rooms/ABC234/secrets/a/nightActionDone'),true));
 await assertSucceeds(set(ref(db('gm'),'rooms/ABC234/secrets/a/powerUsed'),false));
 await assertSucceeds(set(ref(db('a'),'rooms/ABC234/secrets/a/nightActionDone'),true));
});
test('district constraints and host adjudication are enforced',async()=>{
 await start();
 await assertSucceeds(update(ref(db('gm'),'rooms/ABC234/public'),{'seats/0/district':1,'seats/1/district':2}));
 await assertFails(set(ref(db('a'),'rooms/ABC234/secrets/a/nightActionTarget'),'1'));
 await assertFails(set(ref(db('a'),'rooms/ABC234/public/seats/0/district'),2));
 await assertFails(set(ref(db('a'),'rooms/ABC234/public/seats/1/isAlive'),false));
 await assertSucceeds(set(ref(db('gm'),'rooms/ABC234/public/seats/1/district'),1));
 await assertSucceeds(set(ref(db('a'),'rooms/ABC234/secrets/a/nightActionTarget'),'1'));
 await assertSucceeds(set(ref(db('gm'),'rooms/ABC234/public/seats/0/arrested'),true));
 await assertFails(set(ref(db('a'),'rooms/ABC234/secrets/a/nightActionDone'),true));
 await assertFails(set(ref(db('gm'),'rooms/ABC234/public/seats/0/district'),4));
});
