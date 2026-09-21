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
  const f = path.join(root, p === '/' ? 'index.html' : p);
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
const pages = fs.readdirSync(root).filter(f => f.endsWith('.html')).sort();

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
    const file = path.join(root, rel || 'index.html');
    if (file.startsWith(root) && fs.existsSync(file) && !fs.statSync(file).isDirectory()) route.fulfill({ path: file, contentType: types[path.extname(file)] || 'application/octet-stream' });
    else route.fulfill({ status: 404, body: '' });
  });
  page.on('response', r => { if (r.url().startsWith(SITE) && r.status() === 404) noise.push('fichier manquant : ' + r.url().slice(SITE.length)); });
  await page.goto(base + f, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  const d = await page.evaluate((site) => {
    const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    const hrefs = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => h && (!/^(https?:|mailto:)/.test(h) || h.startsWith(site)));
    const links = [...new Set(hrefs.map(h => (h.startsWith(site) ? h.slice(site.length) : h).replace(/[#?].*$/, '')).filter(Boolean))];
    const fragments = [...new Set(hrefs.filter(h => h.includes('#')).map(h => (h.startsWith(site) ? h.slice(site.length) : h)))];
    const missingHere = fragments.filter(h => h.startsWith('#')).map(h => h.slice(1)).filter(id => id && !document.getElementById(id));
    return {
      title: document.title, lang: document.documentElement.lang,
      description: document.querySelector('meta[name="description"]')?.content || '',
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      wide: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      noAlt: [...document.images].filter(i => !i.hasAttribute('alt')).length,
      dup: [...new Set(dup)], links, fragments, missingHere,
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
  for (const l of d.links) {
    const target = l === '' || l === './' ? 'index.html' : l;
    if (!fs.existsSync(path.join(root, target))) fail(f, `lien interne cassé : ${l}`);
  }
  for (const id of d.missingHere) fail(f, `ancre absente sur la page : #${id}`);
  for (const h of d.fragments.filter(x => !x.startsWith('#'))) {
    const [file, id] = h.split('#');
    const target = path.join(root, file === '' || file === './' ? 'index.html' : file);
    if (id && fs.existsSync(target) && !new RegExp(`\\sid="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(fs.readFileSync(target, 'utf8'))) fail(f, `ancre absente dans la cible : ${h}`);
  }

  // Les démonstrations doivent répondre : on déclenche les gestes principaux et on vérifie leurs sorties.
  const expect = (cond, msg) => { if (!cond) fail(f, msg); };
  const text = (sel) => page.textContent(sel).then(t => (t || '').trim());
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
      await page.click('#nForm button[type=submit]'); expect(!(await page.isHidden('#nErr')), 'notes : une note vide passe sans erreur');
      await page.fill('#nBody', 'Feuille de vérification.'); await page.click('#nForm button[type=submit]'); expect(/enregistrée|visite/.test(await text('#nStatus')), 'notes : aucun accusé d’enregistrement');
      expect(/Feuille de vérification/.test(await page.inputValue('#mdOut')), 'export : la note n’apparaît pas dans le Markdown');
    }
    if (f === 'demo.html') {
      expect((await page.locator('#chEdition li').count()) === 10, 'cahier : l’édition n’a pas 10 textes');
      await page.click('#chEdition li:nth-child(1) [data-clip]'); expect((await text('#chCount')) === '1', 'cahier : découper ne compte pas la coupure');
      await page.click('#tab-rubriques'); await page.fill('#chQ', 'etoile'); expect(/2 textes/.test(await text('#chQn')), 'cahier : la recherche ne trouve pas 2 textes');
      await page.click('#tab-classeur'); await page.fill('#chNBody', 'Feuille de vérification.'); await page.click('#chNoteForm button[type=submit]');
      expect((await page.locator('#chNotes li:not(.empty)').count()) === 1, 'cahier : la feuille n’est pas dans le classeur');
      await page.click('#chMd'); const md = await page.inputValue('#chMdOut'); expect(/## Coupures/.test(md) && /Feuille de vérification/.test(md), 'cahier : l’export omet les coupures ou la feuille');
      await page.click('#tab-cabinet'); await page.click('#chReset'); expect((await text('#chKvClips')) === '0', 'cahier : la remise à zéro ne vide pas les coupures');
    }
    if (f === 'donnees.html') {
      expect(/Corrélation r = /.test(await text('#dRegOut')), 'données : pas de corrélation calculée');
      await page.click('#dOutlier'); expect(/hors norme/.test(await text('#dRegVerdict')) && (await page.locator('#dChart .hot').count()) === 1, 'données : le mois hors norme n’apparaît pas');
      await page.fill('#abXb', '5200'); await page.fill('#abNb', '100000'); await page.fill('#abNa', '100000'); await page.fill('#abXa', '4800');
      expect(/tient/.test(await text('#abVerdict')), 'données : le test A/B ne tranche pas à 100 000 visiteurs');
      await page.fill('#abNa', '100'); await page.fill('#abXa', '0'); await page.fill('#abNb', '100'); await page.fill('#abXb', '100');
      expect(/tient/.test(await text('#abVerdict')) && !/NaN/.test(await text('#abOut')), 'données : 0 % contre 100 % ne donne pas un verdict valide');
      await page.fill('#dx0', '4'); await page.fill('#dy0', '9999999'); expect(!(await page.isHidden('#dRegErr')), 'données : une vente hors limites passe sans erreur');
      await page.fill('#dy0', '50'); await page.fill('#dSpend', '5000'); expect((await page.getAttribute('#dSpend', 'aria-invalid')) === 'true' && !/prévoit/.test(await text('#dRegOut')), 'données : une dépense de prévision hors limites produit une prévision');
      await page.fill('#dSpend', '15'); await page.fill('#abNa', '5'); await page.fill('#abXa', '0'); await page.fill('#abNb', '5'); await page.fill('#abXb', '2');
      expect(/hasard/.test(await text('#abVerdict')), 'données : 0/5 contre 2/5 est annoncé décisif');
      await page.fill('#abXa', '11'); await page.fill('#abNa', '10'); expect((await page.getAttribute('#abXa', 'aria-invalid')) === 'true' && (await page.getAttribute('#abXb', 'aria-invalid')) === 'false', 'données : le champ valide est marqué invalide');
    }
    if (f === 'cpq.html') {
      expect(/\$/.test(await text('#cqTotal')), 'CPQ : pas de total au chargement');
      await page.click('#cq-inclinable'); expect(!(await page.isChecked('#cq-tiroir')) && (await page.isChecked('#cq-inclinable')), 'CPQ : le plateau inclinable ne retire pas le tiroir');
      await page.fill('#cqQty', '10'); expect(/Remise 10 %/.test(await text('#cqTotals')), 'CPQ : la remise de 10 % ne se déclenche pas à 10');
      const amount = (t) => Number(t.replace(/[^\d,−-]/g, '').replace('−', '-').replace(',', '.'));
      const totals = await page.$$eval('#cqTotals dd', ds => ds.map(d => d.textContent));
      const sum = amount(totals[1]) + totals.slice(2).reduce((acc, t) => acc + amount(t), 0);
      expect(Math.abs(sum - amount(await text('#cqTotal'))) < 0.005, 'CPQ : le total n’est pas la somme des montants affichés');
      await page.fill('#cqW', '160'); await page.click('#cq-second'); await page.fill('#cqW', ''); await page.fill('#cqW', '180');
      expect(await page.isChecked('#cq-second'), 'CPQ : effacer puis retaper la largeur perd le deuxième plateau');
      await page.fill('#cqW', '300'); expect(!(await page.isHidden('#cqErr')) && (await text('#cqTotal')) === '—', 'CPQ : une largeur impossible laisse un total');
    }
    if (f === 'contact.html') {
      await page.click('#cSend'); expect((await page.getAttribute('#cName', 'aria-invalid')) === 'true', 'contact : le nom vide n’est pas signalé');
      await page.fill('#cName', 'Vérification'); await page.fill('#cMsg', 'Un mandat de tableau de bord pour trois régions.'); await page.click('#cSend'); await page.waitForTimeout(500);
      expect(!(await page.isHidden('#cThanks')), 'contact : pas d’état de remerciement après l’envoi');
    }
    if (f === 'coulisses.html') { expect(/pour 1/.test(await text('#metaContrast')), 'coulisses : le contraste n’est pas mesuré'); }
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
