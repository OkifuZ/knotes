const fs = require('fs');
const path = require('path');

function scanDir(baseDir, relDir) {
  relDir = relDir || '';
  const fullPath = path.join(baseDir, relDir);
  if (!fs.existsSync(fullPath)) return [];

  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  const dirs = [];
  const files = [];

  for (const entry of entries) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue;

    if (entry.isDirectory()) {
      dirs.push({
        name: entry.name,
        title: slugToTitle(entry.name),
        type: 'dir',
        children: scanDir(baseDir, path.join(relDir, entry.name)),
      });
    } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.md') {
      const slug = entry.name.slice(0, -path.extname(entry.name).length);
      const itemPath = relDir ? relDir.replace(/\\/g, '/') + '/' + entry.name : entry.name;
      files.push({ name: slug, title: slugToTitle(slug), type: 'file', path: itemPath });
    }
  }

  const index = files.find(file => file.name.toLowerCase() === 'index');
  const rest = files.filter(file => file !== index);
  rest.sort((a, b) => a.name.localeCompare(b.name));
  dirs.sort((a, b) => a.name.localeCompare(b.name));

  // Keep Markdown files at the current level visible before potentially long subtrees.
  return (index ? [index] : []).concat(rest, dirs);
}

function slugToTitle(slug) {
  return slug.replace(/[-_]/g, ' ').replace(/\b\w+/g, word => word[0].toUpperCase() + word.slice(1).toLowerCase());
}

module.exports = { scanDir, slugToTitle };
