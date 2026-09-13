(() => {
  'use strict';
  const container = document.getElementById('pieces');
  const viewer = document.getElementById('viewer');
  const viewerImage = document.getElementById('viewer-image');
  const viewerTitle = document.getElementById('viewer-title');
  let lastTrigger = null;
  const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const external = (text, url, className) => {
    const a = el('a', className, text);
    a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer';
    return a;
  };
  for (const piece of window.capsulePieces || []) {
    const article = el('article', 'piece');
    article.id = `piece-${piece.id}`;
    const picture = el('div', 'picture');
    const open = el('button', 'open-image');
    open.type = 'button';
    open.setAttribute('aria-label', `Agrandir ${piece.name}`);
    const img = el('img');
    img.src = `assets/${piece.file}`; img.alt = piece.alt;
    img.width = 1254; img.height = 1254;
    img.loading = Number(piece.id) < 3 ? 'eager' : 'lazy';
    img.decoding = 'async';
    open.append(img);
    const tag = el('div', 'image-tag');
    tag.append(el('span', '', piece.id), el('span', '', 'CONCEPT'));
    const expand = el('span', 'expand', '↗'); expand.setAttribute('aria-hidden', 'true');
    picture.append(open, tag, expand);
    const title = el('div', 'piece-title');
    const h2 = el('h2', '', piece.name); h2.id = `title-${piece.id}`;
    article.setAttribute('aria-labelledby', h2.id);
    title.append(h2, el('div', 'type', piece.type));
    const palette = el('div', 'palette');
    for (const color of piece.swatches) {
      const dot = el('span', 'swatch'); dot.style.backgroundColor = color;
      dot.setAttribute('aria-hidden', 'true'); palette.append(dot);
    }
    palette.append(el('span', '', piece.color));
    const details = el('details', 'design-details');
    const summary = el('summary', '', 'Dessin, référence & fabrication');
    const body = el('div', 'detail-body');
    body.append(el('h3', '', 'LE DESSIN'), el('p', '', piece.design));
    if (piece.source) {
      body.append(el('h3', '', 'LE REPÈRE DANS L’AUDIT'));
      const reference = el('div', 'reference');
      const photo = el('div', 'reference-photo');
      const refImage = el('img');
      refImage.alt = `Référence de l’audit, pas notre produit : ${piece.source.brand}, ${piece.source.name}`;
      refImage.width = 116; refImage.height = 145; refImage.loading = 'lazy';
      refImage.addEventListener('error', () => { photo.replaceChildren(el('small', '', 'Photo distante indisponible. La fiche officielle reste accessible.')); });
      photo.append(refImage);
      const caption = el('div');
      caption.append(el('p', '', `${piece.source.brand} · ${piece.source.name}`), external('Voir la fiche officielle ↗', piece.source.url), el('small', '', 'Photo de la marque · comparaison uniquement'));
      reference.append(photo, caption);
      body.append(reference, el('p', 'detail-note', piece.source.note));
      details.addEventListener('toggle', () => {
        if (details.open && !refImage.hasAttribute('src')) refImage.src = piece.source.image;
      });
    }
    body.append(el('h3', '', 'FABRICATION ENVISAGÉE'));
    if (piece.supplier) {
      body.append(external(`${piece.supplier.name} ↗`, piece.supplier.url, 'supplier-link'), el('p', '', piece.supplier.note));
    } else {
      body.append(el('p', '', 'Support fournisseur à identifier.'));
    }
    body.append(el('p', 'detail-note', piece.limits));
    details.append(summary, body);
    article.append(picture, title, palette, el('p', 'piece-copy', piece.description), details);
    container.append(article);
    open.addEventListener('click', () => {
      if (typeof viewer.showModal !== 'function') { window.open(img.src, '_blank', 'noopener'); return; }
      lastTrigger = open;
      viewerImage.src = img.src; viewerImage.alt = piece.alt;
      viewerTitle.textContent = `${piece.id} / ${piece.name}`;
      viewer.showModal(); document.body.classList.add('dialog-open');
      document.getElementById('close-viewer').focus();
    });
  }
  document.getElementById('close-viewer').addEventListener('click', () => viewer.close());
  viewer.addEventListener('click', event => {
    if (event.target !== viewer) return;
    const r = viewer.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) viewer.close();
  });
  viewer.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    if (lastTrigger) lastTrigger.focus();
  });
})();
