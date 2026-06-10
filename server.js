#!/usr/bin/env node
const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');

const app = express();

let PORT = parseInt(process.env.PORT) || 3000;
const ROOTS = [];

app.use(express.json());
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (_req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ---- static ----
app.use(express.static(path.join(__dirname, 'public')));
app.use('/lib', express.static(path.join(__dirname, 'node_modules')));

// ---- docs ----
app.use('/docs', (req, res) => {
  var urlPath = (req.originalUrl || req.url || '').split('?')[0];
  var pathname = urlPath.replace(/^\/docs\/?/, '').replace(/^\/+/, '');
  var parts = pathname.split('/').map(decodeURIComponent);
  const first = parts[0];

  // --- match named root ---
  const root = ROOTS.find(r => r.name === first);
  if (root) {
    const sub = parts.slice(1).join('/') || '';
    return serveDoc(res, root.absPath, sub);
  }

  // --- single root fallback ---
  if (ROOTS.length === 1) {
    return serveDoc(res, ROOTS[0].absPath, pathname);
  }

  // --- multi-root mismatch ---
  if (ROOTS.length > 1) {
    return res.status(400).send(
      'Use /docs/<root>/path. Mounted roots: ' + ROOTS.map(r => r.name).join(', ')
    );
  }

  res.status(404).send('No document roots mounted');
});

function serveDoc(res, baseDir, subPath) {
  const filePath = path.join(baseDir, subPath);
  const resolved = path.resolve(filePath);
  const safeRoot = path.resolve(baseDir);

  if (!resolved.startsWith(safeRoot + path.sep) && resolved !== safeRoot) {
    return res.status(403).send('Forbidden');
  }

  if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) {
    return res.sendFile(resolved);
  }

  // try index.md
  const indexPath = path.join(resolved, 'index.md');
  const resolvedIndex = path.resolve(indexPath);
  if (resolvedIndex.startsWith(safeRoot) && fs.existsSync(resolvedIndex) && fs.statSync(resolvedIndex).isFile()) {
    return res.sendFile(resolvedIndex);
  }

  res.status(404).send('Not found');
}

// ---- api ----
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', roots: ROOTS.map(r => r.name), port: PORT });
});

app.post('/api/mount', (req, res) => {
  let { name, absPath } = req.body;
  if (!name || !absPath) return res.status(400).json({ error: 'name and absPath required' });
  if (ROOTS.find(r => r.name === name)) return res.status(409).json({ error: 'Name already exists: ' + name });
  absPath = path.resolve(absPath);
  if (!fs.existsSync(absPath)) return res.status(400).json({ error: 'Path does not exist: ' + absPath });
  ROOTS.push({ name, absPath });
  console.log(`Mounted "${name}" → ${absPath}`);
  res.json({ ok: true, name, port: PORT });
});

app.delete('/api/mount/:name', (req, res) => {
  const name = decodeURIComponent(req.params.name);
  const idx = ROOTS.findIndex(r => r.name === name);
  if (idx === -1) return res.status(404).json({ error: 'Root not found: ' + name });
  const removed = ROOTS.splice(idx, 1)[0];
  console.log(`Removed "${removed.name}"`);
  res.json({ ok: true });
});

