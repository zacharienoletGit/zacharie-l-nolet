// Vérification du site web/ avant chaque mise en ligne.
// Sert web/ localement, ouvre chaque page dans Chromium (bureau et 400 px) et refuse de publier si :
// titre, description ou canonique manquants ; débordement horizontal ; image sans texte de remplacement ;
// identifiant en double ; lien interne cassé (fichier ou ancre) ; erreur de console ou de script ; démonstrations muettes.
// Il exerce aussi les démonstrations : recherche, édition, synchronisation, ratio, CPQ, notes, cahier, données, devis, formulaire de contact.
// Usage : npm run verify:web   (Playwright est une dépendance de développement ; une fois : npx playwright install chromium ;
// variables facultatives : PLAYWRIGHT_MODULE, CHROMIUM_PATH)
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'web');
const SITE = 'https://zacharienoletgit.github.io/zacharie-l-nolet/';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp4': 'video/mp4', '.vtt': 'text/vtt', '.xml': 'application/xml', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.pdf': 'application/pdf' };

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let f = path.join(root, p === '/' ? 'index.html' : p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); // comme GitHub Pages : un dossier sert son index.html
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

let pw;
try { pw = await import(process.env.PLAYWRIGHT_MODULE || 'playwright'); }
catch (e) { console.error('Playwright introuvable. Installez les dépendances de développement (npm install), puis une fois : npx playwright install chromium.'); process.exit(2); }
const browser = await pw.chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const failures = [];
const fail = (page, msg) => failures.push(`${page} : ${msg}`);
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : (e.name.endsWith('.html') ? [path.relative(root, path.join(dir, e.name))] : []));
const pages = walk(root).map(p => p.split(path.sep).join('/')).sort();
// Les sites distincts portent une copie de la feuille de style principale : elle doit rester identique.
for (const sub of fs.readdirSync(root, { withFileTypes: true }).filter(e => e.isDirectory() && fs.existsSync(path.join(root, e.name, 'style.css')))) {
  if (fs.readFileSync(path.join(root, sub.name, 'style.css'), 'utf8') !== fs.readFileSync(path.join(root, 'style.css'), 'utf8')) failures.push(`${sub.name}/style.css : diffère de style.css (relancer le générateur des sites)`);
}

