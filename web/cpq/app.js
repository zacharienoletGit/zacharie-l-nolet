(function () {
  'use strict';
  // Site CPQ : configurer, tarifer, soumettre. Le code affiché est le code exécuté.
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

  const copyWith = (btn, msg, getText, done) => async () => {
    btn.setAttribute('aria-busy', 'true');
    btn.disabled = true;
    try {
      await navigator.clipboard.writeText(getText());
      msg.textContent = done;
    } catch (e) {
      msg.textContent = 'Le presse-papiers est bloqué ici : sélectionnez le texte et copiez-le au clavier.';
    } finally {
      btn.removeAttribute('aria-busy');
      btn.disabled = false;
    }
    setTimeout(() => { msg.textContent = ''; }, 3000);
  };

  /* ---- CPQ complet : un poste de travail, des règles, un devis ---- */
  const CQ = {
    plateau: { perCm2: 0.032, min: { w: 80, d: 50 }, max: { w: 200, d: 90 } },
    materials: { erable: { label: 'Érable', factor: 1 }, noyer: { label: 'Noyer', factor: 1.35 }, stratifie: { label: 'Stratifié', factor: 0.7 } },
    options: {
      tiroir: { label: 'Tiroir', price: 85 }, lampe: { label: 'Lampe intégrée', price: 45 }, inclinable: { label: 'Plateau inclinable', price: 80 },
      cables: { label: 'Passe-câbles', price: 20 }, reglable: { label: 'Piètement réglable en hauteur', price: 220 }, second: { label: 'Deuxième plateau', price: 150 },
    },
    rules: [
      { id: 'r1', type: 'excludes', a: 'inclinable', b: 'tiroir', text: 'Le plateau inclinable exclut le tiroir (même volume).' },
      { id: 'r2', type: 'requires', a: 'lampe', b: 'tiroir', text: 'La lampe exige le tiroir (le câblage y passe).' },
      { id: 'r3', type: 'minWidth', a: 'second', width: 140, text: 'Le deuxième plateau exige 140 cm de largeur.' },
      { id: 'r4', type: 'tiers', text: 'Remise selon la quantité : 5 % dès 5, 10 % dès 10, 15 % dès 25.' },
    ],
    tiers: [[25, 0.15], [10, 0.10], [5, 0.05]],
    shipping: { retrait: ['Retrait à l’atelier', 0], quebec: ['Livraison au Québec', 60], hors: ['Livraison hors Québec', 140] },
    taxes: { tps: 0.05, tvq: 0.09975 },
  };

  function resolveOptions(selected, changed, width, cfg) {
    const picked = new Set(selected);
    const trace = [];
    for (const rule of cfg.rules) {
      if (rule.type === 'excludes' && picked.has(rule.a) && picked.has(rule.b)) {
        const loser = rule.a === changed ? rule.b : rule.a;
        picked.delete(loser);
        trace.push({ rule, state: 'fire', note: `${cfg.options[loser].label} retiré` });
      } else if (rule.type === 'requires' && picked.has(rule.a) && !picked.has(rule.b)) {
        const blocked = cfg.rules.some(r => r.type === 'excludes' && ((r.a === rule.b && picked.has(r.b)) || (r.b === rule.b && picked.has(r.a))));
        if (blocked && changed === rule.a) {
          for (const r of cfg.rules) if (r.type === 'excludes') for (const k of [r.a, r.b]) if (k !== rule.b && picked.has(k) && (r.a === rule.b || r.b === rule.b)) { picked.delete(k); trace.push({ rule: r, state: 'fire', note: `${cfg.options[k].label} retiré : ${cfg.options[rule.a].label} l’exige` }); }
          picked.add(rule.b); trace.push({ rule, state: 'fire', note: `${cfg.options[rule.b].label} ajouté` });
        } else if (blocked) {
          picked.delete(rule.a); trace.push({ rule, state: 'fire', note: `${cfg.options[rule.a].label} retirée : son tiroir est exclu` });
        } else {
          picked.add(rule.b); trace.push({ rule, state: 'fire', note: `${cfg.options[rule.b].label} ajouté automatiquement` });
        }
      } else if (rule.type === 'minWidth' && picked.has(rule.a) && width < rule.width) {
        picked.delete(rule.a);
        trace.push({ rule, state: 'fire', note: `${cfg.options[rule.a].label} retiré : ${width} cm` });
      } else if (rule.type !== 'tiers') {
        trace.push({ rule, state: 'ok', note: 'satisfaite' });
      }
    }
    return { picked, trace };
  }

  function buildQuote(cfg, input, changed) {
    const errors = [];
    const w = Number(input.width), d = Number(input.depth), qty = Number(input.qty);
    if (!Number.isFinite(w) || w < cfg.plateau.min.w || w > cfg.plateau.max.w) errors.push({ field: 'width', text: `Largeur entre ${cfg.plateau.min.w} et ${cfg.plateau.max.w} cm.` });
    if (!Number.isFinite(d) || d < cfg.plateau.min.d || d > cfg.plateau.max.d) errors.push({ field: 'depth', text: `Profondeur entre ${cfg.plateau.min.d} et ${cfg.plateau.max.d} cm.` });
    if (!Number.isInteger(qty) || qty < 1 || qty > 50) errors.push({ field: 'qty', text: 'Quantité entre 1 et 50.' });
    const mat = cfg.materials[input.material] || cfg.materials.erable;
    if (errors.length) return { errors, picked: new Set(input.options), trace: [], lines: [] };
    const { picked, trace } = resolveOptions(input.options, changed, w, cfg);
    const cents = (v) => Math.round(v * 100) / 100;
    const plateau = cents(w * d * cfg.plateau.perCm2 * mat.factor);
    const lines = [{ label: `Plateau ${mat.label} ${w} × ${d} cm`, unit: plateau }];
    for (const k of picked) lines.push({ label: cfg.options[k].label, unit: cfg.options[k].price });
    const unitTotal = cents(lines.reduce((t, l) => t + l.unit, 0));
    const subtotal = cents(unitTotal * qty);
    const tier = cfg.tiers.find(([min]) => qty >= min);
    const discountRate = tier ? tier[1] : 0;
    trace.push({ rule: cfg.rules.find(r => r.type === 'tiers'), state: discountRate ? 'fire' : 'ok', note: discountRate ? `${qty} postes : ${Math.round(discountRate * 100)} %` : `${qty} poste(s) : aucune remise` });
    const discount = cents(subtotal * discountRate);
    const shipping = cfg.shipping[input.shipping] || cfg.shipping.retrait;
    const taxable = cents(subtotal - discount + shipping[1]);
    const tps = cents(taxable * cfg.taxes.tps), tvq = cents(taxable * cfg.taxes.tvq);
    return { errors, picked, trace, lines, qty, unitTotal, subtotal, discountRate, discount, shipping, taxable, tps, tvq, total: cents(taxable + tps + tvq) };
  }

  /* ---------- CPQ complet : configurer, tarifer, soumettre ---------- */
  if ($('cq')) {
    let selected = new Set(['tiroir', 'lampe']);
    const money = (v) => v.toLocaleString('fr-CA', { style: 'currency', currency: 'CAD' });
    const readInput = () => ({
      width: $('cqW').value.trim(), depth: $('cqD').value.trim(), qty: $('cqQty').value.trim(),
      material: (document.querySelector('input[name="cqMat"]:checked') || {}).value || 'erable',
      shipping: $('cqShip').value, options: [...selected],
    });
    let lastQuote = null;
    const renderOptions = (picked) => keepFocus(() => {
      $('cqOpts').innerHTML = Object.entries(CQ.options).map(([k, o]) => `<label class="opt"><input type="checkbox" id="cq-${k}" data-opt="${k}" ${picked.has(k) ? 'checked' : ''}> ${esc(o.label)}<span class="price">+ ${money(o.price)}</span></label>`).join('');
      $('cqOpts').querySelectorAll('input').forEach(el => el.addEventListener('change', () => { const k = el.dataset.opt; if (el.checked) selected.add(k); else selected.delete(k); render(k); }));
    });
    const render = (changed) => {
      const q = buildQuote(CQ, readInput(), changed || null);
      if (!q.errors.length) selected = new Set(q.picked);
      renderOptions(q.picked);
      ['width', 'depth', 'qty'].forEach(f => $({ width: 'cqW', depth: 'cqD', qty: 'cqQty' }[f]).setAttribute('aria-invalid', String(q.errors.some(e => e.field === f))));
      $('cqErr').textContent = q.errors.map(e => e.text).join(' ');
      $('cqErr').hidden = !q.errors.length;
      $('cqTrace').innerHTML = q.trace.map(t => `<li class="${t.state}"><span>${esc(t.rule.text)} <span class="muted">· ${esc(t.note)}</span></span></li>`).join('');
      $('cqCopy').disabled = Boolean(q.errors.length);
      if (q.errors.length) { $('cqLines').innerHTML = ''; $('cqTotals').innerHTML = ''; $('cqTotal').textContent = '—'; $('cqMsg').textContent = ''; lastQuote = null; return; }
      lastQuote = q;
      $('cqLines').innerHTML = q.lines.map(l => `<tr><td>${esc(l.label)}</td><td class="num">${money(l.unit)}</td></tr>`).join('');
      const rows = [['Prix d’un poste', money(q.unitTotal)], [`× ${q.qty} poste(s)`, money(q.subtotal)]];
      if (q.discount) rows.push([`Remise ${Math.round(q.discountRate * 100)} %`, '− ' + money(q.discount)]);
      rows.push([q.shipping[0], money(q.shipping[1])], ['TPS 5 %', money(q.tps)], ['TVQ 9,975 %', money(q.tvq)]);
      $('cqTotals').innerHTML = rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
      $('cqTotal').textContent = money(q.total);
    };
    const quoteText = () => {
      const q = lastQuote; if (!q) return '';
      const L = [`Devis — poste de travail (exemple)`, `Date : ${new Date().toLocaleDateString('fr-CA', { dateStyle: 'long' })}`, ''];
      for (const l of q.lines) L.push(`${l.label} : ${money(l.unit)}`);
      L.push('', `Prix d’un poste : ${money(q.unitTotal)}`, `Quantité : ${q.qty}`, `Sous-total : ${money(q.subtotal)}`);
      if (q.discount) L.push(`Remise ${Math.round(q.discountRate * 100)} % : − ${money(q.discount)}`);
      L.push(`${q.shipping[0]} : ${money(q.shipping[1])}`, `TPS 5 % : ${money(q.tps)}`, `TVQ 9,975 % : ${money(q.tvq)}`, `Total : ${money(q.total)}`, '', 'Règles appliquées :');
      for (const t of q.trace) L.push(`- ${t.rule.text} ${t.note}`);
      return L.join('\n') + '\n';
    };
    ['cqW', 'cqD', 'cqQty'].forEach(id => $(id).addEventListener('input', () => render(null)));
    $('cqShip').addEventListener('change', () => render(null));
    document.querySelectorAll('input[name="cqMat"]').forEach(r => r.addEventListener('change', () => render(null)));
    const copyQuote = copyWith($('cqCopy'), $('cqMsg'), quoteText, 'Devis copié dans le presse-papiers.');
    $('cqCopy').addEventListener('click', () => { if (!lastQuote) { $('cqMsg').textContent = 'Aucun devis à copier : corrigez d’abord les champs en erreur.'; return; } copyQuote(); });
    render(null);
    show('srcCq', [resolveOptions, buildQuote], '// CQ : plateau au cm², trois matériaux, six options, quatre règles, paliers de remise, livraison, TPS et TVQ');
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