app.get('/api/structure', (_req, res) => {
  try {
    const result = ROOTS.map(r => ({ name: r.name, path: r.absPath, tree: scanDir(r.absPath, '') }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function scanDir(baseDir, relDir) {
  const fullPath = path.join(baseDir, relDir);
  if (!fs.existsSync(fullPath)) return [];
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  const dirs = [];
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;
    if (entry.isDirectory()) {
      dirs.push({ name: entry.name, title: slugToTitle(entry.name), type: 'dir', children: scanDir(baseDir, path.join(relDir, entry.name)) });
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const slug = entry.name.replace(/\.md$/, '');
      const itemPath = relDir ? relDir.replace(/\\/g, '/') + '/' + entry.name : entry.name;
      files.push({ name: slug, title: slugToTitle(slug), type: 'file', path: itemPath });
    }
  }

  const index = files.find(f => f.name === 'index');
  const rest = files.filter(f => f.name !== 'index');
  rest.sort((a, b) => a.name.localeCompare(b.name));
  dirs.sort((a, b) => a.name.localeCompare(b.name));

  if (index) return [index, ...dirs, ...rest];
  return [...dirs, ...rest];
}

function slugToTitle(slug) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w+/g, word => word[0].toUpperCase() + word.slice(1).toLowerCase());
}

// ---- CLI ----
function parseArgs(argv) {
  const roots = [];
  const removeNames = [];
  let port = null;
  let fresh = false;
  let list = false;
  let i = 2;

  while (i < argv.length) {
    const a = argv[i];
    if (a === '-n' || a === '--name') {
      const name = argv[i + 1];
      if (!name || name.startsWith('-')) { i++; continue; }
      const next = argv[i + 2];
      if (next && !next.startsWith('-')) {
        // pair: -n name path
        roots.push({ name, absPath: path.resolve(next) });
        i += 3;
      } else {
        // rename last positional
        if (roots.length > 0) roots[roots.length - 1].name = name;
        i += 2;
      }
    } else if (a === '-p' || a === '--port') {
      port = parseInt(argv[i + 1]) || null;
      i += 2;
    } else if (a === '--fresh') {
      fresh = true;
      i++;
    } else if (a === '--remove' || a === '-r') {
      const name = argv[i + 1];
      if (name && !name.startsWith('-')) {
        removeNames.push(name);
        i += 2;
      } else { i++; }
    } else if (a === '--list' || a === '-l') {
      list = true;
      i++;
    } else if (!a.startsWith('-')) {
      const dirPath = path.resolve(a);
      const dirName = path.basename(dirPath).replace(/[/\\]$/, '') || 'docs';
      roots.push({ name: dirName, absPath: dirPath });
      i++;
    } else {
      i++;
    }
  }

  return { roots, removeNames, port, fresh, list };
}

function api(port, method, path, body, timeout) {
  return new Promise((resolve, reject) => {
    var headers = body ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } : {};
    var req = http.request({ hostname: '127.0.0.1', port: port, path: path, method: method, headers: headers }, function (res) {
      var data = '';
      res.on('data', function (c) { data += c; });
      res.on('end', function () { resolve({ status: res.statusCode, data: data }); });
    });
    req.on('error', reject);
    if (timeout) req.setTimeout(timeout, function () { req.destroy(); reject(new Error('timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

async function tryMount(port, roots) {
  for (var i = 0; i < roots.length; i++) {
    var r = roots[i];
    try {
      var resp = await api(port, 'POST', '/api/mount', JSON.stringify({ name: r.name, absPath: r.absPath }));
      if (resp.status === 200) console.log(`  Mounted "${r.name}" → http://localhost:${port}`);
      else if (resp.status === 409) console.log(`  "${r.name}" already mounted`);
      else console.log(`  Failed to mount "${r.name}": ${resp.data}`);
    } catch (e) {
      console.error(`  Cannot reach http://localhost:${port}: ${e.message}`);
      process.exit(1);
    }
  }
}

async function tryRemove(port, names) {
  for (var i = 0; i < names.length; i++) {
    var name = names[i];
    try {
      var resp = await api(port, 'DELETE', '/api/mount/' + encodeURIComponent(name));
      if (resp.status === 200) console.log(`  Removed "${name}"`);
      else console.log(`  "${name}" not found`);
    } catch (e) {
      console.error(`  Cannot reach server: ${e.message}`);
      process.exit(1);
    }
  }
}

async function tryList(port) {
  try {
    var health = JSON.parse(await api(port, 'GET', '/api/health', null, 2000).then(function (r) { return r.data; }));
    console.log(`Doc Reader on port ${health.port}:`);
    try {
      var roots = JSON.parse(await api(port, 'GET', '/api/structure', null, 2000).then(function (r) { return r.data; }));
      for (var i = 0; i < roots.length; i++) {
        var r = roots[i];
        console.log(`  "${r.name}"  →  ${r.path}  (${(r.tree || []).length} entries)`);
      }
    } catch (_e) {
      if (health.roots) for (var i2 = 0; i2 < health.roots.length; i2++) console.log(`  ${health.roots[i2]}`);
    }
  } catch (e) {
    console.error(`No server running on port ${port}`);
    process.exit(1);
  }
}

(async function main() {
  const { roots: parsedRoots, removeNames, port: parsedPort, fresh, list } = parseArgs(process.argv);

  if (parsedPort) PORT = parsedPort;
  const probePort = parsedPort || 3000;

  // --list
  if (list) {
    await tryList(probePort);
    process.exit(0);
  }

  // --remove: send DELETE to existing server
  if (removeNames.length > 0) {
    await tryRemove(probePort, removeNames);
    process.exit(0);
  }

  // --add (default): try to mount to existing server
  if (!fresh && parsedRoots.length > 0) {
    try {
      await api(probePort, 'GET', '/api/health', null, 2000);
      console.log(`Server running on port ${probePort}. Mounting...`);
      await tryMount(probePort, parsedRoots);
      console.log('Refresh the browser to see changes.');
      process.exit(0);
    } catch (_e) {
      // no server — fall through to start new
    }
  }

  for (const r of parsedRoots) ROOTS.push(r);

  if (ROOTS.length === 0) {
    const defaultPath = path.resolve(process.env.DOCS_DIR || path.join(process.cwd(), 'docs'));
    ROOTS.push({ name: 'docs', absPath: defaultPath });
  }

  app.listen(PORT, () => {
    console.log(`Doc Reader :: http://localhost:${PORT}`);
    for (const r of ROOTS) console.log(`  "${r.name}" → ${r.absPath}`);
  }).on('error', function (e) {
    if (e.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Use -p <port> or kill the existing server.`);
      process.exit(1);
    }
    throw e;
  });
})();
