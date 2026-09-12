const fs = require('fs');
const s = fs.readFileSync('assets/js/app.js', 'utf8');
const m = s.match(/var QUIZ = \[([\s\S]*?)\n  \];/);
const arr = eval('[' + m[1] + ']');
console.log('ok indices:', arr.map(q => q.ok).join(','));
const okSet = new Set(arr.map(q => q.ok));
console.log('distribution:', okSet.size >= 2 ? 'OK (varied)' : 'WARN same');
let bad = 0;
for (let i = 0; i < arr.length; i++) if (!arr[i].opts[arr[i].ok] || arr[i].opts[arr[i].ok].length < 10) { bad++; console.log('BAD ok text q' + (i + 1)); }
console.log('bad ok texts:', bad);