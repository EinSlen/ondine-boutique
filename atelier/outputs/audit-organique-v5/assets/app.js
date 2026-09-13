'use strict';
(() => {
  const data = window.AUDIT;
  const $ = selector => document.querySelector(selector);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const link = (url, title) => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(title)} ↗</a>`;
  const euro = value => new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(value);
  const key = 'ondine-neutral-audit-v5';
  let state = {preference:null, observations:[]};
  let storageOK = true;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null');
    if (saved && typeof saved === 'object') {
      if (typeof saved.preference === 'string') state.preference = saved.preference;
      if (Array.isArray(saved.observations)) state.observations = saved.observations.filter(row => row && typeof row === 'object' && typeof row.id === 'string');
    }
  } catch { storageOK = false; }
  function save() {
    try { localStorage.setItem(key,JSON.stringify(state)); storageOK = true; }
    catch { storageOK = false; }
    return storageOK;
  }
  const candidates = [
    {name:'Minor State',tone:'01 / ÉTAT D’ESPRIT',description:'Compact à l’oral, plus ouvert qu’une phrase de vêtement. Un univers éditorial et des silhouettes peuvent cohabiter.',caution:'Sens de « minor » à tester avec le public ; aucun statut de marque vérifié.'},
    {name:'Low Chapter',tone:'02 / CHAPITRES',description:'Une expression narrative, qui pourrait accompagner des collections successives sans imposer un motif unique.',caution:'Peut rester trop proche du registre mélancolique déjà rejeté ; à départager.'},
    {name:'Side Habit',tone:'03 / QUOTIDIEN',description:'Un ton plus direct, lié aux habitudes et aux vêtements portés tous les jours. Lisible en petit marquage.',caution:'Compréhension et prononciation en français à tester. Ni domaine ni droits vérifiés.'},
    {name:'Mild Noise',tone:'04 / CONTRASTE',description:'Une tension entre calme et énergie, à traduire en image ou en matière plutôt qu’en slogan systématique.',caution:'Usage exact déjà visible comme titre d’album. Exploration créative seulement, contrôle renforcé nécessaire.'},
    {name:'Other Routine',tone:'05 / AUTRE QUOTIDIEN',description:'Laisse de la place aux tenues, aux habitudes et à un récit personnel. Pas attaché à un accessoire précis.',caution:'Plus long, mots courants ; risque de faible distinction à examiner.'},
    {name:'Quiet District',tone:'06 / TERRITOIRE',description:'Un territoire urbain imaginaire assumé, sans revendiquer une fausse ville d’origine.',caution:'Peut sonner générique ou trop « calme » pour ta direction ; pas de disponibilité établie.'}
  ];
  if (!candidates.some(item => item.name === state.preference)) state.preference = null;
  function renderNames() {
    $('#name-candidates').innerHTML = candidates.map(item => `<article class="candidate${state.preference === item.name ? ' selected' : ''}"><span class="label">${item.tone}</span><div class="wordmark">${item.name}</div><p>${item.description}</p><p class="caution">${item.caution}</p><button type="button" data-name="${item.name}" aria-pressed="${state.preference === item.name}">${state.preference === item.name ? 'Piste notée — retirer' : 'Noter cette piste ↗'}</button></article>`).join('');
    $('#name-status').textContent = (state.preference ? `Préférence de travail : ${state.preference}. Aucun changement appliqué à la boutique.` : 'Aucune piste notée.') + (storageOK ? ' Note conservée localement.' : ' Stockage indisponible : exporte tes notes avant de fermer.');
  }
  $('#name-candidates').addEventListener('click',event => {
    const button = event.target.closest('[data-name]');
    if (!button) return;
    state.preference = state.preference === button.dataset.name ? null : button.dataset.name;
    save(); renderNames();
    [...document.querySelectorAll('[data-name]')].find(item => item.dataset.name === button.dataset.name)?.focus({preventScroll:true});
  });
  renderNames();
  $('#benchmarks').innerHTML = data.benchmarks.map(item => `<article class="benchmark"><div class="benchmark-head"><h3>${escape(item.name)}</h3><span>${escape(item.country)}</span></div><span class="badge">${escape(item.type)}</span><h4>${escape(item.item)}</h4><p>${escape(item.detail)}</p><p class="limit">${escape(item.limit)}</p><p class="idea"><strong>Idée à tester.</strong> ${escape(item.idea)}</p><div class="links">${link(item.url,'Produit / marque')}${link(item.proof,'Source du constat')}${item.name === 'Cold Culture' ? link('https://coldcultureworldwide.com/blogs/wip/issue-03','Coulisses WIP') : ''}</div></article>`).join('');
  $('#products').innerHTML = data.products.map(item => `<article class="product-card" id="product-${item.id}"><figure class="product-image"><img src="assets/${item.image}" alt="Ancienne maquette numérique V4 : ${escape(item.old)}, marquage abandonné" width="1024" height="1024" loading="lazy"><figcaption>CONCEPT NUMÉRIQUE V4 · ancien nom abandonné<br>Aucun échantillon validé. Image d’archive, pas nouveau design.</figcaption></figure><div class="product-copy"><span class="eyebrow">${escape(item.phase)}</span><h3>${escape(item.name)}</h3><p class="target-price">${escape(item.color)} · ${euro(item.price)} — prix cible non validé</p><p class="hook">${escape(item.hook)}</p><p>${escape(item.reason)}</p><p><strong>À refaire.</strong> ${escape(item.change)}</p><details><summary>Spécification cible & route de prototype</summary><p>${escape(item.spec)}</p><p>${escape(item.route)}</p></details></div></article>`).join('');
  $('#reserves').innerHTML = data.reserves.map(row => `<article class="reserve-row"><strong>${escape(row[0])}</strong><span>${escape(row[1])}</span><p>${escape(row[2])}</p></article>`).join('');
  $('#suppliers').innerHTML = data.suppliers.map(item => `<article class="supplier"><div><h3>${link(item.url,item.name)}</h3><span class="kind">${escape(item.kind)}</span></div><div><p class="price">${escape(item.price)}</p><p>${escape(item.detail)}</p></div><div class="limit"><small>À NE PAS CONFONDRE</small><p>${escape(item.limit)}</p></div></article>`).join('');
  function costs() {
    const inputs = [...$('#cost-form').querySelectorAll('input')];
    const valid = inputs.every(input => input.value !== '' && input.checkValidity() && Number.isFinite(input.valueAsNumber));
    $('#cost-result').textContent = valid ? euro(inputs[0].valueAsNumber - inputs[1].valueAsNumber - inputs[2].valueAsNumber - inputs[3].valueAsNumber) : 'À compléter';
  }
  $('#cost-form').addEventListener('input',costs);
  $('#cost-form').addEventListener('submit',event => event.preventDefault());
  costs();
  function renderScripts(filter = 'all') {
    $('#scripts').innerHTML = data.scripts.filter(row => filter === 'all' || row[1] === filter).map(row => `<article class="script"><header><span>${row[0]} / ${row[1]}</span><span>${escape(row[2])}</span></header><h3>${escape(row[3])}</h3><p>${escape(row[4])}</p><p class="requirement"><strong>Condition réelle :</strong> ${escape(row[5])}</p></article>`).join('');
  }
  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click',() => {
    document.querySelectorAll('[data-filter]').forEach(other => { other.classList.toggle('active',other === button); other.setAttribute('aria-pressed',String(other === button)); });
    renderScripts(button.dataset.filter);
  }));
  renderScripts();
  const form = $('#test-form');
  const now = new Date();
  form.elements.date.value = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const numeric = ['views','visits','intents','orders'];
  const channels = {owned:'Compte marque — non sponsorisé',gifted:'Créateur — produit offert',affiliate:'Affiliation',paid:'Publicité — hors plan'};
  const count = value => Number.isSafeInteger(value) && value >= 0 ? value.toLocaleString('fr-FR') : '—';
  const percentage = (numerator, denominator) => Number.isSafeInteger(numerator) && numerator >= 0 && Number.isSafeInteger(denominator) && denominator > 0 ? `${(numerator / denominator * 100).toLocaleString('fr-FR',{maximumFractionDigits:2})} %` : 'non calculable';
  function renderObservations() {
    $('#observations').innerHTML = state.observations.length ? state.observations.map(row => `<article class="observation"><div class="observation-head"><h4>${escape(row.code)}</h4><button type="button" data-remove="${escape(row.id)}" aria-label="Retirer l’observation ${escape(row.code)}">Retirer</button></div><p class="observation-meta">${escape(row.date)} · ${escape(channels[row.channel] || 'Canal non renseigné')} · ${escape(row.window)}</p><div class="observation-metrics"><span>Vues<strong>${count(row.views)}</strong></span><span>Visites suivies<strong>${count(row.visits)}</strong></span><span>Intentions<strong>${count(row.intents)}</strong></span><span>Commandes attribuées<strong>${count(row.orders)}</strong></span></div><p class="rates">Visites / vues : ${percentage(row.visits,row.views)} · Commandes / visites : ${percentage(row.orders,row.visits)}. Ratios descriptifs uniquement : sources, fenêtre et périmètres doivent être comparables.</p>${row.note ? `<p>${escape(row.note)}</p>` : ''}</article>`).join('') : '<p class="empty">Aucune observation saisie. Les résultats de la marque ne sont pas encore mesurés.</p>';
  }
  form.addEventListener('submit',event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const fields = new FormData(form);
    const row = {id:globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`};
    for (const field of ['code','date','channel','window','note']) row[field] = String(fields.get(field) || '').trim();
    if (!row.code) { $('#test-status').textContent = 'Indique un code de publication.'; return; }
    for (const field of numeric) {
      const raw = fields.get(field);
      row[field] = raw === '' ? null : Number(raw);
      if (row[field] !== null && (!Number.isSafeInteger(row[field]) || row[field] < 0)) { $('#test-status').textContent = 'Les mesures doivent être des entiers positifs ou zéro, ou rester vides.'; return; }
    }
    state.observations.unshift(row);
    save(); renderObservations();
    $('#test-status').textContent = storageOK ? 'Observation enregistrée dans ce navigateur.' : 'Observation gardée en mémoire, mais stockage indisponible. Exporte les notes.';
    const date = form.elements.date.value;
    form.reset(); form.elements.date.value = date;
  });
  $('#observations').addEventListener('click',event => {
    const button = event.target.closest('[data-remove]');
    if (!button) return;
    if (!confirm('Retirer cette observation du journal local ? Une copie exportée n’est pas modifiée.')) return;
    state.observations = state.observations.filter(row => row.id !== button.dataset.remove);
    save(); renderObservations();
    $('#test-status').textContent = storageOK ? 'Observation retirée du journal local.' : 'Retrait en mémoire uniquement : stockage indisponible.';
  });
  $('#export').addEventListener('click',() => {
    const payload = {schema:'ondine-audit-local-v5',exportedAt:new Date().toISOString(),notice:'Préférence non appliquée. Données saisies manuellement, non vérifiées. Aucun client ni e-mail à inclure.',...state};
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'audit-organique-notes.json'; document.body.append(anchor); anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url),1000);
    $('#test-status').textContent = 'Export JSON préparé pour téléchargement.';
  });
  renderObservations();
  if (!storageOK) $('#test-status').textContent = 'Stockage local indisponible ; les notes peuvent être exportées pendant cette visite.';
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        document.querySelectorAll('.sidebar nav a').forEach(a => a.classList.toggle('active',a.hash === `#${entry.target.id}`));
      }
    },{rootMargin:'-10% 0px -70% 0px'});
    document.querySelectorAll('main>section[id]').forEach(section => observer.observe(section));
  }
})();
