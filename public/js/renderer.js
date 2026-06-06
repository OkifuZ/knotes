function renderMarkdown(md, docPath, rootName, multiRoot) {
  md = preRenderMath(md);

  const renderer = new marked.Renderer();
  var rootPrefix = rootName ? '/docs/' + rootName + '/' : '/docs/';
  var linkHash = multiRoot && rootName ? rootName + '/' : '';

  renderer.link = function ({ href, title, text }) {
    if (href && !/^https?:\/\//.test(href) && !href.startsWith('#') && !href.startsWith('/')) {
      href = href.replace(/\.md$/, '');
      href = '#' + linkHash + href;
    }
    const t = title ? ` title="${escapeAttr(title)}"` : '';
    return `<a href="${href}"${t}>${text}</a>`;
  };

  renderer.image = function ({ href, title, text }) {
    if (href && !href.startsWith('http') && !href.startsWith('/') && !href.startsWith('data:')) {
      const base = docPath ? docPath.substring(docPath.indexOf('/') + 1).replace(/[^/]+$/, '') : '';
      href = rootPrefix + base + href;
    }
    const t = title ? ` title="${escapeAttr(title)}"` : '';
    return `<img src="${href}" alt="${text}"${t}>`;
  };

  renderer.code = function ({ text, lang }) {
    if (lang === 'mermaid') {
      return `<pre><code class="language-mermaid">${escapeHtml(text)}</code></pre>`;
    }
    const valid = lang && hljs.getLanguage(lang);
    if (valid) {
      const highlighted = hljs.highlight(text, { language: lang }).value;
      return `<pre><code class="hljs language-${lang}">${highlighted}</code></pre>`;
    }
    return `<pre><code>${escapeHtml(text)}</code></pre>`;
  };

  marked.setOptions({
    renderer,
    gfm: true,
    breaks: false,
  });

  const html = marked.parse(md);
  return `<div class="content">${html}</div>`;
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

  for (var key in blocks) {
    md = md.replace(key, blocks[key]);
  }

  return md;
}

function renderMermaidBlocks(root) {
  if (!root) return;
  const blocks = root.querySelectorAll('pre code.language-mermaid');
  const promises = [];
  blocks.forEach((block, i) => {
    const pre = block.parentElement;
    const code = block.textContent;
    const id = 'mermaid-' + Date.now() + '-' + i;
    promises.push(
      mermaid.render(id, code).then(({ svg }) => {
        const div = document.createElement('div');
        div.className = 'mermaid-container';
        div.dataset.mermaid = code;
        div.title = 'Click to enlarge';
        div.innerHTML = svg;
        pre.replaceWith(div);
      }).catch(err => {
        const div = document.createElement('div');
        div.className = 'mermaid-error';
        div.textContent = 'Mermaid: ' + err.message;
        pre.replaceWith(div);
      })
    );
  });
  return Promise.all(promises);
}

function reRenderAllMermaid() {
  document.querySelectorAll('.mermaid-container[data-mermaid]').forEach((container, i) => {
    const code = container.dataset.mermaid;
    const id = 'mermaid-rerender-' + Date.now() + '-' + i;
    mermaid.render(id, code).then(({ svg }) => {
      container.innerHTML = svg;
    }).catch(_e => {});
  });
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str) {
  return str.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
