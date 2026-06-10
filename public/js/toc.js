function generateTOC() {
  const content = document.getElementById('content');
  const toc = document.getElementById('toc');
  const headings = content.querySelectorAll('.content h1, .content h2, .content h3');

  if (headings.length === 0) {
    toc.innerHTML = '';
    return;
  }

  const tocEntries = [];

  headings.forEach((h, i) => {
    let id = h.id;
    if (!id) {
      id = 'h-' + i + '-' + Math.random().toString(36).slice(2, 6);
      h.id = id;
    }
    tocEntries.push({
      id,
      text: h.textContent,
      level: parseInt(h.tagName.charAt(1)),
      el: h,
    });
  });

  toc.innerHTML = tocEntries.map(e => {
    return `<a data-target="${e.id}" class="toc-h${e.level}">${e.text}</a>`;
  }).join('');

  toc.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.dataset.target;
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      closeTocIfMobile();
    });
  });

  setupTOCScrollSpy(tocEntries);
}

function closeTocIfMobile() {
  if (window.innerWidth <= 860) {
    document.getElementById('toc-panel').classList.remove('open');
    document.getElementById('overlay').classList.remove('show');
  }
}

function setupTOCScrollSpy(entries) {
  const tocLinks = document.querySelectorAll('#toc a');
  const main = document.getElementById('main');

  let ticking = false;
  main.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateActiveToc(entries, tocLinks, main);
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  updateActiveToc(entries, tocLinks, main);
}

function updateActiveToc(entries, tocLinks, mainEl) {
  const containerTop = mainEl.getBoundingClientRect().top;
  let activeIndex = -1;

  for (let i = entries.length - 1; i >= 0; i--) {
    const el = document.getElementById(entries[i].id);
    if (el && el.getBoundingClientRect().top <= containerTop + 100) {
      activeIndex = i;
      break;
    }
  }

  tocLinks.forEach((link, i) => {
    link.classList.toggle('active', i === activeIndex);
  });
}
