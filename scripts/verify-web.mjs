// Vérification du site web/ avant chaque mise en ligne.
// Sert web/ localement, ouvre chaque page dans Chromium (bureau et 400 px) et refuse de publier si :
// titre, description ou canonique manquants ; débordement horizontal ; image sans texte de remplacement ;
// identifiant en double ; lien interne cassé ; erreur de console ou de script ; démonstrations muettes.
// Usage : node scripts/verify-web.mjs   (variables facultatives : PLAYWRIGHT_MODULE, CHROMIUM_PATH)
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

const pw = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
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
    const links = [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href'))
      .filter(h => h && !/^(https?:|mailto:|#)/.test(h) || (h && h.startsWith(site)))
      .map(h => (h.startsWith(site) ? h.slice(site.length) : h).replace(/[#?].*$/, ''));
    return {
      title: document.title, lang: document.documentElement.lang,
      description: document.querySelector('meta[name="description"]')?.content || '',
      canonical: document.querySelector('link[rel="canonical"]')?.href || '',
      wide: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      noAlt: [...document.images].filter(i => !i.hasAttribute('alt')).length,
      dup: [...new Set(dup)], links: [...new Set(links)],
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
  for (const n of noise) fail(f, n);

  // Les démonstrations doivent parler : une page muette est une page cassée.
  if (f === 'preuves.html') { const t = await page.textContent('#qn'); if (!/textes?/.test(t || '')) fail(f, 'la recherche n’affiche aucun résultat'); }
  if (f === 'demo.html') { const n = await page.evaluate(() => document.querySelectorAll('#chEdition li').length); if (n !== 10) fail(f, `édition de ${n} textes au lieu de 10`); }
  if (f === 'coulisses.html') { const t = await page.textContent('#metaContrast'); if (!/pour 1/.test(t || '')) fail(f, 'le contraste n’est pas mesuré'); }
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
