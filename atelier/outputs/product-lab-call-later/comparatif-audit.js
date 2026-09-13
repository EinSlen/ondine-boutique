const references = [
  {n:'01',brand:'Nude Project',name:'Juicy Cherry Tee White',label:'Pop sculptural',url:'https://nude-project.com/products/juicy-cherry-tee-white',image:'https://nude-project.com/cdn/shop/files/JUICY_CHERRY_TEE_WHITE_back.webp?v=1786017707&width=900',
    observationTitle:'Une image transformée, pas seulement un objet.',observation:'Deux cerises sont transformées en cœurs rouges brillants. Les tiges allongent la composition. Le nom et la petite ligne manuscrite forment une signature plus compacte sous le dessin.',
    gapTitle:'Le téléphone reste très littéral.',gap:'Notre combiné reprend le rouge et le brillant, mais conserve une forme familière. Le slogan noir, épais et arrondi prend davantage de place ; il installe un ton humoristique différent.',
    nextTitle:'Travailler le motif et sa signature ensemble.',next:'Si ce repère est le bon, chercher une silhouette figurative transformée et une composition typographique plus précise. Ne pas simplement remplacer les cerises par un autre objet rouge.'},
  {n:'02',brand:'Cold Culture',name:'Dogs Tee White',label:'Contraste photographique',url:'https://coldcultureworldwide.com/products/dogs-tee-white',image:'https://coldcultureworldwide.com/cdn/shop/files/dogs-tee-white-7647022.jpg?v=1774297093&width=900',
    observationTitle:'Des silhouettes brutes, une signature étirée.',observation:'Les chiens restent reconnaissables avec très peu de valeurs : noir et blanc tranchés, formes irrégulières, sujet vertical. La signature large et inclinée ancre le bas du visuel.',
    gapTitle:'Notre rendu est lisse et multicolore.',gap:'Le téléphone détaillé en volume, ses reflets et son cordon n’ont ni la brutalité du contraste ni le rythme des silhouettes. Le lettrage rond change également l’énergie de la composition.',
    nextTitle:'Repartir d’une image, puis la réduire.',next:'Pour suivre ce langage, développer une image figurative originale, la travailler en masses contrastées et composer une vraie signature. Ce n’est pas une version noire du téléphone.'},
  {n:'03',brand:'Wasted Paris',name:'T-Shirt Howl',label:'Imprimé vintage patiné',url:'https://wasted.fr/products/howl-t-shirt-faded-black',image:'https://wasted.fr/cdn/shop/files/1_62b87812-3356-4e0c-82d3-cbf91fc947a1.jpg?v=1786359852&width=900',
    observationTitle:'Une scène expressive absorbée par le noir.',observation:'Le loup, le halo bleu et les détails clairs forment une image expressive à bords irréguliers. L’impression paraît intégrée au tee noir usé, sans grand rectangle photographique.',
    gapTitle:'Le téléphone évoque une illustration neuve.',gap:'Les contours propres, les reflets nets et le fond écru ne reprennent pas ce traitement. Ajouter une texture vieillie à notre slogan ne suffirait pas à retrouver ce type de composition.',
    nextTitle:'Dessiner pour le tissu sombre.',next:'Ce repère demande une illustration originale patinée dont les ombres se fondent dans le vêtement. La fiche archivée dans l’audit décrit une impression discharge : une simulation DTG ne doit pas être annoncée comme la même finition.'},
  {n:'04',brand:'Jaded London',name:'Make Noise Spliced Cropped T-Shirt',label:'Photo + construction',url:'https://jadedldn.com/en-fr/products/make-noise-spliced-cropped-t-shirt',image:'https://jadedldn.com/cdn/shop/files/24-03-26FLATS103.jpg?v=1774542237&width=900',
    observationTitle:'Le vêtement fait partie du graphisme.',observation:'Le bleu pâle lavé et l’image sombre sont associés à une construction en panneaux et à des coutures à bords bruts. L’effet ne vient pas seulement du fichier imprimé. Repère britannique, hors UE.',
    gapTitle:'Notre tee est un support classique.',gap:'Le téléphone est posé sur un tee écru sans ce travail de panneaux ni ces bords. Une belle photographie produit ne crée pas les détails de confection absents du support.',
    nextTitle:'Séparer décor et confection.',next:'On peut travailler une image photographique originale. Pour obtenir aussi cette construction, il faut un produit fournisseur réellement comparable ; ne pas inventer les coutures dans un mockup.'},
  {n:'05',brand:'Nude Project',name:'Beast Zip-Up Hoodie Ash',label:'Volume + grand lettrage',url:'https://nude-project.com/products/beast-zip-up-hoodie-ash',image:'https://nude-project.com/cdn/shop/files/BEAST_ZIP-UP_HOODIE_ASH_back_8551e636-8765-48f6-aaa6-e9fce22810f6_back.webp?v=1786012091&width=900',
    observationTitle:'Le nom épouse le volume du dos.',observation:'Un grand lettrage arqué, gris sur gris, avec un relief apparent. Les manches et le corps ample sont essentiels à la silhouette ; l’intérêt ne dépend pas d’un motif figuratif.',
    gapTitle:'Nous n’avons pas cette identité installée.',gap:'Le slogan de notre tee raconte une situation, alors que ce hoodie met la marque elle-même au premier plan. Remplacer le nom par un autre n’en transfère ni la notoriété ni la demande.',
    nextTitle:'Une pièce de marque, après l’identité.',next:'À retenir pour le rapport entre lettrage, tonalité et coupe. Le relief et le support doivent être confirmés chez le fournisseur ; un effet dessiné n’est pas une broderie réelle.'},
  {n:'06',brand:'Scuffers',name:'Raw Blue Hoodie',label:'Tonalité + matière',url:'https://scuffers.com/products/raw-blue-hoodie',image:'https://scuffers.com/cdn/shop/files/RAW_BLUE_HOODIE_1.jpg?height=1200&v=1756902308&width=900',
    observationTitle:'Une pièce calme, mais pas sans travail.',observation:'Le bleu assourdi, le volume et le marquage ton sur ton à bords irréguliers produisent une allure cohérente. L’image spectaculaire n’est pas le seul langage présent dans l’audit.',
    gapTitle:'Notre contraste ne cherche pas le même effet.',gap:'Le rouge brillant sur écru attire l’œil vers l’illustration. Sur ce hoodie, la couleur, la texture et la silhouette font davantage le travail ; les comparer seulement par le dessin serait trompeur.',
    nextTitle:'Prévoir aussi des pièces sans image forte.',next:'Si cette allure compte pour toi, construire des compléments plus sobres autour de vrais supports disponibles, avec une couleur et un placement maîtrisés, sans mettre un grand imprimé sur chaque pièce.'}
];
const grid=document.querySelector('#reference-grid');
for(const ref of references){
  const button=document.createElement('button');button.type='button';button.className='ref-card';button.dataset.number=ref.n;button.setAttribute('aria-pressed','false');button.setAttribute('aria-label',`${ref.n} — comparer ${ref.brand}, ${ref.name}`);
  const number=document.createElement('span');number.className='number';number.textContent=ref.n;
  const img=document.createElement('img');img.src=ref.image;img.alt=`${ref.brand} — ${ref.name}, photo officielle`;img.width=300;img.height=350;
  const label=document.createElement('span');label.className='label';const brand=document.createElement('strong');brand.textContent=ref.brand;label.append(brand,document.createTextNode(ref.label));
  button.append(number,img,label);button.addEventListener('click',()=>{select(ref);document.querySelector('#comparison').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});grid.append(button);
}
function select(ref){
  for(const button of grid.children)button.setAttribute('aria-pressed',String(button.dataset.number===ref.n));
  document.querySelector('#comparison-title').textContent=`${ref.n} / ${ref.brand}`;
  const img=document.querySelector('#reference-image');document.querySelector('#image-error').hidden=true;img.hidden=false;img.src=ref.image;img.alt=`${ref.brand} — ${ref.name}, photographie officielle utilisée comme référence d’analyse`;
  document.querySelector('#reference-image-link').href=ref.image;document.querySelector('#reference-source').href=ref.url;document.querySelector('#reference-name').textContent=ref.name;
  for(const [id,key]of [['observation-title','observationTitle'],['observation','observation'],['gap-title','gapTitle'],['gap','gap'],['next-title','nextTitle'],['next','next']])document.getElementById(id).textContent=ref[key];
}
document.querySelector('#reference-image').addEventListener('error',()=>{document.querySelector('#image-error').hidden=false;document.querySelector('#reference-image').hidden=true;});
select(references[0]);
