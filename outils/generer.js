/* Prépare le site pour la mise en ligne. GitHub Pages (ou Cloudflare / Netlify) lance ce script tout seul à chaque modification.
   1. Met à jour assets/secours.js (copie du contenu)
   2. Copie le site dans le dossier « public »
   3. Écrit le contenu directement dans chaque page (meilleur pour Google et les aperçus Facebook / WhatsApp)
   4. Crée une page par article, le plan du site (sitemap.xml) et robots.txt
   Aucun module à installer : Node suffit. */
const fs = require('fs'), path = require('path'), vm = require('vm');
const R = path.join(__dirname, '..'), OUT = path.join(R, 'public');
// Adresse du site : SITE_URL (à régler chez l'hébergeur), sinon celle fournie par Netlify ou Cloudflare
const SITE = (process.env.SITE_URL || process.env.URL || process.env.CF_PAGES_URL || '').replace(/\/$/, '');

// 1. Contenu
const data = {};
for (const f of fs.readdirSync(path.join(R, 'content')).filter(f => f.endsWith('.json'))) {
  const j = JSON.parse(fs.readFileSync(path.join(R, 'content', f), 'utf8'));
  const k = f.slice(0, -5);
  data[k] = j && j.items ? j.items : j;
  if (j && j.intro) data[k + '_intro'] = j.intro;
}
const secours = 'window.SECOURS = ' + JSON.stringify(data).replace(/</g, '\\u003c') + ';\n';
fs.writeFileSync(path.join(R, 'assets', 'secours.js'), secours);

// 2. Copie
fs.rmSync(OUT, {recursive: true, force: true});
for (const d of ['assets', 'content', 'images']) fs.cpSync(path.join(R, d), path.join(OUT, d), {recursive: true});
for (const f of ['site.webmanifest']) if (fs.existsSync(path.join(R, f))) fs.copyFileSync(path.join(R, f), path.join(OUT, f));
fs.copyFileSync(path.join(R, 'images', 'favicon.ico'), path.join(OUT, 'favicon.ico'));

// 3. Rendu d'une page avec un faux navigateur minimal
async function rendre(fichier, recherche) {
  const html = fs.readFileSync(path.join(R, fichier), 'utf8');
  const script = html.match(/<script>\n([\s\S]*?)<\/script>\s*<\/body>/)[1];
  let contenu = '', titre = '';
  const bidon = new Proxy(function () {}, {get: (t, k) => k === Symbol.toPrimitive ? () => '' : bidon, apply: () => bidon, construct: () => bidon});
  const site = {set innerHTML(v) { contenu = v; }, get innerHTML() { return contenu; }};
  const ctx = {
    PRERENDU: true, PAGES_PRETES: true, console, URLSearchParams, Promise, setTimeout,
    location: {search: recherche || '', pathname: '/' + fichier, hash: '', href: ''},
    fetch: async u => { const f = path.join(R, decodeURI(String(u)).split('?')[0]); return {ok: fs.existsSync(f), json: async () => JSON.parse(fs.readFileSync(f, 'utf8'))}; },
    document: {getElementById: id => id === 'site' ? site : bidon, querySelector: () => bidon, querySelectorAll: () => [], addEventListener() {}, set title(t) { titre = t; }, get title() { return titre; }},
    addEventListener() {}, IntersectionObserver: bidon, navigator: {}
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  const extras = [...html.matchAll(/<script src="(assets\/[^"]+)"><\/script>/g)].map(m => m[1]).filter(s => !/secours|site\.js|leaflet/.test(s));
  vm.runInContext(secours + fs.readFileSync(path.join(R, 'assets', 'site.js'), 'utf8') + '\n' + extras.map(s => fs.readFileSync(path.join(R, s), 'utf8')).join('\n') + '\n' + script, ctx);
  for (let i = 0; i < 50 && !contenu; i++) await new Promise(r => setTimeout(r, 20));
  return {html, contenu, titre};
}

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'}[c]));
function ecrire(sortie, {html, contenu, titre}, meta) {
  let h = html.replace('<div id="site"></div>', `<div id="site">${contenu}</div>`)
    .replace('<script src="assets/secours.js"></script>', '<script>window.PAGES_PRETES = true;</script>\n<script src="assets/secours.js"></script>');
  if (titre) h = h.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(titre)}</title>`);
  const adresse = SITE + '/' + (sortie === 'index.html' ? '' : sortie);
  const image = SITE + '/' + (meta.image || 'images/couverture.jpg');
  h = h.replace(/<meta property="og:[^>]*>\n?/g, '').replace('</head>',
    `<meta property="og:type" content="${meta.type || 'website'}">\n<meta property="og:title" content="${esc(titre)}">\n<meta property="og:description" content="${esc(meta.description)}">\n<meta property="og:image" content="${esc(image)}">\n<meta property="og:url" content="${esc(adresse)}">\n<meta name="twitter:card" content="summary_large_image">\n` +
    (meta.description && !/name="description"/.test(h) ? `<meta name="description" content="${esc(meta.description)}">\n` : '') +
    (SITE ? `<link rel="canonical" href="${esc(adresse)}">\n` : '') +
    ((data.reglages || {}).googleVerification ? `<meta name="google-site-verification" content="${esc(data.reglages.googleVerification.replace(/.*content="([^"]+)".*/, '$1'))}">\n` : '') +
    (meta.jsonld ? `<script type="application/ld+json">${JSON.stringify(meta.jsonld).replace(/</g, '\\u003c')}</script>\n` : '') + '</head>');
  fs.writeFileSync(path.join(OUT, sortie), h);
  return adresse;
}

