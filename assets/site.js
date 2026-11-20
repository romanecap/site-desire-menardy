/* ===== Outils communs du site =====
   Le contenu vient du dossier « content » (modifié avec Pages CMS : app.pagescms.org).
   assets/secours.js contient une copie utilisée seulement si on ouvre le fichier directement sur l'ordinateur. */
const PARTIES = ['musique','croquis','personnages','lieux','sources','reglages','poesie','faq','backstage','mentions','livre','annonce','achats','articles','dedicaces','presse','temoignages','auteur','prochain','partenaire','contact'];
const LISTES = ['musique','personnages','lieux','sources','poesie','faq','backstage','achats','articles','dedicaces','presse','temoignages'];

async function chargerContenu(){
  const d = {};
  await Promise.all(PARTIES.map(async k => {
    try { const r = await fetch(`content/${k}.json`, {cache:'no-cache'}); if (!r.ok) throw 0; const j = await r.json(); d[k] = j.items ?? j; if (j.intro) d[k + '_intro'] = j.intro; }
    catch { d[k] = (window.SECOURS && SECOURS[k]) ?? (LISTES.includes(k) ? [] : {}); if (window.SECOURS && SECOURS[k + '_intro']) d[k + '_intro'] = SECOURS[k + '_intro']; }
  }));
  const auj = new Date().toISOString().slice(0,10);
  window.DONNEES_REGLAGES = d.reglages || {};
  d.dedicaces = d.dedicaces || [];
  d.aVenir = d.dedicaces.filter(x => (x.date||'') >= auj).sort((a,b) => a.date.localeCompare(b.date));
  d.passees = d.dedicaces.filter(x => (x.date||'') < auj).sort((a,b) => b.date.localeCompare(a.date));
  d.articles = (d.articles || []).map(a => ({...a, id: slug(a.titre)})).sort((a,b) => (b.date||'').localeCompare(a.date||''));
  return d;
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paras = s => String(s||'').trim().split(/\n\s*\n/).filter(Boolean).map(p => `<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('');
const url = u => /^(https?:|mailto:|tel:)/i.test(u||'') ? esc(u) : (u ? 'https://' + esc(u) : '');
const ext = u => /^(mailto:|tel:)/i.test(u||'') ? '' : ' target="_blank" rel="noopener"';
const img = p => esc(String(p||'').replace(/^\//,''));
// En ligne, chaque article a sa page toute prête ; ailleurs (aperçu, ordinateur) on passe par article.html
const lienArticle = id => window.PAGES_PRETES ? `article-${id}.html` : `article.html?a=${id}`;
const slug = s => String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const dateFr = iso => { const m = String(iso||'').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? `${+m[3]} ${MOIS[+m[2]-1]} ${m[1]}` : esc(iso); };

const ICONES = {
  instagram:'<svg viewBox="0 0 24 24"><path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2A3.2 3.2 0 1 1 12 8.8a3.2 3.2 0 0 1 0 6.4zM17.3 5.5a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM12 2c-2.7 0-3.1 0-4.1.1C4.3 2.2 2.2 4.3 2.1 7.9 2 8.9 2 9.3 2 12s0 3.1.1 4.1c.1 3.6 2.2 5.7 5.8 5.8 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c3.6-.1 5.7-2.2 5.8-5.8.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.1-3.6-2.2-5.7-5.8-5.8C15.1 2 14.7 2 12 2zm0 1.8c2.7 0 3 0 4 .1 2.7.1 3.9 1.4 4 4 .1 1 .1 1.3.1 4s0 3-.1 4c-.1 2.6-1.3 3.9-4 4-1 .1-1.3.1-4 .1s-3 0-4-.1c-2.7-.1-3.9-1.4-4-4-.1-1-.1-1.3-.1-4s0-3 .1-4c.1-2.6 1.3-3.9 4-4 1-.1 1.3-.1 4-.1z"/></svg>',
  facebook:'<svg viewBox="0 0 24 24"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z"/></svg>',
  youtube:'<svg viewBox="0 0 24 24"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15V9l5.8 3-5.8 3z"/></svg>',
  wattpad:'<svg viewBox="0 0 24 24"><path d="M14.9 3.6c-1.3 0-2.2 1-2.6 2.4l-.9 3.6-.7-2.4c-.5-1.6-1.4-2.6-2.8-2.6-1.6 0-2.8 1.3-2.4 3l2.2 9.4c.4 1.7 1.6 2.6 3 2.6 1.3 0 2.3-.8 2.7-2.1l.8-2.6.8 2.6c.4 1.3 1.4 2.1 2.7 2.1 1.4 0 2.6-.9 3-2.6l2.1-9.1c.4-1.8-.8-3.3-2.5-3.3-1.4 0-2.2 1-2.6 2.6l-.6 2.6-.9-3.6c-.4-1.5-1.3-2.4-2.4-2.4z"/></svg>'
};
const NOMS = {instagram:'Instagram', facebook:'Facebook', youtube:'YouTube', wattpad:'Wattpad'};

const JOURS = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi'];
// « Samedi 28 novembre 2026 » à partir de la date choisie dans le calendrier
const jourFr = iso => { const m = String(iso||'').match(/^(\d{4})-(\d{2})-(\d{2})/); if (!m) return esc(iso); const j = JOURS[new Date(+m[1], +m[2]-1, +m[3]).getDay()]; return `${j[0].toUpperCase() + j.slice(1)} ${+m[3]} ${MOIS[+m[2]-1]} ${m[1]}`; };

// [ancre de l'accueil, texte, page à part (facultatif)]
const LIENS = [['livre','Une vie rêvée','une-vie-revee.html'],['etoile','Mon Étoile','mon-etoile.html'],['rencontres','Rencontres','rencontres.html'],['auteur',"L'auteur",'auteur.html'],['journal','Blog','blog.html'],['poesie','Poésie','poesie.html'],['contact','Contact']];
const lienMenu = (p, id, page) => page ? page : (id === 'contact' ? '#contact' : `${p}#${id}`);
const SOUS_MENU = {livre: [["L'histoire", 'une-vie-revee.html'], ['Personnages', 'personnages.html'], ['Backstage', 'backstage.html'], ['FAQ', 'faq.html'], ['Témoignages', 'temoignages.html'], ['Bande-son', 'bande-son.html'], ['Sources', 'sources.html']]};
const PAGES_LIVRE = SOUS_MENU.livre.map(x => x[1].replace('.html', ''));
const estActif = page => page && (location.pathname.includes(page.replace('.html', '')) || (page === 'une-vie-revee.html' && PAGES_LIVRE.some(x => location.pathname.includes(x))));

// Bloc « prochaine rencontre » (accueil et page Rencontres)
const jd = iso => { const t = new Date(iso + 'T12:00:00'); return {j: JOURS[t.getDay()], n: t.getDate(), m: MOIS[t.getMonth()], a: t.getFullYear()}; };
const MOIS_COURT = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const plan = r => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(`${r.lieu} ${r.ville}`);
function blocRencontres(d, sansPassees){
  const R = d.aVenir[0];
  const passees = d.passees.map(p => { const x = jd(p.date); return `<div class="carte-date"><div class="d"><b>${x.n}</b><small>${MOIS_COURT[MOIS.indexOf(x.m)]}</small></div><div class="t"><b>${esc(p.lieu)}</b><br>${esc(p.ville)} · ${x.a}</div>${p.affiche ? `<img src="${img(p.affiche)}" data-loupe alt="Affiche">` : ''}</div>`; }).join('');
  if (!R) return sansPassees ? '<p class="intro-rub" style="color:var(--bleu-clair)">Aucune rencontre prévue pour le moment. Revenez bientôt !</p>' : `<div style="max-width:520px;margin:auto"><div class="passe-titre">Les rencontres passées</div>${passees}</div>`;
  const x = jd(R.date);
  const troisieme = (!sansPassees && passees) || (sansPassees && d.aVenir.length > 1);
  return `<div class="compo${troisieme ? '' : ' deux'}">
    <div class="grande-date"><span class="rebours-jours" data-jour="${R.date}"></span><div class="jour">${x.j} · prochaine rencontre</div><div class="num">${x.n}</div><div class="mois">${x.m} ${x.a}</div>
      <div class="ou"><b>${esc(R.lieu)}</b>${esc(R.ville)}${R.horaires ? '<br>' + esc(R.horaires) : ''}</div>
      <a class="btn btn-blanc" href="${plan(R)}" target="_blank" rel="noopener">Voir le plan</a></div>
    ${R.affiche ? `<img class="milieu affiche-penchee" src="${img(R.affiche)}" data-loupe alt="Affiche de la rencontre">` : '<span class="milieu"></span>'}
    <div>${!sansPassees && passees ? `<div class="passe-titre">Déjà passées</div>${passees}` : ''}${sansPassees && d.aVenir.length > 1 ? `<div class="passe-titre">Ensuite</div>${d.aVenir.slice(1).map(r => { const y = jd(r.date); return `<div class="carte-date"><div class="d"><b>${y.n}</b><small>${MOIS_COURT[MOIS.indexOf(y.m)]}</small></div><div class="t"><b>${esc(r.lieu)}</b><br>${esc(r.ville)}${r.horaires ? ' · ' + esc(r.horaires) : ''}</div></div>`; }).join('')}` : ''}</div>
  </div>`;
}

// En-tête commun à toutes les pages intérieures : bandeau bleu, petit titre, grand titre
function enTete({lab = '', titre = '', sous = '', image = '', retour = ''}){
  return `<header class="tete-page">${image ? `<div class="ta-img" style="background-image:url('${img(image)}')"></div>` : ''}<div class="w">
    ${retour}${lab ? `<div class="lab">${lab}</div>` : ''}<h1>${titre}</h1>${sous ? `<p class="sous">${sous}</p>` : ''}
  </div></header>`;
}

// Blog : le dernier article en grand, les suivants en lignes fines
function blocBlog(d, max, niv = 3){
  const H = 'h' + niv;
  const arts = d.articles.slice(0, max || d.articles.length);
  if (!arts.length) return '';
  const ph = a => img((a.photos || [])[0] || d.livre.couverture);
  const [u, ...reste] = arts;
  return `<div class="blog">
    <a class="blog-une" href="${lienArticle(u.id)}">
      <div class="bu-img"><img src="${ph(u)}" alt="" loading="lazy">${(u.photos || []).length > 1 ? `<span class="nb">${u.photos.length} photos</span>` : ''}</div>
      <div class="bu-tx"><span class="bu-tag">À la une</span><time>${dateFr(u.date)}</time><${H}>${esc(u.titre)}</${H}>${u.resume ? `<p>${esc(u.resume)}</p>` : ''}<span class="bu-lire">Lire l'article <span>→</span></span></div>
    </a>
    ${reste.length ? `<div class="blog-liste">${reste.map(a => `
      <a class="bl-ligne" href="${lienArticle(a.id)}">
        <img src="${ph(a)}" alt="" loading="lazy">
        <div><time>${dateFr(a.date)}</time><${H}>${esc(a.titre)}</${H}></div>
        <span class="bl-fl">→</span>
      </a>`).join('')}</div>` : ''}
  </div>`;
}

function nav(d, accueil){
  const p = accueil ? '' : 'index.html';
  const burger = `<button class="burger" aria-label="Ouvrir le menu" aria-expanded="false"><span></span><span></span></button>`;
  // Le même menu partout : posé sur la grande image en haut de l'accueil, puis dans la barre blanche
  const contenu = (avecCible) => `<div class="w">
    <a class="logo" href="${p || '#'}" aria-label="${esc(d.auteur.nom)}, accueil"><img class="logo-dm" src="images/logo-dm-${avecCible ? 'bleu' : 'blanc'}.png" alt=""><span>${esc(d.auteur.nom)}</span></a>
    <${avecCible ? 'nav' : 'div'} class="liens"${avecCible ? ' aria-label="Menu principal"' : ''}>${LIENS.map(([id, t, page]) => {
      const a = `<a href="${lienMenu(p, id, page)}"${page ? (estActif(page) ? ' class="actif"' : '') : (avecCible ? ` data-cible="${id}"` : '')}>${t}${SOUS_MENU[id] ? ' <span class="chev">▾</span>' : ''}</a>`;
      return SOUS_MENU[id] ? `<div class="deroulant">${a}<div class="sous">${SOUS_MENU[id].map(([st, sp]) => `<a href="${sp}"${location.pathname.includes(sp.replace('.html', '')) ? ' aria-current="page"' : ''}>${st}</a>`).join('')}</div></div>` : a;
    }).join('')}</${avecCible ? 'nav' : 'div'}>
    <a class="btn btn-petit" href="${p ? 'une-vie-revee.html' : ''}#acheter">Acheter le livre</a>
    ${burger}
  </div>`;
  return (accueil ? `<nav class="nav-image" aria-label="Menu d'accueil">${contenu(false)}</nav>` : '') + `
  <header class="barre${accueil ? '' : ' toujours'}" id="barre" aria-label="Barre de navigation">${contenu(true)}</header>
  <div class="menu-mobile" id="menu" hidden>
    <button class="fermer" aria-label="Fermer le menu">✕</button>
    <img class="m-logo" src="images/logo-dm-blanc.png" alt="${esc(d.auteur.nom)}">
    <nav>${LIENS.map(([id, t, page]) => `<a href="${lienMenu(p, id, page)}">${t}</a>` + (SOUS_MENU[id] ? `<div class="m-sous">${SOUS_MENU[id].slice(1).map(([st, sp]) => `<a href="${sp}">${st}</a>`).join('')}</div>` : '')).join('')}<a href="${p ? 'une-vie-revee.html' : ''}#acheter" class="m-acheter">Acheter le livre</a></nav>
  </div>`;
}

function pied(d){
  const C = d.contact, P = d.prochain, T = d.partenaire;
  return `<footer id="contact"><div class="w">
    <img class="pied-logo" src="images/logo-dm-blanc.png" alt="">
    <div class="lab">Contact</div>
    <h2>Écrire à l'auteur</h2>
    ${C.email ? `<div class="mail-ligne"><a class="mail" href="mailto:${esc(C.email)}">${esc(C.email)}</a><button class="copier" data-copier="${esc(C.email)}">Copier l'adresse</button></div>` : ''}
    <div class="reseaux">${Object.keys(NOMS).filter(k => C[k]).map(k => `<a href="${url(C[k])}" target="_blank" rel="noopener">${ICONES[k]} ${NOMS[k]}</a>`).join('')}</div>
    <div class="bas"><span>© ${new Date().getFullYear()} ${esc(d.auteur.nom)}${T.nom ? ` · ${esc(T.texte)} ${T.lien ? `<a href="${url(T.lien)}" target="_blank" rel="noopener">${esc(T.nom)}</a>` : ''}` : ''}</span><span class="liens-bas"><a href="mentions-legales.html">Mentions légales</a></span></div>
  </div></footer>
  <div class="loupe" id="loupe"><button aria-label="Fermer">✕</button><img alt=""></div>`;
}

function finaliser(){
  // Les mots en filigrane trop longs sont un peu plus petits pour rester dans l'écran
  document.querySelectorAll('.rubrique[data-mot]').forEach(s => { if (s.dataset.mot.length > 8) s.dataset.long = ''; });
  // Compte à rebours : calculé au moment de la visite
  document.querySelectorAll('[data-jour]').forEach(el => {
    const cible = new Date(el.dataset.jour + 'T00:00:00'), auj = new Date(); auj.setHours(0, 0, 0, 0);
    const n = Math.round((cible - auj) / 864e5);
    if (n < 0) { el.remove(); return; }
    el.classList.toggle('jour-j', n === 0);
    el.innerHTML = n === 0 ? "<b>Jour J</b> c'est aujourd'hui" : n === 1 ? '<b>Demain</b>' : `Plus que <b>${n}</b> jours`;
  });
  // Statistiques de visites (GoatCounter : sans cookies, donc sans bandeau)
  const R = window.DONNEES_REGLAGES || {};
  if (R.goatcounter && !window.PRERENDU && !document.querySelector('[data-goatcounter]')) {
    const s = document.createElement('script');
    s.async = true; s.src = 'https://gc.zgo.at/count.js';
    s.dataset.goatcounter = `https://${R.goatcounter.replace(/[^a-z0-9-]/gi, '')}.goatcounter.com/count`;
    document.body.appendChild(s);
  }
  if (window.PRERENDU) return; // préparation des pages par Netlify : pas d'interactions à brancher
  // Visionneuse plein écran
  const l = document.getElementById('loupe');
  document.addEventListener('click', e => { const t = e.target.closest('[data-loupe]'); if (t){ l.querySelector('img').src = t.dataset.loupe || t.src; l.classList.add('on'); } });
  l.addEventListener('click', () => l.classList.remove('on'));

  // Menu sur téléphone
  const menu = document.getElementById('menu');
  const ouvrir = v => { menu.hidden = !v; document.body.style.overflow = v ? 'hidden' : ''; document.querySelectorAll('.burger').forEach(b => b.setAttribute('aria-expanded', v)); };
  document.querySelectorAll('.burger').forEach(b => b.addEventListener('click', () => ouvrir(true)));
  menu.querySelector('.fermer').addEventListener('click', () => ouvrir(false));
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => ouvrir(false)));
  addEventListener('keydown', e => { if (e.key === 'Escape') { l.classList.remove('on'); ouvrir(false); } });

  // Barre du haut : apparaît après la grande image, et bouton « remonter »
  const barre = document.getElementById('barre');
  const ouverture = document.querySelector('.ouverture');
  const haut = document.createElement('a'); haut.href = '#'; haut.className = 'remonter'; haut.setAttribute('aria-label', 'Revenir en haut'); haut.textContent = '↑'; (document.querySelector('footer') || document.body).append(haut);
  const maj = () => {
    const seuil = ouverture ? ouverture.offsetHeight - 80 : 0;
    barre.classList.toggle('on', scrollY > seuil);
    haut.classList.toggle('on', scrollY > 900);
  };
  addEventListener('scroll', maj, {passive:true}); maj();

  // Rubrique en cours surlignée dans la barre
  const liens = [...barre.querySelectorAll('[data-cible]')];
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) liens.forEach(a => a.classList.toggle('actif', a.dataset.cible === e.target.id)); }), {rootMargin:'-45% 0px -50% 0px'});
  liens.forEach(a => { const s = document.getElementById(a.dataset.cible); if (s) io.observe(s); });

  // Copier l'e-mail
  document.querySelectorAll('[data-copier]').forEach(b => b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copier); b.textContent = 'Adresse copiée ✓'; }
    catch { const r = document.createRange(); r.selectNodeContents(b.previousElementSibling); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = 'Adresse sélectionnée'; }
    setTimeout(() => b.textContent = "Copier l'adresse", 2500);
  }));
}
