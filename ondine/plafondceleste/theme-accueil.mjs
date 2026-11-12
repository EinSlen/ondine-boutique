// node theme-accueil.mjs : builds the Plafond Céleste home page in theme/templates/index.json (Lucarne hero, promise band, collection, Phébé waitlist)
import fs from 'node:fs';

const FILE = new URL('./theme/templates/index.json', import.meta.url);
const raw = fs.readFileSync(FILE, 'utf8');
const header = (raw.match(/^\/\*[\s\S]*?\*\//) || [''])[0];
const data = JSON.parse(raw.slice(header.length));

const HERO = `<section class="pc-hero">
  <picture class="pc-hero__photo">
    <source media="(max-width: 860px)" srcset="{{ 'pc-hero-plafond-900.jpg' | asset_url }}" width="900" height="1000">
    <img src="{{ 'pc-hero-plafond-2048.jpg' | asset_url }}" alt="Ciel étoilé projeté au plafond d'une chambre par le projecteur Lucarne" width="2048" height="1158" loading="eager" fetchpriority="high">
  </picture>
  <div class="pc-hero__inner">
    <div class="pc-hero__copy">
      <p class="pc-kicker">Lucarne · le ciel de poche</p>
      <h1 class="pc-hero__title">Branchez. Éteignez. <em>Regardez en l'air.</em></h1>
      <p class="pc-hero__lead">Le petit projecteur que tout le monde se montre en ce moment. On le branche près du lit, on glisse un disque, on éteint : la lune s'affiche au plafond.</p>
      <div class="pc-hero__ctas">
        <a class="button" href="/products/lucarne">Découvrir Lucarne · {{ all_products['lucarne'].price | money }}</a>
        <a class="button-secondary" href="/collections/frontpage">Toute la collection</a>
      </div>
      <p class="pc-hero__proof">Livraison suivie offerte · 8 à 15 jours ouvrés · Retours sous 14 jours</p>
    </div>
  </div>
</section>
<style>
  .pc-hero { position: relative; overflow: hidden; background: #060a15; border-bottom: 1px solid rgba(239, 231, 214, .12); }
  .pc-hero__photo, .pc-hero__photo img { position: absolute; inset: 0; width: 100%; height: 100%; }
  .pc-hero__photo img { object-fit: cover; object-position: 70% 30%; }
  .pc-hero::before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(90deg, rgba(6, 10, 21, .94) 0%, rgba(6, 10, 21, .78) 38%, rgba(6, 10, 21, .15) 68%, rgba(6, 10, 21, 0) 100%); }
  .pc-hero__inner { position: relative; z-index: 2; max-width: var(--page-width, 1240px); min-height: clamp(560px, 44vw, 700px); margin: 0 auto; padding: clamp(48px, 7vw, 96px) var(--page-margin, 20px); display: grid; align-content: center; }
  .pc-hero__copy { display: grid; gap: 22px; min-width: 0; max-width: 600px; }
  .pc-kicker { margin: 0; font-family: var(--font-body--family); font-size: 12px; letter-spacing: .22em; text-transform: uppercase; color: #d8ad62; }
  .pc-hero__title { margin: 0; font-family: var(--font-heading--family); font-weight: 600; font-size: clamp(42px, 5.6vw, 78px); line-height: 1.1; letter-spacing: -.035em; color: #efe7d6; text-wrap: balance; }
  .pc-hero__title em { font-family: var(--font-accent--family); font-style: italic; font-weight: 400; font-size: 1.1em; letter-spacing: -.01em; color: #d8ad62; }
  .pc-hero__lead { margin: 0; max-width: 46ch; font-size: 18px; line-height: 1.6; color: #a4abbb; }
  .pc-hero__ctas { display: flex; flex-wrap: wrap; gap: 12px; }
  .pc-hero__proof { margin: 0; font-size: 13px; letter-spacing: .04em; color: #6f7890; }
  @media (max-width: 860px) {
    .pc-hero__photo img { object-position: 78% 0; }
    .pc-hero::before { background: linear-gradient(180deg, rgba(6, 10, 21, 0) 0%, rgba(6, 10, 21, .1) 30%, rgba(6, 10, 21, .86) 52%, rgba(6, 10, 21, .96) 100%); }
    .pc-hero__inner { min-height: 0; padding-block: min(66vw, 340px) 48px; }
  }
</style>`;

const BAND = `<div class="pc-band">
  <span>Livraison suivie offerte</span><span>8 à 15 jours ouvrés</span><span>Retours sous 14 jours</span><span>Casse remplacée</span><span>Paiement sécurisé</span>
</div>
<style>
  .pc-band { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px 34px; padding: 16px var(--page-margin, 20px); border-bottom: 1px solid rgba(239, 231, 214, .12); background: #10172b; font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: #a4abbb; }
  .pc-band span::before { content: "✦"; color: #d8ad62; margin-right: 10px; }
</style>`;

const REELS = `{%- assign pc_reels = 'baleine|lucarne|Disque baleine,spirale|lucarne|Disque galaxie,aurore|boreale|Aurore au plafond,lagon|lagon|Reflets d eau' | split: ',' -%}
<section class="pc-reels">
  <div class="pc-reels__head">
    <p class="pc-kicker">En vidéo</p>
    <h2 class="pc-reels__title">Ce que ça donne <em>au plafond</em></h2>
  </div>
  <div class="pc-reels__track">
    {%- for reel in pc_reels -%}
      {%- assign parts = reel | split: '|' -%}
      {%- assign reel_product = all_products[parts[1]] -%}
      {%- assign reel_poster = 'pc-video-' | append: parts[0] | append: '.jpg' | asset_url -%}
      {%- assign reel_video = 'pc-video-' | append: parts[0] | append: '.mp4' | asset_url -%}
      <a class="pc-reel" href="{{ reel_product.url }}">
        <video class="pc-reel__video" muted loop playsinline preload="none" poster="{{ reel_poster }}" data-src="{{ reel_video }}" width="540" height="960" aria-hidden="true"></video>
        <span class="pc-reel__label"><strong>{{ reel_product.title | split: ',' | first }}</strong>{{ parts[2] | replace: 'd eau', "d'eau" }} · {{ reel_product.price | money }}</span>
      </a>
    {%- endfor -%}
  </div>
</section>
<style>
  .pc-reels { width: 100%; max-width: var(--page-width, 1240px); margin: 0 auto; padding: clamp(56px, 8vw, 104px) var(--page-margin, 20px) 0; }
  .pc-reels__head { display: grid; gap: 12px; margin-bottom: 28px; }
  .pc-reels__title { margin: 0; font-family: var(--font-heading--family); font-weight: 600; font-size: clamp(30px, 4vw, 50px); line-height: 1.05; letter-spacing: -.03em; color: #efe7d6; text-wrap: balance; }
  .pc-reels__title em, .pc-kids__title em, .pc-phebe__title em { font-family: var(--font-accent--family); font-style: italic; font-weight: 400; font-size: 1.1em; letter-spacing: -.01em; color: #d8ad62; }
  .pc-reels__track { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
  .pc-reel { position: relative; display: block; aspect-ratio: 9 / 16; overflow: hidden; border-radius: 4px; background: #10172b; color: #efe7d6; text-decoration: none; }
  .pc-reel__video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform .6s ease; }
  .pc-reel::after { content: ""; position: absolute; inset: 55% 0 0; background: linear-gradient(180deg, rgba(6, 10, 21, 0), rgba(6, 10, 21, .9)); }
  .pc-reel__label { position: absolute; left: 16px; right: 16px; bottom: 16px; z-index: 1; display: grid; gap: 2px; font-size: 13px; color: #a4abbb; }
  .pc-reel__label strong { font-size: 17px; font-weight: 600; letter-spacing: -.01em; color: #efe7d6; }
  .pc-reel:hover .pc-reel__video, .pc-reel:focus-visible .pc-reel__video { transform: scale(1.04); }
  @media (max-width: 860px) {
    .pc-reels__track { grid-template-columns: none; grid-auto-flow: column; grid-auto-columns: 64%; overflow-x: auto; scroll-snap-type: x mandatory; margin-inline: calc(-1 * var(--page-margin, 20px)); padding-inline: var(--page-margin, 20px); scrollbar-width: none; }
    .pc-reels__track::-webkit-scrollbar { display: none; }
    .pc-reel { scroll-snap-align: start; }
  }
</style>
<script>
  (() => {
    const videos = document.querySelectorAll('.pc-reel__video[data-src]');
    if (!videos.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) {
          if (!target.getAttribute('src')) target.src = target.dataset.src;
          target.play().catch(() => {});
        } else target.pause();
      });
    }, { rootMargin: '200px 0px' });
    videos.forEach((video) => io.observe(video));
  })();
</script>`;

const KIDS = `<section class="pc-kids">
  <div class="pc-kids__media">
    <img class="pc-kids__main" src="{{ 'pc-kids-coucher.jpg' | asset_url }}" alt="Un enfant et son parent regardent une lune projetée au plafond de la chambre" width="1100" height="1376" loading="lazy">
    <img class="pc-kids__inset" src="{{ 'pc-kids-berceau.jpg' | asset_url }}" alt="Une lune douce projetée au-dessus d'un berceau" width="1100" height="1376" loading="lazy">
  </div>
  <div class="pc-kids__copy">
    <p class="pc-kicker">Chambre d'enfant</p>
    <h2 class="pc-kids__title">Pour l'histoire <em>du soir</em></h2>
    <p class="pc-kids__lead">Allumé pendant l'histoire, il laisse une lune ou des étoiles au plafond le temps que l'enfant s'endorme, au lieu du noir complet.</p>
    <ul class="pc-kids__points">
      <li><span><strong>Une lumière douce</strong> au plafond, sans écran</span></li>
      <li><span><strong>Six disques</strong> fournis avec Lucarne, à changer selon les soirs</span></li>
      <li><span><strong>À poser en hauteur</strong>, hors de portée des tout-petits</span></li>
    </ul>
    <div class="pc-kids__picks">
      {%- assign pc_kids_handles = 'lucarne,astro,lagon' | split: ',' -%}
      {%- for handle in pc_kids_handles -%}
        {%- assign kid_product = all_products[handle] -%}
        {%- if kid_product.title != blank -%}
          <a class="pc-kids__pick" href="{{ kid_product.url }}">
            {{ kid_product.featured_image | image_url: width: 240 | image_tag: loading: 'lazy', widths: '120, 240', sizes: '72px', alt: kid_product.featured_image.alt }}
            <span><strong>{{ kid_product.title | split: ',' | first }}</strong>{{ kid_product.price | money }}</span>
          </a>
        {%- endif -%}
      {%- endfor -%}
    </div>
  </div>
</section>
<style>
  .pc-kids { width: 100%; max-width: var(--page-width, 1240px); margin: 0 auto; padding: clamp(56px, 8vw, 104px) var(--page-margin, 20px); display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: clamp(32px, 5vw, 72px); align-items: center; }
  .pc-kids__media { position: relative; padding-bottom: 12%; }
  .pc-kids__media img { display: block; height: auto; border-radius: 4px; }
  .pc-kids__media .pc-kids__main { width: 82%; }
  .pc-kids__media .pc-kids__inset { position: absolute; right: 0; bottom: 0; width: 44%; border: 4px solid #0a0f1d; box-shadow: 0 24px 60px rgba(0, 0, 0, .45); }
  .pc-kids__copy { display: grid; gap: 20px; min-width: 0; }
  .pc-kids__title { margin: 0; font-family: var(--font-heading--family); font-weight: 600; font-size: clamp(32px, 4.2vw, 54px); line-height: 1.04; letter-spacing: -.03em; color: #efe7d6; text-wrap: balance; }
  .pc-kids__lead { margin: 0; max-width: 48ch; font-size: 17px; line-height: 1.6; color: #a4abbb; text-wrap: pretty; }
  .pc-kids__points { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; font-size: 15px; color: #a4abbb; }
  .pc-kids__points li { display: grid; grid-template-columns: 18px minmax(0, 1fr); gap: 8px; }
  .pc-kids__points li::before { content: "✦"; color: #d8ad62; }
  .pc-kids__points strong { font-weight: 600; color: #efe7d6; }
  .pc-kids__picks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 6px; }
  .pc-kids__pick { display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 10px; align-items: center; padding: 8px; border: 1px solid #26304a; border-radius: 4px; background: #10172b; color: #a4abbb; font-size: 13px; text-decoration: none; transition: border-color .2s ease; }
  .pc-kids__pick:hover, .pc-kids__pick:focus-visible { border-color: #d8ad62; }
  .pc-kids__pick img { width: 56px; height: 56px; object-fit: cover; border-radius: 2px; }
  .pc-kids__pick span { display: grid; min-width: 0; }
  .pc-kids__pick strong { font-weight: 600; color: #efe7d6; }
  @media (max-width: 860px) {
    .pc-kids { grid-template-columns: minmax(0, 1fr); }
    .pc-kids__picks { grid-template-columns: minmax(0, 1fr); }
  }
</style>`;

const PHEBE = `<section class="pc-phebe">
  <div class="pc-phebe__art"><img src="{{ 'pc-phebe-socle.jpg' | asset_url }}" alt="Lampe lune Phébé en lévitation au-dessus de son socle en noyer gravé de deux prénoms et d'une date" width="1100" height="1100" loading="lazy"></div>
  <div class="pc-phebe__copy">
    <p class="pc-kicker">Bientôt · Phébé</p>
    <h2 class="pc-phebe__title">Vos prénoms gravés <em>sous la lune</em></h2>
    <p class="pc-phebe__lead">Phébé est une lampe lune qui flotte au-dessus d'un socle en bois. On grave sur le socle vos deux prénoms et une date, et on joint la carte de la phase de la lune ce soir-là.</p>
    {% form 'customer', class: 'pc-phebe__form' %}
      {% if form.posted_successfully? %}
        <p class="pc-phebe__ok">Merci, c'est noté : on vous écrit dès sa sortie.</p>
      {% else %}
        <input type="hidden" name="contact[tags]" value="phebe">
        <label class="visually-hidden" for="pc-phebe-email">Votre e-mail</label>
        <input id="pc-phebe-email" type="email" name="contact[email]" placeholder="Votre e-mail" autocomplete="email" required>
        <button class="button" type="submit">Me prévenir</button>
      {% endif %}
    {% endform %}
  </div>
</section>
<style>
  .pc-phebe { width: 100%; max-width: var(--page-width, 1240px); margin: 0 auto; padding: clamp(48px, 8vw, 100px) var(--page-margin, 20px); display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 48px; align-items: center; }
  .pc-phebe__art { width: min(100%, 520px); justify-self: center; }
  .pc-phebe__art img { display: block; width: 100%; height: auto; border-radius: 4px; }
  .pc-phebe__copy { display: grid; gap: 20px; min-width: 0; }
  .pc-phebe__title { margin: 0; font-family: var(--font-heading--family); font-weight: 600; font-size: clamp(32px, 4.2vw, 54px); line-height: 1.04; letter-spacing: -.03em; text-wrap: balance; }
  .pc-phebe__lead { margin: 0; max-width: 50ch; font-size: 17px; line-height: 1.6; color: #a4abbb; text-wrap: pretty; }
  .pc-phebe__form { display: flex; flex-wrap: wrap; gap: 10px; }
  .pc-phebe__form input[type="email"] { flex: 1 1 220px; min-width: 0; padding: 14px 16px; background: #151e36; border: 1px solid #26304a; color: #efe7d6; border-radius: 2px; }
  .pc-phebe__ok { margin: 0; color: #79c99f; }
  @media (max-width: 860px) { .pc-phebe { grid-template-columns: minmax(0, 1fr); } .pc-phebe__art { width: 100%; } }
</style>`;

const SELENE = `{%- assign selene = all_products['selene'] -%}
<section class="pc-selene">
  <div class="pc-selene__art"><img src="{{ 'pc-selene-photo.jpg' | asset_url }}" alt="Lune Séléné allumée sur une table de chevet, avec la photo d'un couple imprimée dedans" width="1100" height="1375" loading="lazy"></div>
  <div class="pc-selene__copy">
    <p class="pc-kicker">Nouveau · Séléné</p>
    <h2 class="pc-selene__title">Votre photo <em>dans la lune</em></h2>
    <p class="pc-selene__lead">Séléné est une lune imprimée en 3D : votre photo, ou des prénoms et une date, apparaissent quand elle s'allume. Elle est fabriquée à votre commande et arrive avec son support en bois.</p>
    <div class="pc-selene__cta">
      <a class="button" href="{{ selene.url | default: '/products/selene' }}">Personnaliser la mienne{% if selene.price %} · {{ selene.price | money }}{% endif %}</a>
      <p class="pc-selene__note">Pour Noël, commandez avant le 20 novembre.</p>
    </div>
  </div>
</section>
<style>
  .pc-selene { width: 100%; max-width: var(--page-width, 1240px); margin: 0 auto; padding: clamp(48px, 8vw, 100px) var(--page-margin, 20px); display: grid; grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); gap: 48px; align-items: center; }
  .pc-selene__art { width: min(100%, 460px); justify-self: center; }
  .pc-selene__art img { display: block; width: 100%; height: auto; border-radius: 4px; }
  .pc-selene__copy { display: grid; gap: 20px; min-width: 0; }
  .pc-selene__title { margin: 0; font-family: var(--font-heading--family); font-weight: 600; font-size: clamp(32px, 4.2vw, 54px); line-height: 1.04; letter-spacing: -.03em; text-wrap: balance; }
  .pc-selene__title em { font-family: var(--font-accent--family); font-style: italic; font-weight: 400; font-size: 1.1em; letter-spacing: -.01em; color: #d8ad62; }
  .pc-selene__lead { margin: 0; max-width: 50ch; font-size: 17px; line-height: 1.6; color: #a4abbb; text-wrap: pretty; }
  .pc-selene__cta { display: grid; justify-items: start; gap: 10px; }
  .pc-selene__note { margin: 0; font-size: 13px; color: #6f7890; }
  @media (max-width: 860px) { .pc-selene { grid-template-columns: minmax(0, 1fr); } .pc-selene__art { width: 100%; } }
</style>`;

const custom = (liquid) => ({
  type: 'custom-liquid',
  settings: { custom_liquid: liquid, section_width: 'full-width', 'padding-block-start': 0, 'padding-block-end': 0 }
});

const heroKey = Object.keys(data.sections).find((k) => data.sections[k].type === 'hero');
const listKey = Object.keys(data.sections).find((k) => data.sections[k].type === 'product-list');
if (heroKey) data.sections[heroKey].disabled = true;
data.sections.pc_hero = custom(HERO);
data.sections.pc_band = custom(BAND);
delete data.sections.pc_phebe;
data.sections.pc_selene = custom(SELENE);
data.sections.pc_reels = custom(REELS);
data.sections.pc_kids = custom(KIDS);

const head = data.sections[listKey].blocks['static-header'].blocks;
for (const b of Object.values(head)) {
  if (b.type === '_product-list-text') b.settings.text = '<h3>Tout ce qui se passe au plafond</h3>';
  if (b.type === '_product-list-button') b.settings.label = 'Tout voir';
}
data.sections[listKey].settings.collection = 'frontpage';
data.sections[listKey].settings['padding-block-start'] = 64;
data.sections[listKey].settings['padding-block-end'] = 32;
data.sections[listKey].settings.columns = 5;
for (const b of Object.values(data.sections[listKey].blocks['static-product-card'].blocks || {})) if (b.type === '_product-card-gallery') b.settings.image_ratio = 'square';

data.order = ['pc_hero', 'pc_band', ...(heroKey ? [heroKey] : []), 'pc_reels', listKey, 'pc_kids', 'pc_selene'];
fs.writeFileSync(FILE, (header ? `${header}\n` : '') + JSON.stringify(data, null, 2) + '\n');
console.log('accueil :', data.order.join(' > '));
