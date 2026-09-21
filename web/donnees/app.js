(function () {
  'use strict';
  // Site Données : régression, corrélation, test A/B. Le code affiché est le code exécuté.
  document.documentElement.classList.add('js');
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  /* Re-rendre un bloc sans perdre le focus clavier. */
  const keepFocus = (render) => {
    const id = document.activeElement && document.activeElement.id;
    render();
    if (id && $(id)) $(id).focus();
  };
  const show = (id, fns, note) => {
    $(id).textContent = (note ? note + '\n\n' : '') + fns.map(f => f.toString().replace(/\n {2}/g, '\n')).join('\n\n');
  };

  /* ---- Données : écrites pour cette page, dans le même esprit ---- */
  function pearson(xs, ys) {
    const n = xs.length;
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    for (let i = 0; i < n; i += 1) {
      sxy += (xs[i] - mx) * (ys[i] - my);
      sxx += (xs[i] - mx) ** 2;
      syy += (ys[i] - my) ** 2;
    }
    return sxx === 0 || syy === 0 ? NaN : sxy / Math.sqrt(sxx * syy);
  }

  function linreg(xs, ys) {
    const n = xs.length;
    const mx = xs.reduce((a, b) => a + b, 0) / n;
    const my = ys.reduce((a, b) => a + b, 0) / n;
    let sxy = 0, sxx = 0;
    for (let i = 0; i < n; i += 1) {
      sxy += (xs[i] - mx) * (ys[i] - my);
      sxx += (xs[i] - mx) ** 2;
    }
    const slope = sxx === 0 ? NaN : sxy / sxx;
    const r = pearson(xs, ys);
    return { slope, intercept: my - slope * mx, r, r2: r * r };
  }

  function wilson(conv, n) {
    // Intervalle de Wilson à 95 % pour une proportion : reste valide à 0 % et à 100 %.
    const z = 1.96, p = conv / n, z2 = (z * z) / n;
    const centre = (p + z2 / 2) / (1 + z2);
    const half = (z * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n))) / (1 + z2);
    return [centre - half, centre + half];
  }

  function abTest(a, b) {
    // Différence de deux proportions, intervalle de Newcombe (à partir des bornes de Wilson).
    const pA = a.conv / a.n, pB = b.conv / b.n;
    const [loA, hiA] = wilson(a.conv, a.n), [loB, hiB] = wilson(b.conv, b.n);
    const diff = pB - pA;
    const low = diff - Math.sqrt((pB - loB) ** 2 + (hiA - pA) ** 2);
    const high = diff + Math.sqrt((hiB - pB) ** 2 + (pA - loA) ** 2);
    return { pA, pB, diff, low, high, decisive: low > 0 || high < 0 };
  }

  function sampleSizePerGroup(pA, pB) {
    // Deux proportions, risque de faux positif 5 % (bilatéral), puissance 80 %.
    const d = Math.abs(pB - pA);
    if (d === 0) return Infinity;
    const pbar = (pA + pB) / 2;
    const z = 1.96 * Math.sqrt(2 * pbar * (1 - pbar)) + 0.84 * Math.sqrt(pA * (1 - pA) + pB * (1 - pB));
    return Math.ceil((z * z) / (d * d));
  }

  /* ---------- Données : régression, puis test A/B, en direct ---------- */
  if ($('dRows')) {
    const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août'];
    const BASE = [[4, 50], [6, 64], [5, 52], [8, 71], [10, 80], [7, 69], [12, 97], [9, 74]];
    const OUTLIER = ['Décembre', [3, 120]];
    let rows = BASE.map(([x, y], i) => ({ m: MONTHS[i], x, y }));
    let outlier = false;
    const f1 = (v) => v.toLocaleString('fr-CA', { maximumFractionDigits: 2 });
    const kd = (v) => Math.round(v * 1000).toLocaleString('fr-CA') + ' $';
    const num = (id) => { const raw = $(id).value.trim(); if (raw === '') return NaN; const v = Number(raw); return Number.isFinite(v) ? v : NaN; };
    const renderTable = () => keepFocus(() => {
      $('dRows').innerHTML = rows.map((r, i) => `<tr><td>${esc(r.m)}</td><td class="num"><input type="number" id="dx${i}" value="${r.x}" min="0" max="1000" step="0.5" aria-label="${esc(r.m)}, publicité en milliers de dollars" aria-describedby="dRegErr"></td><td class="num"><input type="number" id="dy${i}" value="${r.y}" min="0" max="100000" step="1" aria-label="${esc(r.m)}, ventes en milliers de dollars" aria-describedby="dRegErr"></td></tr>`).join('');
      $('dRows').querySelectorAll('input').forEach(el => el.addEventListener('input', renderReg));
    });
    const renderReg = () => {
      const xs = [], ys = []; let bad = false;
      const okX = (v) => Number.isFinite(v) && v >= 0 && v <= 1000, okY = (v) => Number.isFinite(v) && v >= 0 && v <= 100000;
      rows.forEach((r, i) => { const x = num(`dx${i}`), y = num(`dy${i}`); const ok = okX(x) && okY(y); $(`dx${i}`).setAttribute('aria-invalid', String(!okX(x))); $(`dy${i}`).setAttribute('aria-invalid', String(!okY(y))); if (ok) { r.x = x; r.y = y; xs.push(x); ys.push(y); } else bad = true; });
      const m = bad || xs.length < 3 ? null : linreg(xs, ys);
      const flat = m && !Number.isFinite(m.r);
      $('dRegErr').textContent = bad ? 'Une case est vide ou hors limites (publicité de 0 à 1 000, ventes de 0 à 100 000) : corrigez-la pour voir le résultat.' : flat ? 'Une colonne ne varie pas : la corrélation n’existe pas. Donnez des valeurs différentes d’un mois à l’autre.' : '';
      $('dRegErr').hidden = !(bad || flat);
      if (bad || xs.length < 3 || flat) { $('dRegOut').textContent = bad ? 'Aucun résultat tant qu’une case est impossible.' : 'Aucun résultat tant qu’une colonne est constante.'; $('dRegVerdict').textContent = ''; $('dChart').innerHTML = ''; return; }
      const spendRaw = num('dSpend');
      const spendBad = $('dSpend').value.trim() !== '' && !okX(spendRaw);
      $('dSpend').setAttribute('aria-invalid', String(spendBad));
      if (spendBad) { $('dRegErr').textContent = 'La dépense de prévision doit être entre 0 et 1 000.'; $('dRegErr').hidden = false; }
      const spend = spendBad ? NaN : spendRaw;
      const pred = Number.isFinite(spend) ? m.intercept + m.slope * spend : null;
      $('dRegOut').textContent = `Corrélation r = ${f1(m.r)}. Chaque tranche de 1 000 $ de publicité en plus va avec ${kd(m.slope)} de ventes en plus. R² = ${f1(m.r2)} : la publicité « explique » ${Math.round(m.r2 * 100)} % des variations` +
        (pred !== null ? `. Avec ${f1(spend)} k$ de publicité, le modèle prévoit ${kd(pred)} de ventes.` : '.');
      const before = outlier && xs.length > 3 ? linreg(xs.slice(0, -1), ys.slice(0, -1)) : null;
      $('dRegVerdict').textContent = outlier
        ? (before && Number.isFinite(before.r)
          ? `Un seul mois hors norme change tout : sans lui, avec vos lignes actuelles, r vaut ${f1(before.r)} ; avec lui, ${f1(m.r)}. On regarde les points avant de croire le chiffre.`
          : `Le mois hors norme est compté dans r = ${f1(m.r)}. On regarde les points avant de croire le chiffre.`)
        : 'Une corrélation forte ne dit pas qui cause quoi : publicité et ventes peuvent monter ensemble parce que c’est la haute saison. Ajoutez un mois hors norme pour voir le chiffre plier.';
      drawChart(xs, ys, m, pred, spend);
    };
    const drawChart = (xs, ys, m, pred, spend) => {
      const W = 560, H = 320, L = 52, R = 30, T = 16, B = 44;
      const allX = xs.concat(pred !== null ? [spend] : []), allY = ys.concat(pred !== null ? [pred] : []);
      // L’échelle part de zéro, mais descend sous zéro si une prévision y tombe : rien ne sort du cadre.
      const x0 = 0, x1 = Math.max(...allX) * 1.1 || 1, y0 = Math.min(0, Math.min(...allY) * 1.1), y1 = Math.max(...allY) * 1.1 || 1;
      const sx = (v) => L + ((v - x0) / (x1 - x0)) * (W - L - R), sy = (v) => H - B - ((v - y0) / (y1 - y0)) * (H - T - B);
      const ticks = (min, max, n) => Array.from({ length: n + 1 }, (_, i) => Math.round(min + ((max - min) / n) * i));
      const svg = [`<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="dChartTitle" class="chart"><title id="dChartTitle">Nuage de points : publicité en abscisse, ventes en ordonnée, avec la droite ajustée</title>`];
      for (const t of ticks(y0, y1, 4)) svg.push(`<line class="grid" x1="${L}" x2="${W - R}" y1="${sy(t)}" y2="${sy(t)}"/><text class="tick" x="${L - 8}" y="${sy(t) + 4}" text-anchor="end">${t}</text>`);
      for (const t of ticks(x0, x1, 4)) svg.push(`<text class="tick" x="${sx(t)}" y="${H - B + 18}" text-anchor="middle">${t}</text>`);
      svg.push(`<text class="axis" x="${(L + W - R) / 2}" y="${H - 6}" text-anchor="middle">Publicité (k$)</text><text class="axis" transform="translate(14 ${(T + H - B) / 2}) rotate(-90)" text-anchor="middle">Ventes (k$)</text>`);
      const xa = x0, xb = x1, xm = x1 * 0.45; svg.push(`<line class="fit" x1="${sx(xa)}" y1="${sy(m.intercept + m.slope * xa)}" x2="${sx(xb)}" y2="${sy(m.intercept + m.slope * xb)}"/><text class="fit-label" x="${sx(xm)}" y="${sy(m.intercept + m.slope * xm) - 12}" text-anchor="middle">Droite ajustée</text>`);
      const label = (x, y, text) => (x > W - 120 ? `<text class="dot-label" x="${x - 10}" y="${y + 4}" text-anchor="end">${text}</text>` : `<text class="dot-label" x="${x + 10}" y="${y + 4}">${text}</text>`);
      rows.forEach((r, i) => { if (!Number.isFinite(r.x)) return; const hot = outlier && i === rows.length - 1; svg.push(`<circle class="dot${hot ? ' hot' : ''}" cx="${sx(r.x)}" cy="${sy(r.y)}" r="5"><title>${esc(r.m)} : ${f1(r.x)} k$ de publicité, ${f1(r.y)} k$ de ventes</title></circle>` + (hot ? label(sx(r.x), sy(r.y), `${esc(r.m)}, hors norme`) : '')); });
      if (pred !== null) svg.push(`<circle class="dot pred" cx="${sx(spend)}" cy="${sy(pred)}" r="5"><title>Prévision : ${f1(spend)} k$ de publicité, ${f1(pred)} k$ de ventes</title></circle>` + label(sx(spend), sy(pred), 'Prévision'));
      svg.push('</svg>');
      $('dChart').innerHTML = svg.join('');
    };
    $('dOutlier').addEventListener('click', () => {
      outlier = !outlier;
      rows = outlier ? rows.concat([{ m: OUTLIER[0], x: OUTLIER[1][0], y: OUTLIER[1][1] }]) : rows.slice(0, BASE.length);
      $('dOutlier').textContent = outlier ? 'Retirer le mois hors norme' : 'Ajouter un mois hors norme';
      $('dOutlier').setAttribute('aria-pressed', String(outlier));
      renderTable(); renderReg();
    });
    $('dSpend').addEventListener('input', renderReg);
    renderTable(); renderReg();

    const renderAb = () => {
      const a = { n: num('abNa'), conv: num('abXa') }, b = { n: num('abNb'), conv: num('abXb') };
      const count = (v) => Number.isInteger(v) && v >= 0 && v <= 10000000;
      const invalid = {
        abNa: !count(a.n) || a.n === 0, abXa: !count(a.conv) || (count(a.n) && a.conv > a.n),
        abNb: !count(b.n) || b.n === 0, abXb: !count(b.conv) || (count(b.n) && b.conv > b.n),
      };
      Object.entries(invalid).forEach(([id, bad]) => $(id).setAttribute('aria-invalid', String(bad)));
      let msg = '';
      if ([a.n, a.conv, b.n, b.conv].some(v => !count(v))) msg = 'Indiquez les quatre nombres : des entiers, de 0 à 10 000 000.';
      else if (a.n === 0 || b.n === 0) msg = 'Il faut au moins un visiteur dans chaque groupe.';
      else if (a.conv > a.n || b.conv > b.n) msg = 'Les conversions ne peuvent pas dépasser les visiteurs.';
      $('abErr').textContent = msg; $('abErr').hidden = !msg;
      if (msg) { $('abOut').textContent = 'Aucun résultat tant qu’un nombre est impossible.'; $('abVerdict').textContent = ''; return; }
      const t = abTest(a, b);
      const pct = (v) => (v * 100).toLocaleString('fr-CA', { maximumFractionDigits: 1 }) + ' %';
      const pts = (v) => (v * 100).toLocaleString('fr-CA', { maximumFractionDigits: 1, signDisplay: 'always' }) + ' point(s)';
      $('abOut').textContent = `A : ${pct(t.pA)}. B : ${pct(t.pB)}. Écart mesuré : ${pts(t.diff)}. L’écart réel se situe probablement entre ${pts(t.low)} et ${pts(t.high)} (fourchette à 95 %).`;
      const need = sampleSizePerGroup(t.pA, t.pB);
      $('abVerdict').textContent = t.decisive
        ? `L’écart tient : la fourchette ne contient pas zéro. Avec ${a.n.toLocaleString('fr-CA')} et ${b.n.toLocaleString('fr-CA')} visiteurs, on peut trancher.`
        : (t.diff === 0 ? 'Aucun écart mesuré.' : `L’écart peut être dû au hasard : la fourchette contient zéro. Pour confirmer un écart de cette taille, il faudrait environ ${need === Infinity ? '—' : need.toLocaleString('fr-CA')} visiteurs par groupe.`);
    };
    ['abNa', 'abXa', 'abNb', 'abXb'].forEach(id => $(id).addEventListener('input', renderAb));
    renderAb();
    show('srcD1', [pearson, linreg]);
    show('srcD2', [wilson, abTest, sampleSizePerGroup]);
  }




  /* Appel à l’action collant sur mobile : visible une fois le haut de page dépassé (aucune animation). */
  const sticky = $('stickyCta');
  if (sticky) {
    const anchor = document.querySelector('.page-head');
    let on = false;
    const update = () => {
      const want = anchor ? anchor.getBoundingClientRect().bottom < 0 : window.scrollY > 400;
      if (want !== on) { on = want; sticky.hidden = !want; document.body.classList.toggle('has-sticky', want); }
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
})();
