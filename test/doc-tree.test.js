const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { scanDir } = require('../src/doc-tree');

test('scanDir includes Markdown files directly inside the docs root', t => {
  const docs = fs.mkdtempSync(path.join(os.tmpdir(), 'doc-reader-'));
  t.after(() => fs.rmSync(docs, { recursive: true, force: true }));

  fs.writeFileSync(path.join(docs, 'index.md'), '# Home');
  fs.writeFileSync(path.join(docs, 'root-note.md'), '# Root note');
  fs.writeFileSync(path.join(docs, 'UPPER.MD'), '# Uppercase extension');
  fs.writeFileSync(path.join(docs, '_draft.md'), '# Hidden draft');
  fs.mkdirSync(path.join(docs, 'guide'));
  fs.writeFileSync(path.join(docs, 'guide', 'setup.md'), '# Setup');

  const tree = scanDir(docs);

  assert.deepEqual(tree.map(item => [item.type, item.path || item.name]), [
    ['file', 'index.md'],
    ['file', 'root-note.md'],
    ['file', 'UPPER.MD'],
    ['dir', 'guide'],
  ]);
  assert.equal(tree[3].children[0].path, 'guide/setup.md');
});
