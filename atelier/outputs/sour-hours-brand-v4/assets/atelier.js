(() => {
  const products=window.SOUR_PRODUCTS;
  document.getElementById('atelier-products').innerHTML=products.map(p=>`<article class="atelier-product"><img src="assets/${p.id}.png" alt="Concept ${p.name}" loading="lazy"><div><span class="eyebrow">${p.code} / ${p.family}</span><h3>${p.name}</h3><p>${p.story}</p><p class="caption">${p.color} · Prix public cible ${p.price} €</p><ul>${p.specs.map(s=>`<li>${s}</li>`).join('')}</ul></div><div><span class="eyebrow">À FAIRE CONFIRMER</span><p>${p.production}</p><a class="note-link" href="production/BRIEFS-PRODUITS.md">Brief de développement ↗</a></div></article>`).join('');
  const form=document.getElementById('cost-form');
  form.addEventListener('submit',event=>event.preventDefault());
  form.addEventListener('input',()=>{const get=id=>Math.max(0,Number(document.getElementById(id).value)||0);const result=get('cost-revenue')-get('cost-product')-get('cost-shipping')-get('cost-other');document.getElementById('cost-result').textContent=new Intl.NumberFormat('fr-FR',{style:'currency',currency:'EUR'}).format(result);});
})();
