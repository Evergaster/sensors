const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const js = fs.readFileSync('assets/js/app.js', 'utf8');
function strip(s) { return s.replace(/<!--[\s\S]*?-->/g, ''); }
const H = strip(html);
const stack = [];
const voids = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
const re = /<\/?([a-zA-Z][a-zA-Z0-9]*)((?:\s[^<>]*)?)>/g;
let m, errs = [];
while ((m = re.exec(H)) !== null) {
  const tag = m[1].toLowerCase(), full = m[0];
  if (full.startsWith('</')) {
    if (voids.has(tag)) continue;
    if (stack.length && stack[stack.length - 1].tag === tag) stack.pop();
    else if (stack.length) errs.push('unbalanced </' + tag + '> after <' + stack[stack.length - 1].tag + '>');
    else errs.push('extra </' + tag + '>');
  } else if (!/\/>$/.test(full) && !voids.has(tag)) {
    stack.push({ tag, at: m.index });
  }
}
if (stack.length) errs.push('unclosed: ' + stack.map(s => s.tag).join(','));
const ids = new Set();
const idRe = /\bid="([^"]+)"/g;
const idRegex = /\bid="([^"]+)"/g;
let im;
while ((im = idRegex.exec(H)) !== null) ids.add(im[1]);
let missed = [];
const refRe = /(?:getElementById\(['"]|querySelector\(['"]#|"[^"]*\bid=)/g;
const used = new Set();
// crude: all #id references in JS strings and $('#'...) selectors
const refs = /\$\('#([A-Za-z0-9_\-]+)'\)|querySelector\(['"]#([A-Za-z0-9_\-]+)|getElementById\('([A-Za-z0-9_\-]+)'\)/g;
let r;
while ((r = refs.exec(js)) !== null) {
  const id = r[1] || r[2] || r[3];
  if (id) used.add(id);
}
used.forEach((u) => { if (!ids.has(u)) missed.push(u); });
console.log('TAGS:', errs.length ? 'ERROR ' + errs.join(' | ') : 'ALL BALANCED');
console.log('IDS html:', ids.size, '| JS refs:', used.size);
console.log('MISSING refs:', missed.length ? missed.join(',') : 'none');
console.log('NEW id check:', ['modePrinc','ctl-ir','irTemp','irTmpV','pressTabs','pressPrinc'].map(i => i + '=' + (ids.has(i) ? 'ok' : 'MISSING')).join(' '));