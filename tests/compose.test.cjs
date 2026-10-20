const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
function composer() {
  const context = { console, document: { documentElement: {lang:'fr'}, querySelectorAll:()=>[], querySelector:()=>({dataset:{lang:'fr'}}), addEventListener(){}, getElementById:()=>({addEventListener(){},scrollIntoView(){}}) }, matchMedia:()=>({matches:true}) };
  context.window=context;vm.createContext(context);
  vm.runInContext(fs.readFileSync('assets/js/data/roles.js','utf8'),context);
  vm.runInContext(fs.readFileSync('assets/js/pages/compose.js','utf8'),context);
  vm.runInContext('renderComposition = () => {}',context);
  return code=>vm.runInContext(code,context);
}
test('every size and difficulty produces exactly the requested number of unique roles',()=>{
 const run=composer();
 for(let count=8;count<=20;count++) for(const difficulty of ['beginner','standard','expert']) {
   const roles=JSON.parse(run(`selectedPlayers=${count}; selectedDiff='${difficulty}'; generate(); JSON.stringify([...currentComposition.lune,...currentComposition.ombre,...currentComposition.solitaire].map(role=>role.id))`));
   assert.equal(roles.length,count,`${count}/${difficulty}`);assert.equal(new Set(roles).size,count);
 }
});
test('beginner compositions use experts only when the faction pool requires them',()=>{
 const run=composer();
 for(let count=8;count<=20;count++) {
   run(`selectedPlayers=${count}; selectedDiff='beginner'; generate()`);
   for(const faction of ['lune','ombre','solitaire']) {
     const result=JSON.parse(run(`JSON.stringify({actual:currentComposition.${faction}.filter(r=>r.difficulty==='expert').length, expected:Math.max(0,COMPOSITIONS[${count}].${faction}-ROLES.filter(r=>r.faction==='${faction}'&&r.difficulty!=='expert').length)})`));
     assert.equal(result.actual,result.expected);
   }
 }
});
