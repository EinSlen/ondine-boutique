// Creates the "Journal" blog and its articles (idempotent on handles).
import fs from 'node:fs';
import path from 'node:path';
import { gql, rest, ICI_DIR } from './shop.mjs';

const THEME = 190830182728;
const PRODUIT = '/products/kapsulcam-4k';
const cta = (t) => `<p><a href="${PRODUIT}">${t}</a></p>`;

const articles = [
  {
    handle: 'choisir-mini-camera-pov',
    title: 'Mini caméra POV : 7 critères pour bien choisir',
    image: 'kc-blog-choisir.jpg',
    alt: 'Vue à la première personne depuis une moto sur une route de montagne',
    summary: 'Poids, fixation, étanchéité, autonomie, carte mémoire : ce qui compte vraiment avant d\'acheter une caméra à porter sur soi.',
    tags: ['guide', 'choisir'],
    body: `
<p>Une caméra POV (point of view) filme ce que vous voyez, depuis votre corps ou votre équipement. Elle ne remplace pas un smartphone pour une belle photo, mais elle capte ce que le téléphone rate : la descente, la vague, le fou rire, parce que vos mains restent libres. Voici les sept points à regarder avant de choisir.</p>
<h2>1. Le poids</h2>
<p>C'est le critère qui décide si vous la porterez vraiment. Au-delà de 100 g, une caméra fixée au casque ou au t-shirt se sent et finit au fond du sac. Les modèles « gélule » pèsent entre 30 et 50 g : on les oublie une fois accrochés.</p>
<h2>2. Le système de fixation</h2>
<p>Regardez ce qui est fourni, pas seulement la caméra. Un collier magnétique pour la porter sur la poitrine, un clip pour une bretelle ou une casquette, un support guidon et un bracelet couvrent la plupart des usages. Une compatibilité avec les supports d'action cam classiques permet d'aller plus loin.</p>
<h2>3. L'étanchéité</h2>
<p>Deux cas existent : la caméra étanche d'origine, ou la caméra résistante aux éclaboussures livrée avec un caisson. Le caisson n'est pas un défaut : il protège aussi des chocs et des rayures. Vérifiez la profondeur annoncée (30 m couvre la baignade, le snorkeling et la plongée loisir) et qu'il est inclus.</p>
<h2>4. L'autonomie réelle</h2>
<p>Les fabricants donnent souvent un chiffre Wi-Fi coupé. Comptez moins si l'appli reste connectée, et nettement moins par grand froid. Pour une sortie de deux heures, filmez par séquences plutôt qu'en continu.</p>
<h2>5. La carte mémoire</h2>
<p>Pour la 4K, prenez une microSD classée <strong>U3</strong> ou <strong>V30</strong> : elle garantit un débit minimal suffisant pour enregistrer sans coupure. Une 64 Go donne environ deux heures de vidéo 4K selon les réglages. Formatez-la dans la caméra avant la première utilisation.</p>
<h2>6. L'appli et le transfert</h2>
<p>Le Wi-Fi intégré sert à deux choses : cadrer en direct depuis le téléphone et récupérer les vidéos sans câble. C'est ce qui fait qu'on partage ses images le soir même au lieu de les oublier sur la carte.</p>
<h2>7. La simplicité d'usage</h2>
<p>Une caméra qui se lance d'un seul appui sera utilisée. Un menu à trois niveaux sur un écran minuscule, beaucoup moins. Pour une caméra portée, le meilleur réglage est souvent celui qu'on n'a pas à faire.</p>
<h2>En résumé</h2>
<p>Pour un usage quotidien, sportif et en vacances : moins de 50 g, plusieurs fixations fournies, un caisson étanche inclus, une microSD U3 et une appli Wi-Fi. C'est exactement le cahier des charges de la KapsulCam.</p>
${cta('Découvrir la KapsulCam 4K')}`,
  },
  {
    handle: 'filmer-vtt-velo-pov-conseils',
    title: 'Filmer ses sorties VTT et vélo en POV : nos conseils',
    image: 'kc-blog-velo.jpg',
    alt: 'Roue arrière et dérailleur d\'un VTT sur un sentier en forêt',
    summary: 'Poitrine, casque ou guidon : où placer sa caméra, comment limiter les vibrations et ramener des images qu\'on a envie de revoir.',
    tags: ['conseils', 'vélo'],
    body: `
<p>Une sortie VTT filmée de son point de vue, c'est la meilleure façon de revivre une descente et de la partager. Encore faut-il que les images soient regardables. Voici ce qui fait la différence.</p>
<h2>Choisir le bon emplacement</h2>
<p><strong>Sur la poitrine</strong> (collier magnétique ou harnais) : c'est le point de vue le plus immersif. On voit le guidon, les mains, le terrain qui arrive, et le corps amortit une partie des vibrations. C'est le placement conseillé pour débuter.</p>
<p><strong>Sur le casque</strong> : la caméra montre là où vous regardez, ce qui donne des images vivantes en virage. En contrepartie, chaque mouvement de tête se voit.</p>
<p><strong>Sur le guidon</strong> : pratique sur route et en ville, mais il transmet toutes les vibrations du terrain. Réservez-le aux surfaces lisses.</p>
<h2>Soigner l'angle</h2>
<p>Inclinez légèrement la caméra vers le bas : un tiers de ciel et deux tiers de chemin. Une caméra trop droite filme surtout le ciel, une caméra trop basse ne montre que la roue. Faites un essai de trente secondes et vérifiez le cadrage sur l'appli avant de partir.</p>
<h2>Gérer la batterie et la carte</h2>
<p>Plutôt que de tout filmer, lancez l'enregistrement sur les passages qui valent le coup : la descente technique, la vue au sommet, l'arrivée. Vous économisez la batterie et vous passerez moins de temps à trier. Une carte microSD U3 évite les coupures en 4K.</p>
<h2>Penser au son</h2>
<p>Le vent sature vite le micro. Une caméra portée sur la poitrine, protégée par le buste, capte moins de souffle qu'une caméra au vent sur le casque.</p>
<h2>Respecter les autres</h2>
<p>Sur un sentier partagé, vous filmez aussi des promeneurs. Avant de publier, floutez les visages des personnes reconnaissables qui ne vous ont pas donné leur accord : le droit à l'image s'applique aussi en pleine nature.</p>
<h2>Le montage en dix minutes</h2>
<p>Gardez les dix meilleures secondes de chaque passage, ajoutez une musique, et coupez tout le reste. Une vidéo de quarante-cinq secondes bien choisies se regarde jusqu'au bout ; une descente de vingt minutes, rarement.</p>
${cta('Voir la KapsulCam et ses fixations')}`,
  },
  {
    handle: 'filmer-sous-l-eau-mini-camera',
    title: 'Filmer sous l\'eau avec une mini caméra : le guide pour débuter',
    image: 'kc-blog-plongee.jpg',
    alt: 'Banc de poissons dans une eau bleue profonde',
    summary: 'Caisson, buée, couleurs qui disparaissent, rinçage après la mer : tout ce qu\'il faut savoir pour ramener de belles images de la mer ou de la piscine.',
    tags: ['conseils', 'mer'],
    body: `
<p>Snorkeling, piscine avec les enfants, plongée en vacances : sous l'eau, une petite caméra fait des merveilles. Quelques gestes simples évitent les mauvaises surprises.</p>
<h2>Avant de partir : vérifier le caisson</h2>
<p>Ouvrez le caisson, vérifiez que le joint est propre, sans cheveu ni grain de sable, puis refermez-le à fond. Faites un test à vide : plongez le caisson fermé, sans la caméra, une minute dans un lavabo. S'il reste sec à l'intérieur, il est prêt.</p>
<h2>Éviter la buée</h2>
<p>La buée apparaît quand on ferme le caisson dans un air chaud et humide, puis qu'on entre dans une eau plus froide. Fermez-le à l'intérieur, au sec, quelques minutes avant la baignade, et ne l'ouvrez pas sur la plage.</p>
<h2>Comprendre les couleurs</h2>
<p>L'eau absorbe d'abord le rouge, puis l'orange et le jaune. Dès quelques mètres de profondeur, les images deviennent bleues ou vertes. Pour garder des couleurs vives, restez près de la surface et près de votre sujet : un mètre plutôt que cinq.</p>
<h2>Filmer en mouvement</h2>
<p>Tenez la caméra avec la poignée ou portez-la au poignet, et bougez lentement. Les gestes brusques donnent des images floues et un peu de sable en suspension suffit à tout troubler. Laissez venir les poissons plutôt que de les poursuivre.</p>
<h2>Après la baignade</h2>
<p>Rincez le caisson fermé à l'eau douce après chaque sortie en mer : le sel et le sable abîment le joint. Séchez-le avant de l'ouvrir, puis laissez-le ouvert pour qu'il sèche à l'intérieur.</p>
<h2>Et à la piscine ?</h2>
<p>Le chlore n'empêche rien, mais un rinçage reste conseillé. C'est l'endroit idéal pour s'entraîner : eau claire, lumière forte, et des enfants ravis de se voir sous l'eau.</p>
${cta('Découvrir la KapsulCam et son caisson 30 m')}`,
  },
];

