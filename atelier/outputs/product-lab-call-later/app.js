'use strict';
const views={back:{file:'call-me-later-tee-back.png',label:"01 / DOS — SIMULATION D'IMPRESSION",alt:"Mockup généré : dos d'un tee bone avec téléphone rouge, cordon argenté noué et texte call me later."},worn:{file:'call-me-later-tee-worn.png',label:'02 / PORTÉ — MODÈLE FICTIF',alt:'Simulation générée : adulte fictif vu de dos portant le tee bone et un jean charbon, dessin call me later. dans le dos'},art:{file:'call-me-later-art.png',label:'03 / ARTWORK — SOURCE DE CONCEPT',alt:'Illustration originale isolée : téléphone rouge brillant, cordon argenté noué, lettrage noir call me later.'}};
let selected='back';
const mainImage=document.getElementById('main-image');
const dialog=document.getElementById('image-dialog');
function showView(key){if(!views[key])return;selected=key;const v=views[key];mainImage.src='assets/'+v.file;mainImage.alt=v.alt;document.getElementById('view-label').textContent=v.label;document.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===key)));}
document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>showView(b.dataset.view)));
document.getElementById('see-worn').addEventListener('click',()=>{showView('worn');document.querySelector('.gallery').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
document.getElementById('zoom').addEventListener('click',()=>{const img=document.getElementById('dialog-image');img.src=mainImage.src;img.alt=mainImage.alt;dialog.showModal();});
document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