(async () => {
  const L = data.livre, A = data.auteur;
  const pages = [];
  const C = data.contact || {};
  const auteurLD = {'@type': 'Person', name: A.nom, url: SITE + '/', sameAs: ['instagram', 'facebook', 'youtube', 'wattpad'].map(k => C[k]).filter(Boolean)};
  const livreLD = {'@context': 'https://schema.org', '@type': 'Book', name: L.titre, author: auteurLD, isbn: L.isbn, numberOfPages: L.pages ? +L.pages : undefined,
    genre: L.genre, inLanguage: 'fr', image: SITE + '/images/couverture.jpg', description: (L.resume || '').split(/\n\s*\n/)[0], url: SITE + '/une-vie-revee.html'};
  pages.push(ecrire('index.html', await rendre('index.html'), {jsonld: [{'@context': 'https://schema.org', ...auteurLD}, livreLD], description: `${A.nom}, auteur du roman ${L.titre} : ${L.accroche}`}));
  for (const [f, desc] of [['personnages.html', 'Les personnages du roman et leur origine'], ['backstage.html', 'Les coulisses en photos'], ['faq.html', "Les réponses de l'auteur aux questions des lecteurs"], ['temoignages.html', 'Les avis des lecteurs'], ['bande-son.html', 'La musique autour du roman'], ['sources.html', 'Les sources consultées pour écrire le livre']])
    pages.push(ecrire(f, await rendre(f), {description: `${desc} — ${L.titre}, de ${A.nom}.`}));
  pages.push(ecrire('une-vie-revee.html', await rendre('une-vie-revee.html'), {type: 'book', jsonld: livreLD, description: `${L.titre}, roman de ${A.nom} : résumé, coulisses, questions fréquentes et avis de lecteurs.`}));
  pages.push(ecrire('mon-etoile.html', await rendre('mon-etoile.html'), {type: 'book', description: `${data.prochain.titre}, le prochain roman de ${A.nom}.`, image: 'images/mon-etoile.jpg'}));
  pages.push(ecrire('rencontres.html', await rendre('rencontres.html'), {description: `Les rencontres et séances de dédicaces de ${A.nom}.`}));
  pages.push(ecrire('auteur.html', await rendre('auteur.html'), {description: `Qui est ${A.nom} ? Parcours, nom de plume et naissance de l'écriture.`}));
  pages.push(ecrire('blog.html', await rendre('blog.html'), {description: `Le blog de ${A.nom} : rencontres, dédicaces et nouvelles.`}));
  pages.push(ecrire('poesie.html', await rendre('poesie.html'), {description: `Poèmes de ${A.nom}.`}));
  ecrire('mentions-legales.html', await rendre('mentions-legales.html'), {description: `Mentions légales du site de ${A.nom}.`});
  // Une page par article (l'adresse article.html?a=… y mène grâce à netlify.toml)
  const slug = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const articles = (data.articles || []).slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  for (const a of articles) {
    const id = slug(a.titre);
    const photo = (a.photos || [])[0];
    pages.push(ecrire(`article-${id}.html`, await rendre('article.html', '?a=' + id), {type: 'article', description: a.resume, image: photo ? String(photo).replace(/^\//, '') : null}));
  }
  ecrire('article.html', await rendre('article.html'), {description: 'Journal de ' + A.nom});
  // Redirections et en-têtes (compris par Cloudflare Pages et Netlify)
  const espace = process.env.ESPACE_URL || 'https://app.pagescms.org';
  fs.writeFileSync(path.join(OUT, '_redirects'), `/ecrire ${espace} 302\n`);
  // GitHub Pages ne lit pas _redirects : une petite page /ecrire fait la redirection
  fs.mkdirSync(path.join(OUT, 'ecrire'), {recursive: true});
  fs.writeFileSync(path.join(OUT, 'ecrire', 'index.html'), `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=${esc(espace)}"><title>Espace d'édition</title></head><body><p><a href="${esc(espace)}">Ouvrir l'espace d'édition</a></p></body></html>\n`);
  fs.writeFileSync(path.join(OUT, '.nojekyll'), '');
  fs.writeFileSync(path.join(OUT, '_headers'), `/assets/polices/*\n  Cache-Control: public, max-age=31536000, immutable\n`);
  // Plan du site et robots
  if (SITE) fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(u => `  <url><loc>${esc(u)}</loc></url>`).join('\n')}\n</urlset>\n`);
  fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /ecrire\n${SITE ? `Sitemap: ${SITE}/sitemap.xml\n` : ''}`);
  console.log(`Site prêt : ${pages.length} pages, dont ${articles.length} article(s).`);
})().catch(e => { console.error(e); process.exit(1); });
