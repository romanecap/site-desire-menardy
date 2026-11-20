/* Pages du livre « Une vie rêvée » : chaque sous-rubrique a sa propre page.
   Chaque fichier HTML appelle afficherLivre('histoire' | 'backstage' | 'faq' | 'temoignages'). */
const SOUS_PAGES = [
  ['histoire', "L'histoire", 'une-vie-revee.html'],
  ['personnages', 'Personnages', 'personnages.html'],
  ['backstage', 'Backstage', 'backstage.html'],
  ['faq', 'FAQ', 'faq.html'],
  ['temoignages', 'Témoignages', 'temoignages.html'],
  ['musique', 'Bande-son', 'bande-son.html'],
  ['sources', 'Sources', 'sources.html']
];

function afficherLivre(vue) {
  chargerContenu().then(d => {
    const L = d.livre, A = d.auteur;
    const prefacier = (L.prefaceAuteur || '').split(',')[0];
    const photos = (d.backstage || []).filter(x => x.image);
    const questions = (d.faq || []).filter(x => x.question);
    const titreVue = SOUS_PAGES.find(s => s[0] === vue)[1];
    document.title = vue === 'histoire' ? `${L.titre} · ${A.nom}` : `${titreVue} · ${L.titre} · ${A.nom}`;
    const bloc = (cls, mot, lab, titre, corps) => `<section class="rubrique ${cls}" data-mot="${mot}"><div class="w"><div class="lab">${lab}</div><h2>${titre}</h2><div class="orn"></div>${corps}</div></section>`;

    const bouton = a => {
      const c = `<span><b>${esc(a.nom)}</b><small>${esc(a.detail)}</small></span><span class="fl">${a.lien ? '→' : '•'}</span>`;
      return a.lien ? `<a class="boutton" href="${url(a.lien)}"${ext(a.lien)}>${c}</a>` : `<div class="boutton">${c}</div>`;
    };
    const boutique = () => {
      const ebook = d.achats.filter(a => /ebook/i.test(a.type)), papier = d.achats.filter(a => !/ebook/i.test(a.type));
      return `<section class="rubrique" id="acheter" data-mot="Librairies"><div class="w"><div class="lab">Où le trouver</div><h2>Se procurer le livre</h2><div class="orn"></div>
        <div class="boutique">
          <div class="format"><div class="prix">${esc(L.prixPapier)}</div><div class="nom">Livre papier</div><div class="liste">${papier.map(bouton).join('')}</div></div>
          <img class="livre-visuel" src="${img(L.couverture)}" alt="">
          <div class="format"><div class="prix">${esc(L.prixEbook)}</div><div class="nom">Ebook</div><div class="liste">${ebook.map(bouton).join('')}</div></div>
        </div></div></section>`;
    };

    const contenus = {
      histoire: () => bloc('', 'Histoire', 'Le livre', "L'histoire", `
          <div class="quatrieme">${paras(L.resume)}</div>
          <div class="fiche">${[['Préface', prefacier], ['Pages', L.pages], ['ISBN', L.isbn], ['Papier', L.prixPapier], ['Ebook', L.prixEbook]].filter(x => x[1]).map(([k, v]) => `<span>${k} <b>${esc(v)}</b></span>`).join('')}</div>
          ${L.prefaceTexte ? `<div class="preface">« ${esc(L.prefaceTexte)} »<cite>Extrait de la préface · ${esc(prefacier)}</cite></div>` : ''}
          ${L.extrait ? `<div class="preface"><cite style="margin:0 0 18px">Extrait</cite><div class="quatrieme" style="font-style:normal">${paras(L.extrait)}</div></div>` : ''}`)
        + `<section class="rubrique r-doux"><div class="w"><div class="lab">Aller plus loin</div><h2>Autour du livre</h2><div class="orn"></div>
            <div class="cartes-sp">${SOUS_PAGES.slice(1).map(([id, t, page]) => {
              const info = {musique: `${(d.musique || []).length} disques autour du livre`, personnages: `${(d.personnages || []).length} cartes à retourner`, sources: `${(d.sources || []).length} liens consultés pour écrire le livre`, backstage: `${photos.length} photos des coulisses`, faq: `${questions.length} questions à l'auteur`, temoignages: `${d.temoignages.length} avis de lecteurs`}[id];
              const photoCarte = id === 'backstage' ? (photos[0] || {}).image : id === 'musique' ? ((d.musique || []).find(x => x.image) || {}).image : '';
              const visuel = photoCarte ? `<img src="${img(photoCarte)}" alt="" loading="lazy">` : `<span class="sp-ico">${{faq: '?', temoignages: '«', sources: '↗', personnages: 'A', musique: '♪'}[id] || ''}</span>`;
              return `<a class="carte-sp" href="${page}"><div class="sp-img">${visuel}</div><div class="sp-tx"><h3>${t}</h3><p>${info}</p><span class="lire">Découvrir →</span></div></a>`;
            }).join('')}</div></div></section>`
        + boutique(),
      musique: () => bloc('nuit-douce', 'Musique', 'Bande-son', 'La bande-son du roman', `
          ${d.musique_intro ? `<p class="intro-rub">${esc(d.musique_intro)}</p>` : ''}
          <div class="disques">${(d.musique || []).filter(m => m.titre).map(m => {
            const corps = `<div class="pochette">
                <span class="vinyle" aria-hidden="true"><span class="rond"${m.image ? ` style="background-image:url('${img(m.image)}')"` : ''}></span></span>
                <span class="carton"${m.image ? ` style="background-image:url('${img(m.image)}')"` : ''}>${m.image ? '' : `<span>${esc(m.titre.trim()[0])}</span>`}</span>
              </div>
              <div class="d-tx"><span class="d-art">${esc(m.artiste || '')}${m.annees ? ' · ' + esc(m.annees) : ''}</span><h3>${esc(m.titre)}</h3><p>${esc(m.texte || '')}</p>${m.lien ? `<span class="d-ecoute">${/spotify|deezer|youtu|music|soundcloud|depechemode/i.test(m.lien) ? 'Écouter' : 'En savoir plus'} ↗</span>` : ''}</div>`;
            return m.lien ? `<a class="disque" href="${url(m.lien)}" target="_blank" rel="noopener">${corps}</a>` : `<div class="disque" tabindex="0">${corps}</div>`;
          }).join('')}</div>`),
      personnages: () => bloc('r-doux', 'Personnages', "Dans l'histoire", 'Les personnages', `
          ${d.personnages_intro ? `<p class="intro-rub">${esc(d.personnages_intro)}</p>` : ''}
          <div class="indices persos">${(d.personnages || []).filter(p => p.nom).map(p => `
            <button class="indice perso" type="button" aria-expanded="false" aria-label="Retourner la carte de ${esc(p.nom)}">
              <span class="i-face i-avant p-avant">
                <span class="p-lettre" aria-hidden="true">${esc(p.nom.trim()[0])}</span>
                <span class="p-role">${esc(p.role)}</span>
                <span class="p-nom">${esc(p.nom)}</span>
                ${p.teaser ? `<span class="p-teaser">${esc(p.teaser)}</span>` : ''}
                <span class="i-txt">Retourner la carte</span>
              </span>
              <span class="i-face i-arriere">
                ${p.image ? `<span class="i-photo" data-loupe="${img(p.image)}"><img src="${img(p.image)}" alt="" loading="lazy"></span>` : ''}
                <span class="p-nom-dos">${esc(p.nom)}</span>
                <span class="i-legende">${esc(p.texte)}</span>
              </span>
            </button>`).join('')}</div>`),
      backstage: () => {
        const datees = photos.filter(x => x.date && !x.legende).sort((a, b) => a.date.localeCompare(b.date));
        const secrets = photos.filter(x => !(x.date && !x.legende));
        const sortie = (L.parution || '').toLowerCase();
        return (datees.length ? bloc('r-doux', 'Coulisses', 'Backstage', 'Avant la sortie', `
          ${d.backstage_intro ? `<p class="intro-rub">${esc(d.backstage_intro)}</p>` : ''}
          <div class="rebours">${datees.map((x, i) => `
            <figure><img src="${img(x.image)}" data-loupe alt="" loading="lazy">
              <figcaption><span class="n">${String(i + 1).padStart(2, '0')}</span><time>${dateFr(x.date)}</time></figcaption></figure>`).join('')}</div>
          ${sortie ? `<p class="rebours-fin">… et sortie du livre en ${esc(sortie)}.</p>` : ''}`) : '')
        + ((d.croquis || {}).image && (d.croquis.points || []).length ? bloc('r-bleu', 'Croquis', 'Le croquis', 'Le croquis à explorer', `
          ${d.croquis.intro ? `<p class="intro-rub" style="color:var(--bleu-clair)">${esc(d.croquis.intro)}</p>` : ''}
          <div class="explore">
            <div class="ex-plan"><img src="${img(d.croquis.image)}" alt="Croquis des lieux du roman" loading="lazy">
              ${d.croquis.points.map((p, i) => `<button class="ex-pt" type="button" data-pt="${i}" style="left:${+p.x}%;top:${+p.y}%" aria-label="${esc(p.titre)}"><span>${i + 1}</span></button>`).join('')}</div>
            <div class="ex-fiche" aria-live="polite">
              <div class="ex-num">01</div><h3>${esc(d.croquis.points[0].titre)}</h3><p>${esc(d.croquis.points[0].texte || '')}</p>
              <div class="ex-nav"><button type="button" data-dir="-1" aria-label="Point précédent">←</button><span class="ex-cpt">1 / ${d.croquis.points.length}</span><button type="button" data-dir="1" aria-label="Point suivant">→</button></div>
            </div>
          </div>`) : '')
        + (secrets.length ? bloc('', 'Histoire', "Dans l'histoire", 'Les secrets du roman', `
          <p class="intro-rub">${secrets.length} indices cachés dans le livre. Touchez une carte pour révéler son secret.</p>
          <div class="indices">${secrets.map((x, i) => `
            <button class="indice" type="button" aria-expanded="false" aria-label="Révéler le secret n° ${i + 1}">
              <span class="i-face i-avant">
                <img src="${img(x.image)}" alt="" loading="lazy">
                <span class="i-voile"><span class="i-num">${String(i + 1).padStart(2, '0')}</span><span class="i-txt">Révéler le secret</span></span>
              </span>
              <span class="i-face i-arriere">
                <span class="i-photo" data-loupe="${img(x.image)}"><img src="${img(x.image)}" alt="" loading="lazy"><span class="i-num">${String(i + 1).padStart(2, '0')}</span></span>
                <span class="i-legende">${esc(x.legende)}</span>
                <span class="i-voir" data-loupe="${img(x.image)}">Voir l'image en grand ↗</span>
              </span>
            </button>`).join('')}</div>
          <p class="indices-tout"><button type="button" class="btn btn-ligne" data-tout>Tout révéler</button></p>`) : '');
      },
      faq: () => bloc('', 'Questions', 'FAQ', 'Vos questions', `
          ${d.faq_intro ? `<p class="intro-rub">${esc(d.faq_intro)}</p>` : ''}
          <div class="faq interview">${questions.map((q, i) => `
            <details${i === 0 ? ' open' : ''}><summary><span class="q">${esc(q.question)}</span></summary>
              <div class="rep"><div class="bulle"><span class="ecrit" aria-hidden="true"><i></i><i></i><i></i></span><span class="txt">${paras(q.reponse)}</span></div>${A.photo ? `<img class="av" src="${img(A.photo)}" alt="">` : ''}</div></details>`).join('')}</div>
          <p class="faq-fin">Une autre question ? <a class="lien" href="#contact">Écrivez-moi</a></p>`),
      sources: () => {
        const lieux = (d.lieux || []).filter(x => isFinite(+x.lat) && isFinite(+x.lon));
        const dansParis = x => +x.lat > 48.78 && +x.lat < 48.96 && +x.lon > 2.18 && +x.lon < 2.47;
        const proj = (x, b) => { const k = Math.cos(((b.n + b.s) / 2) * Math.PI / 180);
          return {x: ((+x.lon - b.o) * k) / ((b.e - b.o) * k) * 100, y: (b.n - +x.lat) / (b.n - b.s) * 100}; };
        const B1 = {o: 1.2, e: 7.4, n: 49.5, s: 45.9}, B2 = {o: 2.19, e: 2.44, n: 48.94, s: 48.83};
        const paris = lieux.filter(dansParis), ailleurs = lieux.filter(x => !dansParis(x));
        const point = (x, b, i) => { const p = proj(x, b); return `<button class="lieu" type="button" data-lieu="${i}" style="left:${p.x}%;top:${p.y}%" aria-label="${esc(x.nom)}"><span class="pt"></span><span class="nom-lieu">${esc(x.nom)}</span></button>`; };
        const pp = proj({lat: 48.8566, lon: 2.3522}, B1);
        const carte = lieux.length ? bloc('r-bleu', 'Voyage', 'Sur les traces du roman', 'Les lieux du roman', `
          ${d.lieux_intro ? `<p class="intro-rub" style="color:var(--bleu-clair)">${esc(d.lieux_intro)}</p>` : ''}
          <div class="atlas">
            <div class="carte c-region"><span class="c-titre">France · Suisse</span>
              ${paris.length ? `<button class="lieu groupe" type="button" data-zoom style="left:${pp.x}%;top:${pp.y}%"><span class="pt"></span><span class="nom-lieu">Paris (${paris.length})</span></button>` : ''}
              ${(() => { const pts = [{lat: 48.8566, lon: 2.3522}, ...ailleurs].map(x => proj(x, B1)).sort((a, b) => a.y - b.y);
                return pts.length > 1 ? `<svg class="trajet" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M${pts.map(q => `${q.x} ${q.y}`).join(' L')}"/></svg>` : ''; })()}
              ${[['France', 36, 46], ['Suisse', 88, 66]].map(([t, x, y]) => `<span class="repere" style="left:${x}%;top:${y}%">${t}</span>`).join('')}
              <span class="leman" style="left:${proj({lat: 46.45, lon: 6.55}, B1).x}%;top:${proj({lat: 46.45, lon: 6.55}, B1).y}%" title="Lac Léman"></span>
              ${ailleurs.map(x => point(x, B1, lieux.indexOf(x))).join('')}</div>
            ${paris.length ? `<div class="carte c-paris"><span class="c-titre">Paris</span><span class="seine" aria-hidden="true"></span>${paris.map(x => point(x, B2, lieux.indexOf(x))).join('')}</div>` : ''}
            <div class="fiche-lieu" aria-live="polite"><p class="vide">Touchez un point sur la carte.</p></div>
          </div>`) : '';
        window.LIEUX = lieux;
        return carte + bloc('', 'Recherches', 'Sources', 'Les sources', `
          ${d.sources_intro ? `<p class="intro-rub">${esc(d.sources_intro)}</p>` : ''}
          <ul class="sources">${(d.sources || []).filter(s => s.lien).slice().sort((a, b) => a.titre.replace(/^[«"\s]+/, '').localeCompare(b.titre.replace(/^[«"\s]+/, ''), 'fr', {sensitivity: 'base', numeric: true})).map(s => `
            <li><a href="${url(s.lien)}" target="_blank" rel="noopener"><span class="s-titre">${esc(s.titre)}</span><span class="s-site">${esc(s.source || '')}</span><span class="fl">↗</span></a></li>`).join('')}</ul>`);
      },
      temoignages: () => bloc('r-bleu', 'Lecteurs', 'Témoignages', "Ils l'ont lu", `
          ${d.temoignages_intro ? `<p class="intro-rub" style="color:var(--bleu-clair)">${esc(d.temoignages_intro)}</p>` : ''}
          <div class="avis-mur">${d.temoignages.map(t => `<blockquote>${t.date ? `<time>${dateFr(t.date)}</time>` : ''}${paras(t.texte)}${t.nom ? `<small>${esc(t.nom)}</small>` : ''}</blockquote>`).join('')}</div>`)
    };

    // Bas des sous-pages : page suivante + achat
    const i = SOUS_PAGES.findIndex(s => s[0] === vue), suiv = SOUS_PAGES[(i + 1) % SOUS_PAGES.length];
    const suite = vue === 'histoire' ? '' : `<div class="suite-sp"><div class="w">
        <a class="btn btn-ligne" href="${suiv[2]}">${suiv[1]} →</a>
        <a class="btn" href="une-vie-revee.html#acheter">Se procurer le livre</a></div></div>`;

    document.getElementById('site').innerHTML = nav(d, false) + `
    <main>
      <header class="livre-tete${vue === 'histoire' ? '' : ' compacte'}"><div class="w">
        <a href="une-vie-revee.html" aria-label="Une vie rêvée : l'histoire"><img class="lt-couv" src="${img(L.couverture)}" alt="Couverture du livre ${esc(L.titre)}"></a>
        <div>
          <div class="lab">${esc(L.genre)} · ${esc(L.parution)}</div>
          <h1${vue === 'histoire' ? '' : ' class="lt-titre"'}>${esc(L.titre).replace(/\s(\S+)$/, ' <em>$1</em>')}${vue === 'histoire' ? '' : `<span class="sr"> · ${SOUS_PAGES.find(s => s[0] === vue)[1]}</span>`}</h1>
          ${vue === 'histoire' ? `<p class="accroche">${esc(L.accroche)}</p>` : ''}
          <nav class="onglets" aria-label="Pages du livre">${SOUS_PAGES.map(([id, t, page]) => `<a href="${page}"${id === vue ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
        </div>
      </div></header>
      ${contenus[vue]()}
      ${suite}
    </main>` + pied(d);
    finaliser();
    if (window.PRERENDU) return; // préparation des pages : pas d'interactions
    // Croquis à explorer
    const plan = document.querySelector('.ex-plan');
    if (plan) {
      const pts = d.croquis.points, fiche = document.querySelector('.ex-fiche'); let cur = 0;
      const voir = i => { cur = (i + pts.length) % pts.length; const p = pts[cur];
        document.querySelectorAll('.ex-pt').forEach(b => b.classList.toggle('actif', +b.dataset.pt === cur));
        fiche.querySelector('.ex-num').textContent = String(cur + 1).padStart(2, '0');
        fiche.querySelector('h3').textContent = p.titre; fiche.querySelector('p').textContent = p.texte || '';
        fiche.querySelector('.ex-cpt').textContent = `${cur + 1} / ${pts.length}`;
        fiche.classList.remove('flash'); void fiche.offsetWidth; fiche.classList.add('flash'); };
      document.querySelectorAll('.ex-pt').forEach(b => b.addEventListener('click', () => voir(+b.dataset.pt)));
      fiche.querySelectorAll('[data-dir]').forEach(b => b.addEventListener('click', () => voir(cur + +b.dataset.dir)));
      voir(0);
    }
    // Carte des lieux
    const fiche = document.querySelector('.fiche-lieu');
    if (fiche) {
      const montrer = i => { const x = window.LIEUX[i];
        document.querySelectorAll('.lieu').forEach(b => b.classList.toggle('actif', b.dataset.lieu == i));
        fiche.innerHTML = `<div class="fl-ville">${esc(x.ville || '')}</div><h3>${esc(x.nom)}</h3><p>${esc(x.texte || '')}</p>
          ${(x.sources || []).length ? `<ul>${x.sources.map(s => `<li><a href="${url(s.lien)}" target="_blank" rel="noopener">${esc(s.titre)} ↗</a></li>`).join('')}</ul>` : ''}`; };
      document.querySelectorAll('.lieu[data-lieu]').forEach(b => b.addEventListener('click', () => montrer(+b.dataset.lieu)));
      const z = document.querySelector('[data-zoom]');
      if (z) z.addEventListener('click', () => { const c = document.querySelector('.c-paris'); c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash'); c.scrollIntoView({behavior: 'smooth', block: 'center'}); });
      const premier = document.querySelector('.c-paris .lieu') || document.querySelector('.lieu[data-lieu]'); if (premier) montrer(+premier.dataset.lieu);
    }
    // Cartes « secrets » : un clic retourne la carte
    document.querySelectorAll('.indice').forEach(c => c.addEventListener('click', e => {
      if (e.target.closest('.i-voir, .i-photo')) return;
      const ouvert = c.classList.toggle('revele'); c.setAttribute('aria-expanded', ouvert);
    }));
    const tout = document.querySelector('[data-tout]');
    if (tout) tout.addEventListener('click', () => {
      const cartes = [...document.querySelectorAll('.indice')], fermer = cartes.every(c => c.classList.contains('revele'));
      cartes.forEach((c, i) => setTimeout(() => { c.classList.toggle('revele', !fermer); c.setAttribute('aria-expanded', !fermer); }, i * 120));
      tout.textContent = fermer ? 'Tout révéler' : 'Tout cacher';
    });
  });
}
