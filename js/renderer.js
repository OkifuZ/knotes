var ctx = { rootPrefix: '', linkHash: '', docPath: '', rootName: '', multiRoot: false };

marked.use({ gfm: true, breaks: false });

marked.use({
  renderer: {
    link: function ({ href, title, text }) {
      if (href && !/^https?:\/\//.test(href) && !href.startsWith('#') && !href.startsWith('/')) {
        href = href.replace(/\.md$/, '');
        href = '#' + ctx.linkHash + href;
      }
      var t = title ? ' title="' + escapeHtml(title) + '"' : '';
      return '<a href="' + href + '"' + t + '>' + text + '</a>';
    },
    image: function ({ href, title, text }) {
      if (href && !href.startsWith('http') && !href.startsWith('/') && !href.startsWith('data:')) {
        var relDoc = ctx.docPath || '';
        if (ctx.multiRoot && ctx.rootName && relDoc.indexOf(ctx.rootName + '/') === 0) {
          relDoc = relDoc.substring(ctx.rootName.length + 1);
        }
        var base = relDoc ? relDoc.replace(/[^/]+$/, '') : '';
        href = ctx.rootPrefix + base + href;
      }
      var t = title ? ' title="' + escapeHtml(title) + '"' : '';
      return '<img src="' + href + '" alt="' + text + '"' + t + '>';
    },
    code: function ({ text, lang }) {
      if (lang === 'mermaid') return '<pre><code class="language-mermaid">' + escapeHtml(text) + '</code></pre>';
      if (lang && hljs.getLanguage(lang)) {
        return '<pre><code class="hljs language-' + lang + '">' + hljs.highlight(text, { language: lang }).value + '</code></pre>';
      }
      return '<pre><code>' + escapeHtml(text) + '</code></pre>';
    }
  }
});

function renderMarkdown(md, docPath, rootName, multiRoot) {
  ctx.rootPrefix = multiRoot && rootName ? 'docs/' + rootName + '/' : 'docs/';
  ctx.linkHash = multiRoot && rootName ? rootName + '/' : '';
  ctx.docPath = docPath || '';
  ctx.rootName = rootName || '';
  ctx.multiRoot = !!multiRoot;
  md = preRenderMath(md);
  return '<div class="content">' + marked.parse(md) + '</div>';
}

function preRenderMath(md) {
  var uid = (Math.random().toString(36) + Date.now().toString(36)).slice(2, 10);
  var blocks = {};

  md = md.replace(/```[\s\S]*?```/g, function (match) {
    var key = '\u0000FENCE' + uid + Object.keys(blocks).length + '\u0000';
    blocks[key] = match;
    return key;
  });
  md = md.replace(/`[^`]+`/g, function (match) {
    var key = '\u0000CODE' + uid + Object.keys(blocks).length + '\u0000';
    blocks[key] = match;
    return key;
  });

  md = md.replace(/\$\$([\s\S]*?)\$\$/g, function (_, tex) {
    try { return '<span class="katex-block">' + katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false }) + '</span>'; }
    catch (e) { return _; }
  });

  md = md.replace(/\$([^\s$](?:[^$]*[^\s$])?)\$/g, function (_, tex) {
    if (/^\d+(\.\d+)?$/.test(tex)) return _;
    try { return katex.renderToString(tex, { displayMode: false, throwOnError: false }); }
    catch (e) { return _; }
  });

  Object.keys(blocks).forEach(function (key) {
    md = md.replace(key, blocks[key]);
  });
  return md;
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderMermaidBlocks(root) {
  if (!root) return;
  var blocks = root.querySelectorAll('pre code.language-mermaid');
  var promises = [];
  blocks.forEach(function (block, i) {
    var pre = block.parentElement;
    var code = block.textContent;
    var id = 'mermaid-' + Date.now() + '-' + i;
    promises.push(
      mermaid.render(id, code).then(function (result) {
        var div = document.createElement('div');
        div.className = 'mermaid-container';
        div.dataset.mermaid = code;
        div.title = 'Click to enlarge';
        div.innerHTML = result.svg;
        pre.replaceWith(div);
      }).catch(function (err) {
        var div = document.createElement('div');
        div.className = 'mermaid-error';
        div.textContent = 'Mermaid: ' + err.message;
        pre.replaceWith(div);
      })
    );
  });
  return Promise.all(promises);
}

function reRenderAllMermaid() {
  document.querySelectorAll('.mermaid-container[data-mermaid]').forEach(function (container, i) {
    var code = container.dataset.mermaid;
    var id = 'mermaid-rerender-' + Date.now() + '-' + i;
    mermaid.render(id, code).then(function (result) {
      container.innerHTML = result.svg;
    }).catch(function () {});
  });
}