let blog = (await gql(`{ blogs(first: 20) { nodes { id handle } } }`)).blogs.nodes.find((b) => b.handle === 'journal');
if (!blog) {
  const r = await gql(`mutation($b: BlogCreateInput!) { blogCreate(blog: $b) { blog { id handle } userErrors { field message } } }`, { b: { title: 'Journal', handle: 'journal' } });
  if (r.blogCreate.userErrors.length) throw new Error(JSON.stringify(r.blogCreate.userErrors));
  blog = r.blogCreate.blog;
}
console.log('blog', blog.handle);

for (const a of articles) {
  const asset = await rest('PUT', `themes/${THEME}/assets.json`, { asset: { key: `assets/${a.image}`, attachment: fs.readFileSync(path.join(ICI_DIR, 'blog', a.image)).toString('base64') } });
  const input = {
    title: a.title, handle: a.handle, body: a.body.trim(), summary: `<p>${a.summary}</p>`, tags: a.tags, isPublished: true,
    author: { name: 'L\'équipe KapsulCam' }, image: { url: asset.asset.public_url, altText: a.alt },
  };
  const ex = (await gql(`query($q: String!) { articles(first: 5, query: $q) { nodes { id handle } } }`, { q: `handle:${a.handle}` })).articles.nodes.find((x) => x.handle === a.handle);
  const r = ex
    ? await gql(`mutation($id: ID!, $a: ArticleUpdateInput!) { articleUpdate(id: $id, article: $a) { article { handle } userErrors { field message } } }`, { id: ex.id, a: input })
    : await gql(`mutation($a: ArticleCreateInput!) { articleCreate(article: $a) { article { handle } userErrors { field message } } }`, { a: { ...input, blogId: blog.id } });
  const o = r.articleUpdate || r.articleCreate;
  console.log(a.handle, o.article ? 'ok' : JSON.stringify(o.userErrors));
}
