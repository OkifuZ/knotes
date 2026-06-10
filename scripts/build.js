var fs = require('fs');
var path = require('path');

var ROOT = path.join(__dirname, '..');
var options = parseArgs(process.argv.slice(2));
var SRC = path.resolve(options.docsDir || process.env.DOCS_DIR || path.join(ROOT, 'docs'));
var DST = path.join(ROOT, 'public', 'docs');
var LIB = path.join(ROOT, 'public', 'lib');
var NM = path.join(ROOT, 'node_modules');
var ROOT_NAME = options.name || process.env.DOCS_NAME || path.basename(SRC) || 'docs';
var PAGES_ROOT = options.pagesRoot;
var EXCLUDED_DOC_FILES = { 'AGENTS.md': true };

function parseArgs(args) {
  var result = { docsDir: null, name: null, pagesRoot: false };
  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    if (arg === '--pages-root') {
      result.pagesRoot = true;
    } else if (arg === '--docs-dir' || arg === '--docs') {
      result.docsDir = args[++i] || null;
    } else if (arg === '-n' || arg === '--name') {
      result.name = args[++i] || null;
    } else if (!arg.startsWith('-') && !result.docsDir) {
      result.docsDir = arg;
    }
  }
  return result;
}

function rmDir(dir) {
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true });
}

function mkDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function cpDir(src, dst) {
  mkDir(dst);
  var entries = fs.readdirSync(src, { withFileTypes: true });
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var s = path.join(src, e.name);
    var d = path.join(dst, e.name);
    if (EXCLUDED_DOC_FILES[e.name]) continue;
    if (e.isDirectory()) cpDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

// ----- scan docs/ -----
function scanDir(base, rel) {
  var full = path.join(base, rel);
  var entries = fs.readdirSync(full, { withFileTypes: true });
  var dirs = [];
  var files = [];
  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    if (e.name.startsWith('_') || e.name.startsWith('.')) continue;
    if (EXCLUDED_DOC_FILES[e.name]) continue;
    if (e.isDirectory()) {
      dirs.push({ name: e.name, title: slugToTitle(e.name), type: 'dir', children: scanDir(base, path.join(rel, e.name)) });
    } else if (e.isFile() && e.name.endsWith('.md')) {
      var slug = e.name.replace(/\.md$/, '');
      var itemPath = rel ? rel.replace(/\\/g, '/') + '/' + e.name : e.name;
      files.push({ name: slug, title: slugToTitle(slug), type: 'file', path: itemPath });
    }
  }
  var index = files.find(function (f) { return f.name === 'index'; });
  var rest = files.filter(function (f) { return f.name !== 'index'; });
  rest.sort(function (a, b) { return a.name.localeCompare(b.name); });
  dirs.sort(function (a, b) { return a.name.localeCompare(b.name); });
  if (index) return [index].concat(dirs).concat(rest);
  return dirs.concat(rest);
}

function slugToTitle(slug) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w+/g, function (word) { return word[0].toUpperCase() + word.slice(1).toLowerCase(); });
}

// ----- main -----
console.log('Build static...');
console.log('  source: ' + SRC);

// 1. structure.json
var tree = scanDir(SRC, '');
var structure = [{ name: ROOT_NAME, path: 'docs', tree: tree }];
fs.writeFileSync(path.join(ROOT, 'public', 'structure.json'), JSON.stringify(structure, null, 2));
console.log('  structure.json (' + tree.length + ' entries)');

// 2. copy docs/*.md
rmDir(DST);
cpDir(SRC, DST);
console.log('  docs/ copied');

// 3. copy vendor libs
rmDir(LIB);
var libs = [
  ['marked', 'marked.min.js'],
  ['katex', 'dist/katex.min.js'],
  ['katex', 'dist/katex.min.css'],
  ['mermaid', 'dist/mermaid.min.js'],
  ['@highlightjs/cdn-assets', 'highlight.min.js'],
  ['@highlightjs/cdn-assets', 'styles/github.min.css'],
  ['@highlightjs/cdn-assets', 'styles/arta.min.css'],
  ['@highlightjs/cdn-assets', 'styles/monokai-sublime.min.css'],
];
for (var i = 0; i < libs.length; i++) {
  var l = libs[i];
  var src = path.join(NM, l[0], l[1]);
  var dst = path.join(LIB, l[0], l[1]);
  mkDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
}
// katex needs fonts
var fontSrc = path.join(NM, 'katex', 'dist', 'fonts');
var fontDst = path.join(LIB, 'katex', 'dist', 'fonts');
cpDir(fontSrc, fontDst);
console.log('  vendor/ copied');

if (PAGES_ROOT) {
  var mirrors = ['css', 'js', 'lib'];
  for (var m = 0; m < mirrors.length; m++) {
    var name = mirrors[m];
    rmDir(path.join(ROOT, name));
    cpDir(path.join(ROOT, 'public', name), path.join(ROOT, name));
  }
  fs.copyFileSync(path.join(ROOT, 'public', 'index.html'), path.join(ROOT, 'index.html'));
  fs.copyFileSync(path.join(ROOT, 'public', 'structure.json'), path.join(ROOT, 'structure.json'));
  fs.writeFileSync(path.join(ROOT, '.nojekyll'), '');
  console.log('  pages root mirrored');
}

console.log('Done.');
