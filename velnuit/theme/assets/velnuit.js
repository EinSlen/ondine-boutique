document.documentElement.classList.remove('no-js');

function initVelnuit(root = document) {
  root.querySelectorAll('[data-vn-capsule]').forEach(section => {
    if (section.dataset.ready) return;
    section.dataset.ready = 'true';
    const buttons = [...section.querySelectorAll('[data-vn-filter]')];
    const cards = [...section.querySelectorAll('[data-vn-category]')];
    const count = section.querySelector('[data-vn-count]');
    const noun = count.textContent.trim().replace(/^\d+\s*/, '');
    const applyFilter = filter => {
      let visible = 0;
      cards.forEach(card => {
        card.hidden = filter !== 'all' && card.dataset.vnCategory !== filter;
        if (!card.hidden) visible++;
      });
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.vnFilter === filter)));
      count.textContent = visible + ' ' + noun;
    };
    buttons.forEach(button => button.addEventListener('click', () => {
      const filter = button.dataset.vnFilter;
      applyFilter(filter);
      const url = new URL(window.location.href);
      url.hash = filter === 'all' ? 'capsule' : 'capsule-' + filter;
      window.history.replaceState(null, '', url);
    }));
    const applyHash = () => {
      const hash = window.location.hash;
      if (hash === '#capsule-femme') applyFilter('femme');
      else if (hash === '#capsule-homme') applyFilter('homme');
      else if (hash === '#capsule') applyFilter('all');
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
  });
}
initVelnuit();
document.addEventListener('shopify:section:load', event => initVelnuit(event.target));
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  document.querySelectorAll('[data-mobile-menu][open]').forEach(menu => {
    menu.open = false;
    menu.querySelector('summary').focus();
  });
});
document.addEventListener('click', event => {
  if (!event.target.closest('a')) return;
  const menu = event.target.closest('[data-mobile-menu]');
  if (menu) menu.open = false;
});
