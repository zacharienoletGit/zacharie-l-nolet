/**
 * Extrait CATALOG depuis src/data/articles.ts vers
 * backend/php/data/catalog.json — même contrat, même ids.
 */
const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../src/data/articles.ts');
const destPath = path.join(__dirname, '../backend/php/data/catalog.json');
const src = fs.readFileSync(srcPath, 'utf8');
const start = src.indexOf('[');
const end = src.lastIndexOf('];');
if (start < 0 || end < 0) {
  throw new Error('CATALOG introuvable dans articles.ts');
}
const arraySrc = src.slice(start, end + 1);
const catalog = new Function(`"use strict"; return (${arraySrc});`)();
if (!Array.isArray(catalog) || catalog.length === 0) {
  throw new Error('Catalogue vide');
}
fs.mkdirSync(path.dirname(destPath), { recursive: true });
fs.writeFileSync(destPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
process.stdout.write(`export ${catalog.length} articles → ${destPath}\n`);
