(function () {
  'use strict';
  document.documentElement.classList.add('js');
  if (document.getElementById('firstCta')) document.body.classList.add('home');
  const $ = (id) => document.getElementById(id);
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CONTACT_EMAIL = '2012487@etudiant.cegepvicto.ca';

  /* ---------- Utilitaires ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const flash = () => {};
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } },
  };
  /* Re-rendre un bloc sans perdre le focus clavier. */
  const keepFocus = (render) => {
    const id = document.activeElement && document.activeElement.id;
    render();
    if (id && $(id)) $(id).focus();
  };
  const fmtPct = (x) => (x * 100).toLocaleString('fr-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
  const fmtMoney = (x) => x.toLocaleString('fr-CA', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' $';
  const todayCivil = () => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  const shiftCivil = (civil, days) => {
    const [y, m, d] = civil.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
  };
  const fmtCivil = (civil) => {
    const [y, m, d] = civil.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
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

  /* ---------- Commun à toutes les pages ---------- */
  const today = $('today');
  if (today) today.textContent = fmtCivil(todayCivil());

  const animateCount = (el) => {
    const to = Number(el.dataset.to);
    if (reduced || !Number.isFinite(to)) { el.textContent = to; return; }
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / 900);
      el.textContent = Math.round(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        /* Sixième temps de l’ouverture : les compteurs partent quand les chiffres se sont posés. */
        const wait = document.body.classList.contains('home') && performance.now() < 4000 ? 1550 : 0;
        setTimeout(() => e.target.querySelectorAll('.count').forEach(animateCount), wait);
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('.facts').forEach(el => io.observe(el));
  }


  const notice = $('notice');
  if (notice) {
    if (store.get('zln-notice') !== 'ok') notice.hidden = false;
    $('noticeOk').addEventListener('click', () => { notice.hidden = true; store.set('zln-notice', 'ok'); });
  }

  const sticky = $('stickyCta');
  if (sticky) {
    const anchor = $('firstCta') || document.querySelector('.masthead, .page-head');
    let on = false;
    const update = () => {
      const want = anchor ? anchor.getBoundingClientRect().bottom < 0 : window.scrollY > 400;
      if (want !== on) { on = want; sticky.hidden = !want; document.body.classList.toggle('has-sticky', want); }
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Vidéo d’introduction : démarre muette quand elle est visible, s’arrête sinon ---------- */
  document.querySelectorAll('video[data-autoplay]').forEach(v => {
    if (reduced || !('IntersectionObserver' in window)) return;
    let userPaused = false;
    let scriptedPause = false;
    v.addEventListener('pause', () => {
      if (scriptedPause) { scriptedPause = false; return; }
      if (!v.ended) userPaused = true;
    });
    v.addEventListener('play', () => { userPaused = false; });
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !userPaused && v.paused) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
        else if (!e.isIntersecting && !v.paused) { scriptedPause = true; v.pause(); }
      }
    }, { threshold: 0.5 });
    io.observe(v);
  });

  if ($('mailCopy')) $('mailCopy').addEventListener('click', copyWith($('mailCopy'), $('mailMsg'), () => CONTACT_EMAIL, 'Adresse copiée.'));
  if ($('toTop')) $('toTop').addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

  /* ---------- Contact : un courriel préparé, pas un serveur ---------- */
  const cForm = $('cForm');
  if (cForm) {
    const fields = { name: $('cName'), org: $('cOrg'), kind: $('cKind'), msg: $('cMsg') };
    const errs = { name: $('cNameErr'), msg: $('cMsgErr') };
    const draft = store.get('zln-brouillon');
    if (draft && typeof draft === 'object') {
      for (const k of ['name', 'org', 'msg']) if (typeof draft[k] === 'string') fields[k].value = draft[k].slice(0, 2000);
      if (typeof draft.kind === 'string' && [...fields.kind.options].some(o => o.value === draft.kind)) fields.kind.value = draft.kind;
    }
    const saveDraft = () => store.set('zln-brouillon', { name: fields.name.value, org: fields.org.value, kind: fields.kind.value, msg: fields.msg.value });
    for (const f of Object.values(fields)) f.addEventListener('input', saveDraft);
    const setErr = (key, msg) => {
      errs[key].textContent = msg;
      errs[key].hidden = !msg;
      fields[key].setAttribute('aria-invalid', String(Boolean(msg)));
    };
    fields.name.addEventListener('input', () => { if (fields.name.value.trim()) setErr('name', ''); });
    fields.msg.addEventListener('input', () => { if (fields.msg.value.trim().length >= 20) setErr('msg', ''); });
    cForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = fields.name.value.trim();
      const msg = fields.msg.value.trim();
      let first = null;
      if (!name) { setErr('name', 'Indiquez votre nom.'); first = first || fields.name; } else setErr('name', '');
      if (msg.length < 20) { setErr('msg', 'Décrivez votre besoin en une ou deux phrases (au moins 20 caractères).'); first = first || fields.msg; } else setErr('msg', '');
      if (first) { first.focus(); return; }
      const org = fields.org.value.trim();
      const kind = fields.kind.options[fields.kind.selectedIndex].text;
      const subject = `${kind} — ${name}${org ? ' (' + org + ')' : ''}`;
      const body = `${msg}\n\n— ${name}${org ? ', ' + org : ''}`;
      const href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      const btn = $('cSend');
      btn.setAttribute('aria-busy', 'true');
      btn.disabled = true;
      window.location.href = href;
      setTimeout(() => {
        btn.removeAttribute('aria-busy');
        btn.disabled = false;
        cForm.hidden = true;
        const thanks = $('cThanks');
        thanks.hidden = false;
        $('cThanksLink').href = href;
        thanks.focus();
        store.set('zln-brouillon', null);
      }, 400);
    });
    $('cAgain').addEventListener('click', () => { $('cThanks').hidden = true; cForm.hidden = false; fields.msg.value = ''; fields.name.focus(); });
  }

  /* ======================================================================
     Preuves (page preuves.html seulement)
     ====================================================================== */
  if (!$('q')) return;

  /* Catalogue de démonstration : seulement les textes techniques du dépôt (11 sur 22). */
  const CATALOG = [{"id":"a-02","slug":"local-first-memoire","title":"Local-first, ou la mémoire qui t’appartient","dek":"Un carnet hors-ligne n’est pas un repli. C’est une architecture.","section":"informatique","source":"Atelier","region":"TECH","min":7,"rank":2,"keywords":["local-first","sync","architecture","notes"]},{"id":"a-03","slug":"grain-avant-abstraction","title":"Le grain avant l’abstraction","dek":"Un écran de trop, une table de trop : le code commence par ce que tu comptes.","section":"programmation","source":"Atelier","region":"TECH","min":8,"rank":3,"keywords":["grain","modèle","react-native","contrat"]},{"id":"a-04","slug":"la-source-nest-pas-le-rapport","title":"La source n’est pas le rapport","dek":"Un tableau de bord qui se prend pour l’usine ment deux fois : au métier, et à lui-même.","section":"intelligence_affaires","source":"Décision","region":"TECH","min":7,"rank":4,"keywords":["grain","source","mart","méthode"]},{"id":"a-05","slug":"operationnel-pas-une-copie","title":"L’opérationnel n’est pas une copie","dek":"Un ERP vivant n’est pas un export. Le traiter comme un fichier, c’est déjà se tromper de grain.","section":"sage_x3","source":"Décision","region":"TECH","min":6,"rank":5,"keywords":["sage","erp","opérationnel","grain"]},{"id":"a-06","slug":"cloner-ne-pas-inventer","title":"Cloner, ne pas inventer","dek":"Un champ déjà certifié en production n’est pas une suggestion. C’est une frontière.","section":"nectari","source":"Décision","region":"TECH","min":6,"rank":6,"keywords":["nectari","netari","certifié","mesure"]},{"id":"a-07","slug":"horloge-pas-le-metier","title":"L’horloge n’est pas le métier","dek":"Jitterbit cadence. Il ne décide pas ce qu’est une commande, un lot, une vérité.","section":"jitterbit","source":"Décision","region":"TECH","min":6,"rank":7,"keywords":["jitterbit","intégration","idempotence","contrat"]},{"id":"a-08","slug":"un-ratio-ne-se-somme-pas","title":"Un ratio ne se somme pas","dek":"Power BI n’est pas coupable. La somme d’un pourcentage, si.","section":"power_bi","source":"Décision","region":"TECH","min":6,"rank":8,"keywords":["power bi","ratio","grain","étoile"]},{"id":"a-11","slug":"cpq-regles-avant-ecran","title":"CPQ : les règles avant l’écran","dek":"Configurer un prix n’est pas un formulaire. C’est un graphe de contraintes.","section":"cpq","source":"Atelier","region":"TECH","min":7,"keywords":["cpq","règles","devis","contraintes"]},{"id":"a-12","slug":"vocabulaire-du-domaine","title":"Le vocabulaire est le domaine","dek":"Tant que « produit », « article » et « item » veulent trois choses, le logiciel mentira poliment.","section":"domaine_informatique","source":"Atelier","region":"TECH","min":6,"keywords":["domaine","vocabulaire","clé","modèle"]},{"id":"a-19","slug":"tests-avant-le-theme","title":"Les tests avant le thème","dek":"Un écran beau et non testé redevient un fil : on ne sait plus ce qui a cassé.","section":"programmation","source":"Atelier","region":"TECH","min":6,"keywords":["tests","contrat","react-native"]},{"id":"a-21","slug":"modele-etoile-sans-poster","title":"Le modèle en étoile, sans le poster","dek":"Une dimension n’est pas un filtre joli. C’est une clé que tu peux défendre.","section":"power_bi","source":"Décision","region":"TECH","min":6,"keywords":["étoile","dimension","fait","réconciliation"]}];
  const SECTIONS = {
    informatique: 'Informatique', programmation: 'Programmation', intelligence_affaires: "Intelligence d'affaires",
    domaine_informatique: "Domaine de l'informatique", sage_x3: 'Sage X3', nectari: 'Nectari', jitterbit: 'Jitterbit',
    cpq: 'CPQ', power_bi: 'Power BI',
  };
  const EDITION_SIZE = 10;

  /* ---- Portées telles quelles du TypeScript du dépôt (src/domain) ---- */
  function normalizeQuery(query) {
    return query
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  function filterArticles(articles, query, section) {
    const q = normalizeQuery(query);
    return articles.filter(article => {
      if (section && article.section !== section) {
        return false;
      }
      if (!q) {
        return true;
      }
      const hay = normalizeQuery(
        [
          article.title,
          article.dek,
          article.source,
          article.slug,
          SECTIONS[article.section],
          ...article.keywords,
        ].join(' '),
      );
      return hay.includes(q);
    });
  }

  function hash32(input) {
    let h = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function fallbackEdition(articles, date) {
    const scored = [...articles]
      .map(article => ({
        article,
        score: hash32(`${date}:${article.id}`),
      }))
      .sort((a, b) => a.score - b.score || a.article.id.localeCompare(b.article.id));

    return scored.slice(0, EDITION_SIZE).map(s => s.article);
  }

  function entityKey(op) {
    const payload = op.payload;
    return payload.id ?? payload.articleId ?? op.id;
  }

  function enqueue(ops, op) {
    const withoutDup = ops.filter(
      existing =>
        !(
          existing.entity === op.entity &&
          entityKey(existing) === entityKey(op) &&
          existing.action === op.action
        ),
    );
    return [...withoutDup, op];
  }

  function mergeNotes(local, remote) {
    const map = new Map();
    for (const note of local) {
      map.set(note.id, note);
    }
    for (const incoming of remote) {
      const current = map.get(incoming.id);
      if (!current || incoming.updatedAt >= current.updatedAt) {
        map.set(incoming.id, incoming);
      }
    }
    return [...map.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  function makeOp(entity, action, payload, updatedAt) {
    const key = entity === 'note' ? payload.id : payload.articleId;
    return { id: `${entity}:${action}:${key}:${updatedAt}`, entity, action, payload, updatedAt };
  }

  /* ---- Écrites pour cette page, dans le même esprit ---- */
  function rateOfSums(rows) {
    const onTime = rows.reduce((sum, r) => sum + r.onTime, 0);
    const total = rows.reduce((sum, r) => sum + r.total, 0);
    return total === 0 ? 0 : onTime / total;
  }

  function averageOfRates(rows) {
    const rates = rows.map(r => (r.total === 0 ? 0 : r.onTime / r.total));
    return rates.reduce((sum, r) => sum + r, 0) / rates.length;
  }

  const CPQ = {
    base: { label: 'Pupitre de lecture, chêne', price: 240 },
    options: [
      { id: 'tiroir', label: 'Tiroir', price: 45 },
      { id: 'lampe', label: 'Lampe intégrée', price: 60 },
      { id: 'plateau', label: 'Plateau incliné', price: 80 },
      { id: 'noyer', label: 'Finition noyer', price: 120 },
    ],
    rules: [
      { id: 'r1', kind: 'excludes', a: 'plateau', b: 'tiroir', text: 'Le plateau incliné exclut le tiroir (même volume).' },
      { id: 'r2', kind: 'requires', a: 'lampe', b: 'tiroir', text: 'La lampe exige le tiroir (le câblage y passe).' },
      { id: 'r3', kind: 'discount', min: 2, pct: 10, text: 'Deux options ou plus : remise de 10 % sur les options.' },
    ],
  };

  // `changed` : l'option que l'utilisateur vient de cocher. En cas de conflit, c'est elle qui gagne.
  function configure(selected, changed) {
    const picked = new Set(selected);
    const excluded = new Set();
    const trace = [];
    // 1. Exclusions : le conflit se règle en retirant l'option la plus ancienne, jamais celle qu'on vient de choisir.
    for (const rule of CPQ.rules.filter(r => r.kind === 'excludes')) {
      if (picked.has(rule.a) && picked.has(rule.b)) {
        const loser = rule.a === changed ? rule.b : rule.a;
        picked.delete(loser);
        trace.push({ rule, state: 'bad', note: `${loser} retiré : conflit` });
      } else {
        trace.push({ rule, state: 'ok', note: 'satisfaite' });
      }
      if (picked.has(rule.a)) excluded.add(rule.b);
      if (picked.has(rule.b)) excluded.add(rule.a);
    }
    // 2. Dépendances : on ajoute ce qui manque. Si c'est exclu, l'option qu'on vient de choisir
    //    fait tomber ce qui la bloque ; une option plus ancienne tombe elle-même.
    for (const rule of CPQ.rules.filter(r => r.kind === 'requires')) {
      if (!picked.has(rule.a)) { trace.push({ rule, state: 'ok', note: 'sans objet' }); continue; }
      if (picked.has(rule.b)) { trace.push({ rule, state: 'ok', note: 'satisfaite' }); continue; }
      if (excluded.has(rule.b)) {
        if (rule.a === changed) {
          const blockers = CPQ.rules.filter(r => r.kind === 'excludes' && ((r.a === rule.b && picked.has(r.b)) || (r.b === rule.b && picked.has(r.a)))).map(r => (r.a === rule.b ? r.b : r.a));
          blockers.forEach(b => { picked.delete(b); excluded.delete(rule.b); });
          picked.add(rule.b);
          trace.push({ rule, state: 'fire', note: `${blockers.join(', ')} retiré, ${rule.b} ajouté : ${rule.a} l'exige` });
        } else {
          picked.delete(rule.a);
          excluded.add(rule.a);
          trace.push({ rule, state: 'bad', note: `${rule.a} retiré : ${rule.b} est exclu` });
        }
      } else {
        picked.add(rule.b);
        trace.push({ rule, state: 'fire', note: `${rule.b} ajouté automatiquement` });
      }
    }
    // 3. Remise sur seuil.
    const options = CPQ.options.filter(o => picked.has(o.id));
    const optionsTotal = options.reduce((sum, o) => sum + o.price, 0);
    let discount = 0;
    for (const rule of CPQ.rules.filter(r => r.kind === 'discount')) {
      if (options.length >= rule.min) {
        discount = Math.round(optionsTotal * rule.pct) / 100;
        trace.push({ rule, state: 'fire', note: `${options.length} options : −${discount} $` });
      } else {
        trace.push({ rule, state: 'ok', note: `${options.length} option(s) : pas de remise` });
      }
    }
    return { picked, excluded, options, optionsTotal, discount, total: CPQ.base.price + optionsTotal - discount, trace };
  }

  function renderFeuillesMarkdown(notes, exportedAt) {
    const lines = [
      '# Classeur — Zacharie L. Nolet',
      '',
      `Exporté le ${exportedAt}.`,
      '',
      'Mémoire locale. Rien n’est un fil social.',
      '',
    ];
    if (!notes.length) {
      lines.push('## Notes', '', '_Aucune feuille._');
    }
    for (const note of notes) {
      const title = note.title.trim() || 'Sans titre';
      lines.push(`### ${title}`, '', note.body.trim() || '_Feuille vide._', '');
    }
    return `${lines.join('\n').trim()}\n`;
  }

  /* ---------- Sources affichées : le code montré est le code exécuté ---------- */
  const show = (id, fns, note) => {
    $(id).textContent = (note ? note + '\n\n' : '') + fns.map(f => f.toString().replace(/\n {2}/g, '\n')).join('\n\n');
  };
  show('src1', [normalizeQuery, filterArticles], '// SECTIONS : libellés des 9 rubriques techniques (src/data/sections.ts)');
  show('src2', [hash32, fallbackEdition], '// EDITION_SIZE = 10');
  show('src3', [enqueue, entityKey, mergeNotes]);
  show('src4', [rateOfSums, averageOfRates]);
  show('src5', [configure], '// CPQ : base, 4 options, 3 règles (voir la trace à droite)');
  show('src6', [renderFeuillesMarkdown]);

  /* ---------- 01 Recherche ---------- */
  const qs = $('qs');
  for (const [id, label] of Object.entries(SECTIONS)) {
    const o = document.createElement('option'); o.value = id; o.textContent = label; qs.appendChild(o);
  }
  const renderSearch = () => {
    const q = $('q').value;
    const hits = filterArticles(CATALOG, q, qs.value || undefined);
    $('qn').innerHTML = `Requête normalisée : <span class="mono">« ${esc(normalizeQuery(q))} »</span> · ${hits.length} texte${hits.length > 1 ? 's' : ''} sur ${CATALOG.length}`;
    $('qout').innerHTML = hits.length
      ? hits.map((a, i) => `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(a.title)}</span><span class="s">${esc(SECTIONS[a.section])}</span></li>`).join('')
      : '<li class="empty">Aucun résultat : la recherche corrige les accents et les majuscules, pas les fautes de frappe imprévues.</li>';
  };
  $('q').addEventListener('input', renderSearch);
  qs.addEventListener('change', renderSearch);
  renderSearch();

  /* ---------- 02 Édition ---------- */
  const ed = $('ed');
  ed.value = todayCivil();
  const renderEdition = () => {
    const date = /^\d{4}-\d{2}-\d{2}$/.test(ed.value) ? ed.value : todayCivil();
    const picked = fallbackEdition(CATALOG, date);
    $('edhash').innerHTML = `Édition du ${esc(fmtCivil(date))} · exemple : <span class="mono">hash32("${esc(date)}:a-01") = ${hash32(`${date}:a-01`)}</span>`;
    const out = $('edout');
    out.innerHTML = picked.map((a, i) => `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(a.title)}</span><span class="s">${esc(a.id)} · ${hash32(`${date}:${a.id}`)}</span></li>`).join('');
    flash(out);
  };
  ed.addEventListener('change', renderEdition);
  $('edPrev').addEventListener('click', () => { ed.value = shiftCivil(ed.value || todayCivil(), -1); renderEdition(); });
  $('edNext').addEventListener('click', () => { ed.value = shiftCivil(ed.value || todayCivil(), 1); renderEdition(); });
  renderEdition();

  /* ---------- 03 File de sync ---------- */
  let ops = [];
  let clock = 0;
  const stamp = () => {
    clock += 1;
    const minutes = 8 * 60 + 10 + clock;
    const p = (n) => String(n).padStart(2, '0');
    return `2026-09-01T${p(Math.floor(minutes / 60) % 24)}:${p(minutes % 60)}:00-04:00`;
  };
  const renderOps = () => {
    $('qcount').textContent = ops.length === 0
      ? 'File vide. Chaque bouton crée une opération ; refaire le même geste remplace l’opération au lieu de l’ajouter.'
      : `${ops.length} opération${ops.length > 1 ? 's' : ''} en attente, sans doublon.`;
    const out = $('qops');
    out.innerHTML = ops.map((op, i) => `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t t-mono">${esc(op.id)}</span><span class="s">${esc(op.entity)} · ${esc(op.action)}</span></li>`).join('');
    flash(out);
  };
  $('opCut').addEventListener('click', () => { ops = enqueue(ops, makeOp('bookmark', 'upsert', { articleId: 'a-01', savedAt: stamp() }, stamp())); renderOps(); });
  $('opCut2').addEventListener('click', () => { ops = enqueue(ops, makeOp('bookmark', 'upsert', { articleId: 'a-05', savedAt: stamp() }, stamp())); renderOps(); });
  $('opNote').addEventListener('click', () => { ops = enqueue(ops, makeOp('note', 'upsert', { id: 'note_demo_001', articleId: 'a-01', title: 'Clôture volontaire', body: '…' }, stamp())); renderOps(); });
  $('opClear').addEventListener('click', () => { ops = []; renderOps(); });
  renderOps();

  const renderMerge = () => {
    const tl = /^\d{2}:\d{2}$/.test($('tLocal').value) ? $('tLocal').value : '08:14';
    const tr = /^\d{2}:\d{2}$/.test($('tRemote').value) ? $('tRemote').value : '08:20';
    const local = [{ id: 'note_demo_001', title: 'Clôture volontaire', body: 'Version appareil', updatedAt: `2026-09-01T${tl}:00-04:00` }];
    const remote = [{ id: 'note_demo_001', title: 'Clôture volontaire', body: 'Version serveur', updatedAt: `2026-09-01T${tr}:00-04:00` }];
    const [winner] = mergeNotes(local, remote);
    const out = $('mergeOut');
    const localWins = winner.body === 'Version appareil';
    out.className = 'verdict ' + (localWins ? 'good' : '');
    out.innerHTML = `<strong>${localWins ? 'Le téléphone gagne' : 'Le serveur gagne'}</strong> · <span class="mono">updatedAt = ${esc(winner.updatedAt)}</span><br>${localWins ? 'La note du téléphone est plus récente : la synchronisation ne l’écrase pas.' : 'La version du serveur est plus récente (ou identique) : elle remplace celle du téléphone.'} Une seule version reste, jamais deux.`;
  };
  $('tLocal').addEventListener('input', renderMerge);
  $('tRemote').addEventListener('input', renderMerge);
  renderMerge();

  /* ---------- 04 Ratio ---------- */
  const ratioIds = [['r1a', 'r1b'], ['r2a', 'r2b'], ['r3a', 'r3b']];
  const readNum = (id) => { const v = Number($(id).value); return Number.isFinite(v) ? v : NaN; };
  const renderRatio = () => {
    const err = $('ratioErr');
    const raw = ratioIds.map(([a, b]) => ({ onTime: readNum(a), total: readNum(b) }));
    const badRow = raw.findIndex(r => !Number.isFinite(r.onTime) || !Number.isFinite(r.total) || r.onTime < 0 || r.total <= 0 || r.onTime > r.total || r.total > 1000000);
    ratioIds.forEach(([a, b], i) => { $(a).setAttribute('aria-invalid', String(i === badRow)); $(b).setAttribute('aria-invalid', String(i === badRow)); });
    if (badRow >= 0) {
      err.textContent = 'Une ligne est impossible : le total doit être entre 1 et 1 000 000, et au moins égal aux livraisons à temps.';
      err.hidden = false;
      document.querySelectorAll('#ratioTable [data-rate]').forEach((c, i) => { if (i === badRow) c.textContent = '—'; });
      $('rAvg').textContent = '—';
      $('rTrue').textContent = '—';
      $('rGap').textContent = 'Corrigez la ligne pour voir le calcul.';
      const v = $('rVerdict');
      v.className = 'verdict';
      v.textContent = 'Aucun résultat tant qu’une ligne est impossible.';
      return;
    }
    err.hidden = true;
    const rows = raw;
    const cells = document.querySelectorAll('#ratioTable [data-rate]');
    rows.forEach((r, i) => { cells[i].textContent = fmtPct(r.onTime / r.total); });
    const avg = averageOfRates(rows);
    const tru = rateOfSums(rows);
    $('rAvg').textContent = fmtPct(avg);
    $('rTrue').textContent = fmtPct(tru);
    const gap = (avg - tru) * 100;
    const gapTxt = Math.abs(gap).toLocaleString('fr-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    $('rGap').textContent = (gap >= 0 ? '+' : '−') + gapTxt + ' point' + (Math.abs(gap) >= 2 ? 's' : '') + ' de la moyenne sur le vrai taux';
    const v = $('rVerdict');
    const big = Math.abs(gap) >= 1;
    v.className = 'verdict ' + (big ? 'bad' : 'good');
    v.innerHTML = big
      ? `<strong>Le tableau de bord mentirait de ${gapTxt} point${Math.abs(gap) >= 2 ? 's' : ''}.</strong> Montréal pèse ${rows[1].total.toLocaleString('fr-CA')} livraisons ; la moyenne des taux lui donne le même poids qu’une région de ${rows[2].total.toLocaleString('fr-CA')}. Il faut compter les livraisons, pas les régions.`
      : `<strong>Les volumes sont proches : l’écart est faible.</strong> Il réapparaît dès qu’une région pèse plus que les autres. La bonne mesure reste : total des livraisons à temps divisé par total des livraisons.`;
  };
  ratioIds.flat().forEach(id => $(id).addEventListener('input', renderRatio));
  renderRatio();

  /* ---------- 05 CPQ ---------- */
  let cpqSel = new Set(['lampe']);
  let cpqChanged = 'lampe';
  const renderCpq = () => keepFocus(() => {
    const r = configure([...cpqSel], cpqChanged);
    cpqSel = new Set(r.picked);
    const opts = $('cpqOpts');
    opts.innerHTML = CPQ.options.map(o => {
      const off = r.excluded.has(o.id) && !r.picked.has(o.id);
      return `<label class="opt ${off ? 'off' : ''}" title="${off ? 'Incompatible avec la sélection actuelle : la cocher retire ce qui la bloque' : ''}"><input type="checkbox" id="cpq-${o.id}" data-id="${o.id}" ${r.picked.has(o.id) ? 'checked' : ''}><span>${esc(o.label)}</span><span class="price">+ ${fmtMoney(o.price)}</span></label>`;
    }).join('');
    opts.querySelectorAll('input').forEach(cb => cb.addEventListener('change', () => {
      if (cb.checked) cpqSel.add(cb.dataset.id); else cpqSel.delete(cb.dataset.id);
      cpqChanged = cb.checked ? cb.dataset.id : null;
      renderCpq();
    }));
    $('cpqBase').textContent = `${CPQ.base.label} · ${fmtMoney(CPQ.base.price)}`;
    $('cpqOptions').textContent = r.options.length ? `${r.options.map(o => o.label).join(', ')} · ${fmtMoney(r.optionsTotal)}` : 'aucune';
    $('cpqDisc').textContent = r.discount ? `− ${fmtMoney(r.discount)}` : 'aucune';
    const total = $('cpqTotal');
    total.textContent = fmtMoney(r.total);
    flash(total);
    $('cpqRules').innerHTML = r.trace.map(t => `<li class="${t.state}"><span>${esc(t.rule.text)} <span class="muted">· ${esc(t.note)}</span></span></li>`).join('');
  });
  renderCpq();

  /* ---------- 06 Feuilles et export Markdown ---------- */
  const SEED = [
    { title: 'Clôture volontaire', body: 'Observé : une édition a une fin.\nInférence : le fil n’en a pas.\nÀ valider : est-ce que dix textes me suffisent une semaine ?' },
    { title: 'Hors article', body: 'Une feuille libre n’a pas besoin d’une coupure. Le classeur n’est pas un bookmark manager.' },
  ];
  const stored = store.get('zln-feuilles');
  let notes = Array.isArray(stored)
    ? stored.filter(n => n && typeof n === 'object' && typeof n.title === 'string' && typeof n.body === 'string').map(n => ({ title: n.title.slice(0, 120), body: n.body.slice(0, 2000) })).slice(0, 60)
    : SEED.slice();
  const renderMd = () => {
    const ta = $('mdOut');
    ta.value = renderFeuillesMarkdown(notes, new Date().toLocaleString('fr-CA', { dateStyle: 'long', timeStyle: 'short' }));
    flash(ta);
  };
  const renderNotes = () => keepFocus(() => {
    const ul = $('nList');
    ul.innerHTML = notes.length
      ? notes.map((n, i) => `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(n.title.trim() || 'Sans titre')}</span><button class="x" type="button" id="nx-${i}" data-i="${i}" aria-label="Retirer la note ${esc(n.title.trim() || 'sans titre')}">×</button></li>`).join('')
      : '<li class="empty">Aucune note. Écrivez-en une.</li>';
    ul.querySelectorAll('.x').forEach(b => b.addEventListener('click', () => {
      notes.splice(Number(b.dataset.i), 1);
      store.set('zln-feuilles', notes);
      renderNotes();
      $('nStatus').textContent = 'Note retirée.';
    }));
    renderMd();
  });
  const nErr = $('nErr');
  const showNErr = (msg) => { nErr.textContent = msg; nErr.hidden = !msg; $('nBody').setAttribute('aria-invalid', String(Boolean(msg))); };
  $('nForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = $('nTitle').value.trim();
    const body = $('nBody').value.trim();
    if (!body) { showNErr('Une note vide ne s’enregistre pas : écrivez au moins une ligne.'); $('nBody').focus(); return; }
    if (notes.length >= 60) { showNErr('Soixante notes, c’est un classeur plein. Retirez-en avant d’en ajouter.'); return; }
    showNErr('');
    notes.push({ title: title.slice(0, 120), body: body.slice(0, 2000) });
    store.set('zln-feuilles', notes);
    $('nTitle').value = '';
    $('nBody').value = '';
    renderNotes();
    $('nStatus').textContent = 'Note enregistrée.';
    $('nTitle').focus();
  });
  $('nBody').addEventListener('input', () => { if (!nErr.hidden && $('nBody').value.trim()) showNErr(''); });
  renderNotes();
  $('mdCopy').addEventListener('click', copyWith($('mdCopy'), $('mdMsg'), () => $('mdOut').value, 'Copié dans le presse-papiers.'));
})();
