document.documentElement.classList.remove('no-js');

function initVelnuit(root = document) {
  root.querySelectorAll('[data-vn-capsule]').forEach(section => {
    if (section.dataset.ready) return;
    section.dataset.ready = 'true';
    const buttons = [...section.querySelectorAll('[data-vn-filter]')];
    const cards = [...section.querySelectorAll('[data-vn-category]')];
    const count = section.querySelector('[data-vn-count]');
    const noun = count.textContent.trim().replace(/^\d+\s*/, '');
    buttons.forEach(button => button.addEventListener('click', () => {
      const filter = button.dataset.vnFilter;
      let visible = 0;
      cards.forEach(card => {
        card.hidden = filter !== 'all' && card.dataset.vnCategory !== filter;
        if (!card.hidden) visible++;
      });
      buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      count.textContent = visible + ' ' + noun;
    }));
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
