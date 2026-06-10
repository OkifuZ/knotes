(function () {
  var content = document.getElementById('content');
  var sidebar = document.getElementById('sidebar');
  var tocPanel = document.getElementById('toc-panel');
  var menuToggle = document.getElementById('menu-toggle');
  var tocToggle = document.getElementById('toc-toggle');
  var overlay = document.getElementById('overlay');
  var themeToggle = document.getElementById('theme-toggle');
  var hljsTheme = document.getElementById('hljs-theme');
  var resizeHandle = document.getElementById('resize-handle');
  var app = document.getElementById('app');

  var rootNames = [];
  var currentRoot = '';
  var rootData = null;

  var MERMAID_THEMES = {
    dark: {
      hljs: '/lib/@highlightjs/cdn-assets/styles/monokai-sublime.min.css',
      variables: {
        background: '#1e1f24',
        primaryColor: '#25262c', primaryTextColor: '#c0c4cc', primaryBorderColor: '#3a3b40',
        lineColor: '#5a5b62', secondaryColor: '#1e1f24', tertiaryColor: '#1e1f24',
        mainBkg: '#25262c', nodeBorder: '#3a3b40', clusterBkg: '#1e1f24',
        clusterBorder: '#3a3b40', titleColor: '#c0c4cc', edgeLabelBackground: '#1e1f24',
        cScale0: '#4a3920', cScale1: '#2d3f49', cScale2: '#2f4438', cScale3: '#343640',
        cScale4: '#6d3c3c', cScale5: '#4b4263', cScale6: '#40505a', cScale7: '#4a4f3b',
        cScale8: '#574832', cScale9: '#394852', cScale10: '#3d4b42', cScale11: '#4d3f46',
        cScaleInv0: '#d8c8a8', cScaleInv1: '#b6c8d2', cScaleInv2: '#b9cdbf', cScaleInv3: '#c0c4cc',
        cScaleInv4: '#e0b5ae', cScaleInv5: '#c9bddc', cScaleInv6: '#bdccd2', cScaleInv7: '#ccd0b6',
        cScaleInv8: '#dcc9ab', cScaleInv9: '#becbd4', cScaleInv10: '#c0d0c5', cScaleInv11: '#d2c0c8',
        cScaleLabel0: '#f0eadf', cScaleLabel1: '#f0eadf', cScaleLabel2: '#f0eadf', cScaleLabel3: '#f0eadf',
        cScaleLabel4: '#f0eadf', cScaleLabel5: '#f0eadf', cScaleLabel6: '#f0eadf', cScaleLabel7: '#f0eadf',
        cScaleLabel8: '#f0eadf', cScaleLabel9: '#f0eadf', cScaleLabel10: '#f0eadf', cScaleLabel11: '#f0eadf',
        git0: '#4a3920', gitBranchLabel0: '#f0eadf',
      }
    },
    light: {
      hljs: '/lib/@highlightjs/cdn-assets/styles/arta.min.css',
      variables: {
        background: '#f4f1ea',
        primaryColor: '#eae5d9', primaryTextColor: '#3c3832', primaryBorderColor: '#c8c0b4',
        lineColor: '#9a9388', secondaryColor: '#e2dccf', tertiaryColor: '#e2dccf',
        mainBkg: '#eae5d9', nodeBorder: '#c8c0b4', clusterBkg: '#e2dccf',
        clusterBorder: '#c8c0b4', titleColor: '#3c3832', edgeLabelBackground: '#f4f1ea',
        cScale0: '#eadbc2', cScale1: '#d7e2e4', cScale2: '#dce6d6', cScale3: '#e6dfd2',
        cScale4: '#ead6d2', cScale5: '#ddd8e6', cScale6: '#d6e1e5', cScale7: '#e3e5d4',
        cScale8: '#e7d8c4', cScale9: '#dbe3e7', cScale10: '#dce7dc', cScale11: '#e5d8dd',
        cScaleInv0: '#8b6b3e', cScaleInv1: '#4f6d78', cScaleInv2: '#5f7657', cScaleInv3: '#746b61',
        cScaleInv4: '#8b5a54', cScaleInv5: '#6d6381', cScaleInv6: '#5d737d', cScaleInv7: '#74794d',
        cScaleInv8: '#8a6c47', cScaleInv9: '#5f7280', cScaleInv10: '#647c67', cScaleInv11: '#806774',
        cScaleLabel0: '#3c3832', cScaleLabel1: '#3c3832', cScaleLabel2: '#3c3832', cScaleLabel3: '#3c3832',
        cScaleLabel4: '#3c3832', cScaleLabel5: '#3c3832', cScaleLabel6: '#3c3832', cScaleLabel7: '#3c3832',
        cScaleLabel8: '#3c3832', cScaleLabel9: '#3c3832', cScaleLabel10: '#3c3832', cScaleLabel11: '#3c3832',
        git0: '#eadbc2', gitBranchLabel0: '#3c3832',
      }
    }
  };

  var savedTheme = localStorage.getItem('doc-reader-theme') || 'light';
  applyTheme(savedTheme);

  window.addEventListener('hashchange', navigate);
  initRoots().then(navigate);

  async function initRoots() {
    try {
      var resp = await fetch('/api/structure');
      rootData = await resp.json();
      rootNames = rootData.map(function (r) { return r.name; });
      if (rootNames.length === 1) currentRoot = rootNames[0];
    } catch (_e) { rootNames = []; rootData = []; }
  }

  themeToggle.addEventListener('click', function () {
    var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('doc-reader-theme', next);
  });

  var wbtns = document.querySelectorAll('.wbtn');
  wbtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var w = btn.dataset.width;
      wbtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      app.style.setProperty('--content-w', w === '0' ? '2000px' : w + 'px');
      localStorage.setItem('doc-reader-width', w);
    });
  });
  (function initWidth() {
    var saved = localStorage.getItem('doc-reader-width') || '1100';
    app.style.setProperty('--content-w', saved === '0' ? 'none' : saved + 'px');
    wbtns.forEach(function (b) {
      b.classList.toggle('active', b.dataset.width === saved);
    });
  })();

  menuToggle.addEventListener('click', function () {
    var open = sidebar.classList.toggle('open');
    overlay.classList.toggle('show', open);
    tocPanel.classList.remove('open');
  });

  tocToggle.addEventListener('click', function () {
    var open = tocPanel.classList.toggle('open');
    overlay.classList.toggle('show', open);
    sidebar.classList.remove('open');
  });

  overlay.addEventListener('click', closeAllPanels);

  initMermaidModal();

  document.getElementById('sidebar-tree').addEventListener('click', function (e) {
    if (e.target.tagName === 'A' && window.innerWidth <= 860) closeAllPanels();
  });

  function closeAllPanels() {
    sidebar.classList.remove('open');
    tocPanel.classList.remove('open');
    overlay.classList.remove('show');
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    var t = MERMAID_THEMES[theme] || MERMAID_THEMES.light;
    mermaid.initialize({
      theme: 'base',
      fontFamily: '"PingFang SC","Microsoft YaHei",sans-serif',
      fontSize: 16,
      themeVariables: t.variables
    });
    hljsTheme.href = t.hljs;
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
      var resp = await fetch('/docs/' + docPath);
      if (!resp.ok) throw new Error('Not found');
      var md = await resp.text();
      var html = renderMarkdown(md, docPath, currentRoot, rootNames.length > 1);
      content.innerHTML = html;

      await renderMermaidBlocks(content);
      generateTOC();
      if (rootData) {
        loadSidebar(rootData);
        rootData = null;
      } else {
        loadSidebar();
      }
    } catch (e) {
      console.error(e);
      var errMsg = e && e.message ? e.message : (e + '');
      if (parsed.sub === 'index') {
        var first = await findFirstDoc(parsed.root);
        if (first) {
          var sub = first.replace(/\.md$/, '');
          location.hash = rootNames.length > 1 ? '#' + parsed.root + '/' + sub : '#' + sub;
          return;
        }
      }
      content.innerHTML = ''
        + '<div class="empty-state">'
        + '<h2>Document not found</h2>'
        + '<p><code>' + docPath + '</code> could not be loaded.</p>'
        + '<p style="margin-top:12px;font-size:12px;color:var(--text-muted)">' + errMsg + '</p>'
        + '</div>';
      if (rootData) {
        loadSidebar(rootData);
        rootData = null;
      } else {
        loadSidebar();
      }
    }
  }

  async function findFirstDoc(rootName) {
    try {
      var resp = await fetch('/api/structure');
      var data = await resp.json();
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
    var tocHandle = document.getElementById('toc-resize-handle');
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
        app.classList.add('dragging');
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
      app.classList.remove('dragging');
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
