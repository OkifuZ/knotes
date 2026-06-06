(function () {
  const content = document.getElementById('content');
  const sidebar = document.getElementById('sidebar');
  const tocPanel = document.getElementById('toc-panel');
  const menuToggle = document.getElementById('menu-toggle');
  const tocToggle = document.getElementById('toc-toggle');
  const overlay = document.getElementById('overlay');
  const themeToggle = document.getElementById('theme-toggle');
  const hljsTheme = document.getElementById('hljs-theme');
  const resizeHandle = document.getElementById('resize-handle');
  const app = document.getElementById('app');

  var rootNames = [];
  var currentRoot = '';

  const savedTheme = localStorage.getItem('doc-reader-theme') || 'light';
  applyTheme(savedTheme);

  window.addEventListener('hashchange', navigate);
  initRoots().then(navigate);

  async function initRoots() {
    try {
      const resp = await fetch('/api/structure');
      const data = await resp.json();
      rootNames = data.map(function (r) { return r.name; });
      if (rootNames.length === 1) currentRoot = rootNames[0];
    } catch (_e) { rootNames = []; }
  }

  themeToggle.addEventListener('click', function () {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('doc-reader-theme', next);
  });

  document.querySelectorAll('.wbtn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const w = btn.dataset.width;
      document.querySelectorAll('.wbtn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      app.style.setProperty('--content-w', w === '0' ? 'none' : w + 'px');
      localStorage.setItem('doc-reader-width', w);
    });
  });
  (function initWidth() {
    const saved = localStorage.getItem('doc-reader-width') || '1100';
    app.style.setProperty('--content-w', saved === '0' ? 'none' : saved + 'px');
    document.querySelectorAll('.wbtn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.width === saved);
    });
  })();

  menuToggle.addEventListener('click', function () {
    const open = sidebar.classList.toggle('open');
    overlay.classList.toggle('show', open);
    tocPanel.classList.remove('open');
  });

  tocToggle.addEventListener('click', function () {
    const open = tocPanel.classList.toggle('open');
    overlay.classList.toggle('show', open);
    sidebar.classList.remove('open');
  });

  overlay.addEventListener('click', closeAllPanels);

  initMermaidModal();

  sidebar.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      if (window.innerWidth <= 860) closeAllPanels();
    });
  });

  function closeAllPanels() {
    sidebar.classList.remove('open');
    tocPanel.classList.remove('open');
    overlay.classList.remove('show');
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (theme === 'dark') {
      mermaid.initialize({
        theme: 'base',
        themeVariables: {
          background: '#1b1c21',
          primaryColor: '#2a2b30',
          primaryTextColor: '#e4ddd0',
          primaryBorderColor: '#3a3b40',
          lineColor: '#8a8a92',
          secondaryColor: '#222328',
          tertiaryColor: '#1e1f24',
          nodeBorder: '#3a3b40',
          mainBkg: '#2a2b30',
          edgeLabelBackground: '#1b1c21',
          clusterBkg: '#222328',
          clusterBorder: '#3a3b40',
          titleColor: '#e4ddd0',
          actorBorder: '#3a3b40',
          actorBkg: '#2a2b30',
          actorTextColor: '#e4ddd0',
          signalColor: '#e4ddd0',
          signalTextColor: '#e4ddd0',
          labelTextColor: '#e4ddd0',
          loopTextColor: '#e4ddd0',
        },
      });
      hljsTheme.href = '/lib/@highlightjs/cdn-assets/styles/monokai-sublime.min.css';
    } else {
      mermaid.initialize({
        theme: 'base',
        themeVariables: {
          background: '#f4f1ea',
          primaryColor: '#ece6db',
          primaryTextColor: '#3c3832',
          primaryBorderColor: '#c4bbad',
          lineColor: '#8a847c',
          secondaryColor: '#e4dcd0',
          tertiaryColor: '#f0ebe3',
          nodeBorder: '#c4bbad',
          mainBkg: '#ece6db',
          edgeLabelBackground: '#f4f1ea',
          clusterBkg: '#e4dcd0',
          clusterBorder: '#c4bbad',
          titleColor: '#3c3832',
          actorBorder: '#c4bbad',
          actorBkg: '#ece6db',
          actorTextColor: '#3c3832',
          signalColor: '#3c3832',
          signalTextColor: '#3c3832',
          labelTextColor: '#3c3832',
          loopTextColor: '#3c3832',
        },
      });
      hljsTheme.href = '/lib/@highlightjs/cdn-assets/styles/arta.min.css';
    }
    reRenderAllMermaid();
  }

  function parseHash(raw) {
    if (!raw) return { root: currentRoot || (rootNames[0] || ''), sub: 'index' };
    if (rootNames.length <= 1) return { root: rootNames[0] || '', sub: raw };
    var slash = raw.indexOf('/');
    if (slash === -1) {
      if (rootNames.indexOf(raw) !== -1) return { root: raw, sub: 'index' };
      return { root: rootNames[0], sub: raw };
    }
    var candidate = raw.substring(0, slash);
    if (rootNames.indexOf(candidate) !== -1) {
      return { root: candidate, sub: raw.substring(slash + 1) || 'index' };
    }
    return { root: rootNames[0], sub: raw };
  }

  function isDocHash(hash) {
    if (!hash) return true;
    return !/^(h-\d+-[a-z0-9]+|heading-\d+-\w+)$/.test(hash);
  }

  async function navigate() {
    var raw = location.hash.slice(1) || '';

    if (raw && !isDocHash(raw)) {
      history.replaceState(null, '', '#index');
      raw = 'index';
    }

    closeAllPanels();

    var parsed = parseHash(raw);
    currentRoot = parsed.root;
    var docPath = parsed.root + '/' + (parsed.sub.endsWith('.md') ? parsed.sub : parsed.sub + '.md');

    content.innerHTML = '<div class="loading"></div>';
    document.getElementById('toc').innerHTML = '';

    try {
      const resp = await fetch('/docs/' + docPath);
      if (!resp.ok) throw new Error('Not found');
      const md = await resp.text();
      var html = renderMarkdown(md, docPath, currentRoot, rootNames.length > 1);
      content.innerHTML = html;

      await renderMermaidBlocks(content);
      generateTOC();
      loadSidebar();
    } catch (_err) {
      if (parsed.sub === 'index') {
        var first = await findFirstDoc(parsed.root);
        if (first) {
          location.hash = '#' + parsed.root + '/' + first.replace(/\.md$/, '');
          return;
        }
      }
      content.innerHTML = ''
        + '<div class="empty-state">'
        + '<h2>Document not found</h2>'
        + '<p><code>' + docPath + '</code> could not be loaded.</p>'
        + '<p style="margin-top:12px;font-size:13px;">Drop <code>.md</code> files to get started.</p>'
        + '</div>';
      loadSidebar();
    }
  }

  async function findFirstDoc(rootName) {
    try {
      const resp = await fetch('/api/structure');
      const data = await resp.json();
      var entry = data.find(function (r) { return r.name === rootName; });
      if (!entry) return null;
      function firstFile(items) {
        for (var i = 0; i < items.length; i++) {
          if (items[i].type === 'file') return items[i].path;
          if (items[i].type === 'dir' && items[i].children) {
            var found = firstFile(items[i].children);
            if (found) return found;
          }
        }
        return null;
      }
      return firstFile(entry.tree);
    } catch (_e) {
      return null;
    }
  }

  initDragResize();

  function initDragResize() {
    const tocHandle = document.getElementById('toc-resize-handle');
    var dragging = null;

    var configs = [
      { handle: resizeHandle, target: sidebar, cssVar: '--sidebar-w', key: 'doc-reader-sidebar-w', max: 500 },
      { handle: tocHandle, target: tocPanel, cssVar: '--toc-w', key: 'doc-reader-toc-w', max: 400 },
    ];

    configs.forEach(function (cfg) {
      var saved = localStorage.getItem(cfg.key);
      if (saved) {
        var v = parseInt(saved);
        if (v <= 30) {
          collapsePanel(cfg);
        } else {
          app.style.setProperty(cfg.cssVar, v + 'px');
        }
      }
      cfg.handle.addEventListener('mousedown', function (e) {
        var currentW = cfg.target.getBoundingClientRect().width;
        var startW = cfg.target.classList.contains('collapsed') ? 0 : Math.max(currentW, 0);
        dragging = { cfg: cfg, startX: e.clientX, startW: startW };
        cfg.handle.classList.add('active');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        e.preventDefault();
      });
    });

    document.addEventListener('mousemove', function (e) {
      if (!dragging) return;
      var cfg = dragging.cfg, startX = dragging.startX, startW = dragging.startW;
      var sign = cfg.handle === resizeHandle ? 1 : -1;
      var newW = startW + (e.clientX - startX) * sign;
      newW = Math.max(0, Math.min(cfg.max, newW));
      app.style.setProperty(cfg.cssVar, newW + 'px');
      cfg.target.classList.toggle('collapsed', newW <= 30);
    });

    document.addEventListener('mouseup', function () {
      if (!dragging) return;
      var cfg = dragging.cfg;
      cfg.handle.classList.remove('active');
      dragging = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      var w = cfg.target.getBoundingClientRect().width;
      if (w <= 30) {
        collapsePanel(cfg);
      } else {
        localStorage.setItem(cfg.key, w);
      }
    });
  }

  function collapsePanel(cfg) {
    app.style.setProperty(cfg.cssVar, '0px');
    cfg.target.classList.add('collapsed');
    localStorage.setItem(cfg.key, '0');
  }

  function initMermaidModal() {
    var modal = document.getElementById('mermaid-modal');
    var viewport = modal.querySelector('.mm-viewport');
    var stage = modal.querySelector('.mm-stage');
    var zoomLabel = modal.querySelector('.mm-zoom-label');
    var closeBtn = modal.querySelector('.mm-close');

    var state = { x: 0, y: 0, scale: 0.6, fitScale: 0.6, dragging: false, dragX: 0, dragY: 0, originX: 0, originY: 0 };

    function apply() {
      stage.style.transform = 'translate(' + state.x + 'px, ' + state.y + 'px) scale(' + state.scale + ')';
      zoomLabel.textContent = Math.round(state.scale / state.fitScale * 100) + '%';
    }

    function reset() {
      state.scale = state.fitScale;
      state.x = 0; state.y = 0;
      apply();
    }

    function open(svgHTML) {
      stage.innerHTML = svgHTML;
      modal.classList.add('show');
      requestAnimationFrame(function () {
        var svgEl = stage.querySelector('svg');
        if (!svgEl) return;
        var sw = svgEl.viewBox ? svgEl.viewBox.baseVal.width : (svgEl.getBoundingClientRect().width || 400);
        var sh = svgEl.viewBox ? svgEl.viewBox.baseVal.height : (svgEl.getBoundingClientRect().height || 300);
        var vw = viewport.clientWidth;
        var vh = viewport.clientHeight;
        state.fitScale = Math.min((vw * 0.85) / sw, (vh * 0.85) / sh, 1.5);
        reset();
      });
    }

    function close() { modal.classList.remove('show'); }

    modal.addEventListener('click', function (e) {
      if (e.target === modal) close();
    });
    viewport.addEventListener('click', function (e) {
      if (!e.target.closest('.mm-stage')) close();
    });
    closeBtn.addEventListener('click', close);

    viewport.addEventListener('wheel', function (e) {
      e.preventDefault();
      state.scale = Math.max(0.1, Math.min(10, state.scale * (e.deltaY > 0 ? 0.88 : 1.12)));
      apply();
    }, { passive: false });

    viewport.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      if (!e.target.closest('.mm-stage')) return;
      state.dragging = true;
      state.dragX = e.clientX;
      state.dragY = e.clientY;
      state.originX = state.x;
      state.originY = state.y;
      stage.classList.add('dragging');
    });
    window.addEventListener('mousemove', function (e) {
      if (!state.dragging) return;
      state.x = state.originX + (e.clientX - state.dragX);
      state.y = state.originY + (e.clientY - state.dragY);
      apply();
    });
    window.addEventListener('mouseup', function () {
      state.dragging = false;
      stage.classList.remove('dragging');
    });

    document.addEventListener('click', function (e) {
      var container = e.target.closest('.mermaid-container');
      if (!container || window.getSelection().toString().trim()) return;
      var svg = container.querySelector('svg');
      if (svg) open(svg.outerHTML);
    });
  }
})();