for (const f of pages) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const noise = [];
  page.on('pageerror', e => noise.push('script : ' + e.message));
  page.on('console', m => { if (m.type() === 'error') noise.push('console : ' + m.text().slice(0, 160)); });
  page.on('requestfailed', r => { if (r.url().startsWith(base)) noise.push('fichier manquant : ' + r.url().slice(base.length)); });
  // La page 404 charge ses fichiers par adresse absolue (elle est servie depuis n’importe quel chemin) :
  // on les sert depuis web/ pour vérifier qu’ils existent sans dépendre du réseau.
  await page.route(SITE + '**', (route) => {
    const rel = decodeURIComponent(new URL(route.request().url()).pathname).slice(new URL(SITE).pathname.length);
    let file = path.join(root, rel || 'index.html');
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (file.startsWith(root) && fs.existsSync(file) && !fs.statSync(file).isDirectory()) route.fulfill({ path: file, contentType: types[path.extname(file)] || 'application/octet-stream' });
    else route.fulfill({ status: 404, body: '' });
  });
  page.on('response', r => {
    // Une réponse 404 n’est pas un échec réseau pour Playwright : on la traite comme un fichier manquant, en local comme en absolu.
    if (r.url().startsWith(SITE) && r.status() === 404) noise.push('fichier manquant : ' + r.url().slice(SITE.length));
    if (r.url().startsWith(base) && r.status() >= 400) noise.push(`réponse ${r.status()} : ` + r.url().slice(base.length));
  });
  await page.goto(base + f, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  await page.waitForLoadState('load');
  // Une page de renvoi (meta refresh) mène ailleurs : les liens se résolvent depuis la page réellement affichée.
  const landedPath = decodeURIComponent(new URL(page.url()).pathname).replace(/^\//, '');
  const landed = landedPath === '' || landedPath.endsWith('/') ? landedPath + 'index.html' : landedPath;
  const pageDir = path.dirname(landed);
  const d = await page.evaluate((site) => {
    const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    const hrefs = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => h && (!/^(https?:|mailto:)/.test(h) || h.startsWith(site)));
    // Un lien absolu vers le site est ramené à la racine (préfixe « / ») ; un lien relatif se résout depuis la page.
    const rootify = (h) => (h.startsWith(site) ? '/' + h.slice(site.length) : h);
    const links = [...new Set(hrefs.map(h => rootify(h).replace(/[#?].*$/, '')).filter(Boolean))];
    const fragments = [...new Set(hrefs.filter(h => h.includes('#')).map(rootify))];
    const missingHere = fragments.filter(h => h.startsWith('#')).map(h => h.slice(1)).filter(id => id && !document.getElementById(id));
    // Ressources que Chromium ne demande pas forcément (vidéos en preload="none", variantes srcset, icônes, manifeste) : on les liste pour les vérifier sur disque.
    const assets = new Set();
    document.querySelectorAll('img[src], script[src], source[src], track[src], video[poster], link[href]').forEach(el => {
      const v = el.getAttribute('src') || el.getAttribute('poster') || el.getAttribute('href');
      if (v && !/^(https?:|data:|mailto:)/.test(v) || (v && v.startsWith(site))) assets.add(rootify(v));
    });
    document.querySelectorAll('[srcset]').forEach(el => el.getAttribute('srcset').split(',').forEach(c => { const u = c.trim().split(/\s+/)[0]; if (u) assets.add(rootify(u)); }));
    return {
      title: document.title, lang: document.documentElement.lang,
      description: document.querySelector('meta[name="description"]')?.content || '',
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      wide: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      noAlt: [...document.images].filter(i => !i.hasAttribute('alt')).length,
      dup: [...new Set(dup)], links, fragments, missingHere, assets: [...assets],
    };
  }, SITE);
  await page.setViewportSize({ width: 400, height: 800 });
  await page.waitForTimeout(300);
  const wideMobile = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);

  if (!d.title) fail(f, 'sans <title>');
  if (d.lang !== 'fr-CA') fail(f, `lang « ${d.lang} » au lieu de fr-CA`);
  if (!d.description) fail(f, 'sans meta description');
  if (!d.canonical) fail(f, 'sans lien canonique');
  if (d.wide) fail(f, 'débordement horizontal à 1280 px');
  if (wideMobile) fail(f, 'débordement horizontal à 400 px');
  if (d.noAlt) fail(f, `${d.noAlt} image(s) sans attribut alt`);
  if (d.dup.length) fail(f, 'identifiants en double : ' + d.dup.join(', '));
  // Un chemin résolu hors de web/ n’existe pas une fois le site déployé, même si le fichier est dans le dépôt.
  const inside = (t) => t === root || t.startsWith(root + path.sep);
  const resolve = (l) => {
    const fromRoot = l.startsWith('/');
    const rel = l.replace(/^\//, '');
    const t = path.normalize(path.join(root, fromRoot ? '' : pageDir, rel === '' || rel === './' ? 'index.html' : rel));
    if (!inside(t)) return null;
    return fs.existsSync(t) && fs.statSync(t).isDirectory() ? path.join(t, 'index.html') : t;
  };
  for (const l of d.links) { const t = resolve(l); if (!t) fail(f, `lien qui sort du site : ${l}`); else if (!fs.existsSync(t)) fail(f, `lien interne cassé : ${l}`); }
  for (const id of d.missingHere) fail(f, `ancre absente sur la page : #${id}`);
  for (const a of d.assets) {
    const target = resolve(a);
    if (!target) { fail(f, `ressource hors du site : ${a}`); continue; }
    if (!fs.existsSync(target)) { fail(f, `ressource absente : ${a}`); continue; }
    if (a.endsWith('.webmanifest')) {
      try {
        const man = JSON.parse(fs.readFileSync(target, 'utf8'));
        for (const icon of man.icons || []) if (!fs.existsSync(path.join(path.dirname(target), icon.src))) fail(f, `icône du manifeste absente : ${icon.src}`);
      } catch (e) { fail(f, `manifeste illisible : ${a}`); }
    }
  }
  for (const h of d.fragments.filter(x => !x.startsWith('#'))) {
    const [file, id] = h.split('#');
    const target = resolve(file);
    if (id && fs.existsSync(target) && !new RegExp(`\\sid="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(fs.readFileSync(target, 'utf8'))) fail(f, `ancre absente dans la cible : ${h}`);
  }

  // Les démonstrations doivent répondre : on déclenche les gestes principaux et on vérifie leurs sorties.
  const expect = (cond, msg) => { if (!cond) fail(f, msg); };
  const text = (sel) => page.textContent(sel).then(t => (t || '').trim());
  // Les écritures du classeur passent par un verrou entre onglets : on attend qu’il soit libre avant de lire l’état.
  const settled = (p = page) => p.evaluate(() => navigator.locks ? navigator.locks.request('zln-feuilles', () => undefined) : undefined);
  const submit = async (sel) => { await page.click(sel); await settled(); };
  try {
    await page.setViewportSize({ width: 1280, height: 900 });
    if (f === 'preuves.html') {
      await page.fill('#q', 'ETOILE'); expect(/2 textes/.test(await text('#qn')), 'recherche : « ETOILE » ne trouve pas 2 textes');
      const before = await text('#edhash'); await page.click('#edNext'); expect((await text('#edhash')) !== before, 'édition : changer la date ne change pas l’édition');
      await page.fill('#tLocal', ''); expect(/deux heures/.test(await text('#mergeOut')), 'synchronisation : heure vide sans message');
      await page.fill('#tLocal', '08:30'); expect(/gagne/.test(await text('#mergeOut')), 'synchronisation : aucun verdict après saisie');
      await page.fill('#r2b', ''); expect(/impossible/.test(await text('#rVerdict')), 'ratio : case vide sans verdict d’attente');
      await page.fill('#r2b', '20000'); await page.fill('#r2a', '17000'); expect(/points?|%/.test(await text('#rVerdict')), 'ratio : aucun verdict après saisie');
      await page.fill('#r2a', '0.5'); expect(!(await page.isHidden('#ratioErr')) && (await page.getAttribute('#r2a', 'aria-invalid')) === 'true' && (await page.getAttribute('#r2b', 'aria-invalid')) === 'false', 'ratio : une valeur fractionnaire passe, ou le mauvais champ est marqué');
      await page.fill('#r2a', '17000'); await page.fill('#r1a', ''); await page.fill('#r2b', '');
      expect((await page.getAttribute('#r1b', 'aria-invalid')) === 'false' && (await page.getAttribute('#r2b', 'aria-invalid')) === 'true', 'ratio : deux lignes invalides ne sont pas marquées case par case');
      await page.fill('#r1a', '95'); await page.fill('#r2b', '20000');
      const total0 = await text('#cpqTotal'); await page.click('#cpq-plateau'); expect((await text('#cpqTotal')) !== total0 && !(await page.isChecked('#cpq-tiroir')), 'CPQ : le plateau ne fait pas tomber le tiroir');
      await submit('#nForm button[type=submit]'); expect(!(await page.isHidden('#nErr')), 'notes : une note vide passe sans erreur');
      await page.fill('#nBody', 'Feuille de vérification.'); await submit('#nForm button[type=submit]'); expect(/enregistrée|visite/.test(await text('#nStatus')), 'notes : aucun accusé d’enregistrement');
      expect(/Feuille de vérification/.test(await page.inputValue('#mdOut')), 'export : la note n’apparaît pas dans le Markdown');
      // Une feuille liée à un article, écrite depuis la page Démo, garde son « En marge de » dans cet export aussi.
      await page.evaluate(() => localStorage.setItem('zln-feuilles', JSON.stringify([{ title: 'Liée', body: 'Corps', articleId: 'a-08' }])));
      await page.reload({ waitUntil: 'load' });
      expect(/En marge de : Un ratio ne se somme pas/.test(await page.inputValue('#mdOut')), 'export : l’article lié à une feuille est perdu');
      await page.evaluate(() => localStorage.clear());
    }
    if (f === 'demo.html') {
      expect((await page.locator('#chEdition li').count()) === 10, 'cahier : l’édition n’a pas 10 textes');
      await page.click('#chEdition li:nth-child(1) [data-clip]'); expect((await text('#chCount')) === '1', 'cahier : découper ne compte pas la coupure');
      await page.click('#tab-rubriques'); await page.fill('#chQ', 'etoile'); expect(/2 textes/.test(await text('#chQn')), 'cahier : la recherche ne trouve pas 2 textes');
      await page.click('#tab-classeur'); await page.fill('#chNBody', 'Feuille de vérification.'); await submit('#chNoteForm button[type=submit]');
      expect((await page.locator('#chNotes li:not(.empty)').count()) === 1, 'cahier : la feuille n’est pas dans le classeur');
      await page.click('#chMd'); const md = await page.inputValue('#chMdOut'); expect(/## Coupures/.test(md) && /Feuille de vérification/.test(md), 'cahier : l’export omet les coupures ou la feuille');
      // Une feuille liée à un article se détache d’un clic : enregistrée libre, sans « En marge de ».
      await page.click('#tab-edition'); await page.click('#chEdition li:nth-child(2) [data-feuille]');
      expect(!(await page.isHidden('#chNLink')) && (await page.inputValue('#chNTitle')) !== '', 'cahier : l’article lié à la feuille n’est pas affiché');
      await page.click('#chNUnlink'); await page.fill('#chNBody', 'Feuille libre.'); await submit('#chNoteForm button[type=submit]');
      expect((await page.isHidden('#chNLink')) && !/En marge de/.test(await text('#chNotes')), 'cahier : une feuille détachée reste liée à l’article');
      // L’en-tête du cahier suit la date de l’édition choisie.
      await page.click('#tab-edition'); await page.fill('#chEdDate', '2025-03-14'); await page.dispatchEvent('#chEdDate', 'change');
      expect(/14 mars 2025/.test(await text('#chDate')) && /2025-03-14/.test(await text('#chEdNote')), 'cahier : l’en-tête n’affiche pas la date de l’édition choisie');
      await page.click('#tab-cabinet'); await page.click('#chReset'); expect((await text('#chKvClips')) === '0', 'cahier : la remise à zéro ne vide pas les coupures');
      expect(!/14 mars 2025/.test(await text('#chDate')), 'cahier : la remise à zéro ne ramène pas la date du jour');
      // Un autre onglet remplit le classeur : l’ajout doit être refusé sans perdre la saisie.
      await page.evaluate(() => localStorage.setItem('zln-feuilles', JSON.stringify(Array.from({ length: 60 }, (_, i) => ({ title: 'Feuille ' + i, body: 'Corps ' + i })))));
      await page.click('#tab-classeur'); await page.fill('#chNBody', 'Soixante et unième'); await submit('#chNoteForm button[type=submit]');
      expect(!(await page.isHidden('#chNErr')) && (await page.inputValue('#chNBody')) === 'Soixante et unième' && !/enregistrée/.test(await text('#chNStatus')), 'cahier : une feuille refusée par la limite est annoncée enregistrée ou perdue');
      // Deux onglets enregistrent en même temps : les deux feuilles survivent (écritures sérialisées par le verrou).
      await page.evaluate(() => localStorage.setItem('zln-feuilles', JSON.stringify(Array.from({ length: 58 }, (_, i) => ({ title: 'Feuille ' + i, body: 'Corps ' + i })))));
      await page.reload({ waitUntil: 'load' });
      const other = await ctx.newPage(); await other.goto(page.url(), { waitUntil: 'load' });
      for (const [p, label] of [[page, 'Onglet A'], [other, 'Onglet B']]) { await p.click('#tab-classeur'); await p.fill('#chNBody', label); }
      await Promise.all([page.click('#chNoteForm button[type=submit]'), other.click('#chNoteForm button[type=submit]')]);
      await settled(); await settled(other);
      const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('zln-feuilles')).map(n => n.body));
      expect(kept.length === 60 && kept.includes('Onglet A') && kept.includes('Onglet B'), 'cahier : deux onglets qui enregistrent en même temps perdent une feuille');
      await other.close();
      await page.evaluate(() => localStorage.clear());
      // Le stockage refuse une écriture (quota) : la feuille reste en mémoire, et une écriture réussie plus tard ne l’efface pas.
      await page.reload({ waitUntil: 'load' }); await page.click('#tab-classeur');
      await page.fill('#chNBody', 'Feuille stockée'); await submit('#chNoteForm button[type=submit]');
      await page.evaluate(() => { window.__setItem = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new Error('quota'); }; });
      await page.fill('#chNBody', 'Feuille en mémoire'); await submit('#chNoteForm button[type=submit]');
      expect(/visite seulement/.test(await text('#chNStatus')) && (await page.locator('#chNotes li:not(.empty)').count()) === 2, 'cahier : une écriture refusée n’est pas annoncée comme gardée en mémoire');
      await page.evaluate(() => { Storage.prototype.setItem = window.__setItem; });
      await page.click('#chrm-0'); await settled();
      const after = await page.evaluate(() => JSON.parse(localStorage.getItem('zln-feuilles')).map(n => n.body));
      expect(after.length === 1 && after[0] === 'Feuille en mémoire' && /Feuille en mémoire/.test(await text('#chNotes')), 'cahier : la feuille gardée en mémoire disparaît quand une écriture réussit ensuite');
      // Un retrait refusé par le stockage est retenu lui aussi : la feuille ne réapparaît pas à l’écriture suivante.
      await page.evaluate(() => { Storage.prototype.setItem = function () { throw new Error('quota'); }; });
      await page.click('#chrm-0'); await settled();
      expect(/visite seulement/.test(await text('#chNStatus')) && (await page.locator('#chNotes li:not(.empty)').count()) === 0, 'cahier : un retrait refusé n’est pas annoncé comme provisoire');
      await page.evaluate(() => { Storage.prototype.setItem = window.__setItem; });
      await page.fill('#chNBody', 'Après le retrait'); await submit('#chNoteForm button[type=submit]');
      const afterRm = await page.evaluate(() => JSON.parse(localStorage.getItem('zln-feuilles')).map(n => n.body));
      expect(afterRm.length === 1 && afterRm[0] === 'Après le retrait' && !/Feuille en mémoire/.test(await text('#chNotes')), 'cahier : une feuille retirée pendant une panne de stockage réapparaît ensuite');
      await page.evaluate(() => localStorage.clear());
      // Un autre onglet vide le stockage pendant qu’une feuille attend d’être écrite : elle reste affichée une seule fois, puis est écrite une seule fois.
      await page.reload({ waitUntil: 'load' }); await page.click('#tab-classeur');
      await page.fill('#chNBody', 'Stockée'); await submit('#chNoteForm button[type=submit]');
      await page.evaluate(() => { window.__setItem = Storage.prototype.setItem; Storage.prototype.setItem = function () { throw new Error('quota'); }; });
      await page.fill('#chNBody', 'En attente'); await submit('#chNoteForm button[type=submit]');
      const wiper = await ctx.newPage(); await wiper.goto(page.url(), { waitUntil: 'load' }); await wiper.evaluate(() => localStorage.clear()); await wiper.close();
      await page.waitForTimeout(150);
      expect((await text('#chNotes')).split('En attente').length - 1 === 1, 'cahier : une feuille en attente est affichée en double après un vidage du stockage par un autre onglet');
      await page.evaluate(() => { Storage.prototype.setItem = window.__setItem; });
      await page.fill('#chNBody', 'Après le vidage'); await submit('#chNoteForm button[type=submit]');
      const afterWipe = await page.evaluate(() => JSON.parse(localStorage.getItem('zln-feuilles')).map(n => n.body));
      expect(afterWipe.join('|') === 'Stockée|En attente|Après le vidage', 'cahier : une feuille en attente est écrite en double après un vidage du stockage');
      await page.evaluate(() => localStorage.clear());
      // Stockage illisible dès le départ et deux feuilles identiques : retirer une ligne n’en retire qu’une.
      await page.reload({ waitUntil: 'load' }); await page.click('#tab-classeur');
      await page.evaluate(() => { window.__getItem = Storage.prototype.getItem; Storage.prototype.getItem = function () { throw new Error('bloqué'); }; Storage.prototype.setItem = function () { throw new Error('bloqué'); }; });
      for (let i = 0; i < 2; i++) { await page.fill('#chNBody', 'Double'); await submit('#chNoteForm button[type=submit]'); }
      await page.click('#chrm-0'); await settled();
      expect((await page.locator('#chNotes li:not(.empty)').count()) === 1, 'cahier : retirer une feuille en double les retire toutes quand le stockage est bloqué');
      await page.evaluate(() => { Storage.prototype.getItem = window.__getItem; Storage.prototype.setItem = window.__setItem; localStorage.clear(); });
    }
    if (f === 'donnees/index.html') {
      expect(/Corrélation r = /.test(await text('#dRegOut')), 'données : pas de corrélation calculée');
      await page.click('#dOutlier'); expect(/hors norme/.test(await text('#dRegVerdict')) && (await page.locator('#dChart .hot').count()) === 1, 'données : le mois hors norme n’apparaît pas');
      await page.fill('#abXb', '5200'); await page.fill('#abNb', '100000'); await page.fill('#abNa', '100000'); await page.fill('#abXa', '4800');
      expect(/tient/.test(await text('#abVerdict')), 'données : le test A/B ne tranche pas à 100 000 visiteurs');
      await page.fill('#abNa', '100'); await page.fill('#abXa', '0'); await page.fill('#abNb', '100'); await page.fill('#abXb', '100');
      expect(/tient/.test(await text('#abVerdict')) && !/NaN/.test(await text('#abOut')), 'données : 0 % contre 100 % ne donne pas un verdict valide');
      await page.fill('#dx0', '4'); await page.fill('#dy0', '9999999'); expect(!(await page.isHidden('#dRegErr')), 'données : une vente hors limites passe sans erreur');
      await page.fill('#dy0', '50'); await page.fill('#dSpend', '5000'); expect((await page.getAttribute('#dSpend', 'aria-invalid')) === 'true' && !/prévoit/.test(await text('#dRegOut')), 'données : une dépense de prévision hors limites produit une prévision');
      await page.fill('#dy0', '300'); await page.fill('#dy4', '10'); await page.fill('#dy6', '5'); await page.fill('#dSpend', '1000');
      const shapes = await page.$$eval('#dChart .fit, #dChart circle', els => els.map(e => e.tagName === 'circle' ? [Number(e.getAttribute('cy'))] : [Number(e.getAttribute('y1')), Number(e.getAttribute('y2'))]).flat());
      expect(shapes.length > 0 && shapes.every(y => y >= 16 && y <= 276), 'données : la droite ou un point sort du graphique quand la prévision est négative');
      await page.fill('#dy0', '50'); await page.fill('#dy4', '80'); await page.fill('#dy6', '97');
      await page.fill('#dSpend', '15'); await page.fill('#abNa', '5'); await page.fill('#abXa', '0'); await page.fill('#abNb', '5'); await page.fill('#abXb', '2');
      expect(/hasard/.test(await text('#abVerdict')), 'données : 0/5 contre 2/5 est annoncé décisif');
      await page.fill('#abXa', '11'); await page.fill('#abNa', '10'); expect((await page.getAttribute('#abXa', 'aria-invalid')) === 'true' && (await page.getAttribute('#abXb', 'aria-invalid')) === 'false', 'données : le champ valide est marqué invalide');
    }
    if (f === 'cpq/index.html') {
      expect(/\$/.test(await text('#cqTotal')), 'CPQ : pas de total au chargement');
      await page.click('#cq-inclinable'); expect(!(await page.isChecked('#cq-tiroir')) && (await page.isChecked('#cq-inclinable')), 'CPQ : le plateau inclinable ne retire pas le tiroir');
      await page.click('#cq-lampe'); expect((await page.isChecked('#cq-tiroir')) && !(await page.isChecked('#cq-inclinable')), 'CPQ : la lampe ne ramène pas le tiroir à la place du plateau inclinable');
      const traced = await page.$$eval('#cqTrace li', els => els.map(e => e.textContent.split(' · ')[0].trim()));
      expect(traced.length === 4 && new Set(traced).size === 4, 'CPQ : une règle apparaît deux fois (ou manque) dans la trace');
      await page.click('#cq-inclinable');
      await page.fill('#cqQty', '10'); expect(/Remise 10 %/.test(await text('#cqTotals')), 'CPQ : la remise de 10 % ne se déclenche pas à 10');
      const amount = (t) => Number(t.replace(/[^\d,−-]/g, '').replace('−', '-').replace(',', '.'));
      const totals = await page.$$eval('#cqTotals dd', ds => ds.map(d => d.textContent));
      const sum = amount(totals[1]) + totals.slice(2).reduce((acc, t) => acc + amount(t), 0);
      expect(Math.abs(sum - amount(await text('#cqTotal'))) < 0.005, 'CPQ : le total n’est pas la somme des montants affichés');
      await page.fill('#cqW', '160'); await page.click('#cq-second'); await page.fill('#cqW', ''); await page.fill('#cqW', '180');
      expect(await page.isChecked('#cq-second'), 'CPQ : effacer puis retaper la largeur perd le deuxième plateau');
      await page.fill('#cqW', '300'); expect(!(await page.isHidden('#cqErr')) && (await text('#cqTotal')) === '—' && (await page.isDisabled('#cqCopy')), 'CPQ : une largeur impossible laisse un total ou un bouton de copie actif');
    }
    if (f === 'contact.html') {
      await page.click('#cSend'); expect((await page.getAttribute('#cName', 'aria-invalid')) === 'true', 'contact : le nom vide n’est pas signalé');
      await page.fill('#cName', 'Vérification'); await page.fill('#cMsg', 'Un mandat de tableau de bord pour trois régions.'); await page.click('#cSend'); await page.waitForTimeout(500);
      expect(!(await page.isHidden('#cThanks')), 'contact : pas d’état de remerciement après l’envoi');
    }
    if (f === 'coulisses.html') {
      expect(/pour 1/.test(await text('#metaContrast')), 'coulisses : le contraste n’est pas mesuré');
      // Les chiffres « tirés du dépôt » doivent être ceux des fichiers livrés (même formule que le générateur).
      const ko = (n) => (n / 1000).toLocaleString('fr-CA', { maximumFractionDigits: 1 }) + ' Ko';
      const rootFiles = fs.readdirSync(root).filter(x => fs.statSync(path.join(root, x)).isFile()).length + fs.readdirSync(path.join(root, 'video')).length;
      const html = fs.readFileSync(path.join(root, f), 'utf8');
      expect(html.includes(`${rootFiles} fichiers pour le site principal`), `coulisses : nombre de fichiers périmé (attendu ${rootFiles})`);
      expect(html.includes(`un script de ${ko(fs.statSync(path.join(root, 'app.js')).size)}`), 'coulisses : taille de app.js périmée (relancer le générateur des pages)');
      expect(html.includes(`une feuille de style de ${ko(fs.statSync(path.join(root, 'style.css')).size)}`), 'coulisses : taille de style.css périmée (relancer le générateur des pages)');
    }
  } catch (e) { fail(f, 'interaction impossible : ' + e.message.split('\n')[0]); }
  for (const n of noise) fail(f, n);
  console.log(`${failures.some(x => x.startsWith(f + ' :')) ? '✗' : '✓'} ${f} — ${d.title}`);
  await ctx.close();
}
await browser.close();
server.close();
if (failures.length) {
  console.error('\nRefusé, ' + failures.length + ' problème(s) :');
  for (const x of failures) console.error(' - ' + x);
  process.exit(1);
}
console.log(`\n${pages.length} pages vérifiées, rien à signaler.`);
