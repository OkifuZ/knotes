async function loadSidebar(data) {
  const treeEl = document.getElementById('sidebar-tree');
  try {
    if (!data) {
      const resp = await fetch('/api/structure');
      data = await resp.json();
    }
    treeEl.innerHTML = renderRoots(data);
    bindSidebarEvents();
    highlightCurrentDoc();
  } catch (err) {
    treeEl.innerHTML = '<div style="padding:20px;color:var(--text-muted);font-size:13px;">No documents found</div>';
  }
}

function renderRoots(roots) {
  if (!roots.length) return '';
  var multiRoot = roots.length > 1;
  return roots.map(function (root) {
    return '<div class="root-group open">'
      + '<div class="root-header folder-header" style="padding-left:16px"><span class="folder-arrow">&#9654;</span>' + root.name + '</div>'
      + '<div class="folder-children">' + renderTree(root.tree, 0, root.name, multiRoot) + '</div>'
      + '</div>';
  }).join('');
}

function renderTree(items, depth, rootName, multiRoot) {
  depth = depth || 0;
  if (!items.length) return '';
  var base = 16;
  var step = 20;
  var folderPad = base + depth * step;
  var filePad = folderPad + 12;
  var hashBase = multiRoot ? '#' + rootName + '/' : '#';
  return '<ul>' + items.map(function (item) {
    if (item.type === 'dir') {
      return '<li class="folder">'
        + '<div class="folder-header" style="padding-left:' + folderPad + 'px"><span class="folder-arrow">&#9654;</span>' + item.title + '</div>'
        + '<div class="folder-children">' + renderTree(item.children || [], depth + 1, rootName, multiRoot) + '</div>'
        + '</li>';
    }
    return '<li><a href="' + hashBase + item.path.replace(/\.md$/, '') + '" data-path="' + item.path + '" data-root="' + (rootName || '') + '" style="padding-left:' + filePad + 'px">' + item.title + '</a></li>';
  }).join('') + '</ul>';
}

function bindSidebarEvents() {
  document.querySelectorAll('#sidebar-tree .folder-header, #sidebar-tree .root-header').forEach(function (header) {
    header.addEventListener('click', function () {
      var parent = header.closest('.folder, .root-group');
      if (parent) parent.classList.toggle('open');
    });
  });
}

function highlightCurrentDoc() {
  var hash = location.hash.slice(1) || '';
  if (!hash) hash = 'index';
  var docPath = hash + (hash.endsWith('.md') ? '' : '.md');

  document.querySelectorAll('#sidebar-tree a').forEach(function (a) {
    var linkPath = a.dataset.path;
    var linkRoot = a.dataset.root || '';
    var fullPath = linkRoot ? linkRoot + '/' + linkPath : linkPath;
    var active = fullPath === docPath || linkPath === docPath;
    a.classList.toggle('active', active);
    if (active) {
      openAncestors(a);
    }
  });
}

function openAncestors(el) {
  var parent = el.parentElement;
  while (parent) {
    if (parent.classList.contains('folder-children')) {
      var folder = parent.parentElement;
      folder.classList.add('open');
    }
    parent = parent.parentElement;
  }
}
