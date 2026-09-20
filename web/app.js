(function () {
  'use strict';
  document.documentElement.classList.add('js');
  /* Adresse de contact : une seule constante, reprise partout. */
  const CONTACT_EMAIL = '2012487@etudiant.cegepvicto.ca';
  const $ = (id) => document.getElementById(id);
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Données du dépôt ---------- */
  const CATALOG = [{"id":"a-01","slug":"ledition-contre-le-fil","title":"L’édition contre le fil","dek":"Un cahier de dix textes n’est pas un réseau social. C’est une clôture volontaire.","section":"philosophie","source":"Cabinet ZLN","region":"CULTURE","min":6,"rank":1,"keywords":["édition","attention","lecture","réseaux"]},{"id":"a-02","slug":"local-first-memoire","title":"Local-first, ou la mémoire qui t’appartient","dek":"Un carnet hors-ligne n’est pas un repli. C’est une architecture.","section":"informatique","source":"Atelier","region":"TECH","min":7,"rank":2,"keywords":["local-first","sync","architecture","notes"]},{"id":"a-03","slug":"grain-avant-abstraction","title":"Le grain avant l’abstraction","dek":"Un écran de trop, une table de trop : le code commence par ce que tu comptes.","section":"programmation","source":"Atelier","region":"TECH","min":8,"rank":3,"keywords":["grain","modèle","react-native","contrat"]},{"id":"a-04","slug":"la-source-nest-pas-le-rapport","title":"La source n’est pas le rapport","dek":"Un tableau de bord qui se prend pour l’usine ment deux fois : au métier, et à lui-même.","section":"intelligence_affaires","source":"Décision","region":"TECH","min":7,"rank":4,"keywords":["grain","source","mart","méthode"]},{"id":"a-05","slug":"operationnel-pas-une-copie","title":"L’opérationnel n’est pas une copie","dek":"Un ERP vivant n’est pas un export. Le traiter comme un fichier, c’est déjà se tromper de grain.","section":"sage_x3","source":"Décision","region":"TECH","min":6,"rank":5,"keywords":["sage","erp","opérationnel","grain"]},{"id":"a-06","slug":"cloner-ne-pas-inventer","title":"Cloner, ne pas inventer","dek":"Un champ déjà certifié en production n’est pas une suggestion. C’est une frontière.","section":"nectari","source":"Décision","region":"TECH","min":6,"rank":6,"keywords":["nectari","netari","certifié","mesure"]},{"id":"a-07","slug":"horloge-pas-le-metier","title":"L’horloge n’est pas le métier","dek":"Jitterbit cadence. Il ne décide pas ce qu’est une commande, un lot, une vérité.","section":"jitterbit","source":"Décision","region":"TECH","min":6,"rank":7,"keywords":["jitterbit","intégration","idempotence","contrat"]},{"id":"a-08","slug":"un-ratio-ne-se-somme-pas","title":"Un ratio ne se somme pas","dek":"Power BI n’est pas coupable. La somme d’un pourcentage, si.","section":"power_bi","source":"Décision","region":"TECH","min":6,"rank":8,"keywords":["power bi","ratio","grain","étoile"]},{"id":"a-09","slug":"conversation-publique-hors-des-murs","title":"La conversation publique hors des murs","dek":"La politique québécoise n’a pas besoin d’un autre fil. Elle a besoin de phrases qui tiennent.","section":"politique_quebecoise","source":"Cité","region":"QC","min":6,"rank":9,"keywords":["québec","politique","assemblée","lecture"]},{"id":"a-10","slug":"forme-longue-hip-hop","title":"La forme longue dans un genre qu’on dit court","dek":"Le hip-hop n’est pas un extrait. C’est une archive orale avec des règles de vers.","section":"hip_hop","source":"Culture","region":"CULTURE","min":5,"rank":10,"keywords":["hip-hop","forme","archive","écoute"]},{"id":"a-11","slug":"cpq-regles-avant-ecran","title":"CPQ : les règles avant l’écran","dek":"Configurer un prix n’est pas un formulaire. C’est un graphe de contraintes.","section":"cpq","source":"Atelier","region":"TECH","min":7,"keywords":["cpq","règles","devis","contraintes"]},{"id":"a-12","slug":"vocabulaire-du-domaine","title":"Le vocabulaire est le domaine","dek":"Tant que « produit », « article » et « item » veulent trois choses, le logiciel mentira poliment.","section":"domaine_informatique","source":"Atelier","region":"TECH","min":6,"keywords":["domaine","vocabulaire","clé","modèle"]},{"id":"a-13","slug":"lire-le-monde-sans-alerte","title":"Lire le monde sans alerte","dek":"L’international n’est pas une notification. C’est une carte trop grande pour un pouce.","section":"nouvelles_internationales","source":"Monde","region":"INTL","min":5,"keywords":["international","contexte","alerte"]},{"id":"a-14","slug":"canada-hors-du-cycle","title":"Le Canada hors du cycle","dek":"Un pays n’est pas une « journée en politique ». C’est des institutions qui survivent aux fils.","section":"nouvelles_canadiennes","source":"Monde","region":"CA","min":5,"keywords":["canada","institutions","fédéral"]},{"id":"a-15","slug":"etats-unis-sans-la-chaine","title":"Les États-Unis sans la chaîne","dek":"Ôter le plateau télé d’un article américain, c’est déjà faire la moitié du travail.","section":"nouvelles_americaines","source":"Monde","region":"US","min":5,"keywords":["états-unis","média","procédure"]},{"id":"a-16","slug":"quebec-en-phrases-longues","title":"Le Québec en phrases longues","dek":"Les nouvelles québécoises méritent plus que le ton de la réplique.","section":"nouvelles_quebecoises","source":"Monde","region":"QC","min":5,"keywords":["québec","régions","presse"]},{"id":"a-17","slug":"pouvoir-sans-carte-mentale","title":"Le pouvoir sans carte mentale","dek":"La politique internationale n’est pas une galerie de visages. C’est des leviers.","section":"politique_internationale","source":"Cité","region":"INTL","min":6,"keywords":["géopolitique","leviers","institutions"]},{"id":"a-18","slug":"compromis-federal","title":"Le compromis fédéral n’est pas une faiblesse de caractère","dek":"La politique canadienne se lit mal si on y cherche des victoires nettes.","section":"politique_canadienne","source":"Cité","region":"CA","min":5,"keywords":["ottawa","fédéral","compétences"]},{"id":"a-19","slug":"tests-avant-le-theme","title":"Les tests avant le thème","dek":"Un écran beau et non testé redevient un fil : on ne sait plus ce qui a cassé.","section":"programmation","source":"Atelier","region":"TECH","min":6,"keywords":["tests","contrat","react-native"]},{"id":"a-20","slug":"marge-comme-methode","title":"La marge comme méthode","dek":"Annoter n’est pas collectionner. C’est décider qu’une phrase te servira plus tard.","section":"philosophie","source":"Cabinet ZLN","region":"CULTURE","min":6,"keywords":["notes","annotation","méthode"]},{"id":"a-21","slug":"modele-etoile-sans-poster","title":"Le modèle en étoile, sans le poster","dek":"Une dimension n’est pas un filtre joli. C’est une clé que tu peux défendre.","section":"power_bi","source":"Décision","region":"TECH","min":6,"keywords":["étoile","dimension","fait","réconciliation"]},{"id":"a-22","slug":"ville-et-syntaxe","title":"Une ville, une syntaxe","dek":"Le hip-hop change de grammaire selon le trottoir. L’extrait global l’efface.","section":"hip_hop","source":"Culture","region":"CULTURE","min":5,"keywords":["ville","syntaxe","écoute","archive"]}];
  const SECTIONS = {
    informatique: 'Informatique', programmation: 'Programmation', intelligence_affaires: "Intelligence d'affaires",
    domaine_informatique: "Domaine de l'informatique", sage_x3: 'Sage X3', nectari: 'Nectari', jitterbit: 'Jitterbit',
    cpq: 'CPQ', power_bi: 'Power BI', nouvelles_internationales: 'Nouvelles internationales',
    nouvelles_canadiennes: 'Nouvelles canadiennes', nouvelles_americaines: 'Nouvelles américaines',
    nouvelles_quebecoises: 'Nouvelles québécoises', politique_internationale: 'Politique internationale',
    politique_quebecoise: 'Politique québécoise', politique_canadienne: 'Politique canadienne',
    philosophie: 'Philosophie', hip_hop: 'Hip-hop',
  };
  const EDITION_SIZE = 10;

  /* ---------- Fonctions portées de src/domain (affichées telles quelles) ---------- */
  function normalizeQuery(query) {
    return query
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
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
      { id: 'r1', kind: 'requires', a: 'lampe', b: 'tiroir', text: 'La lampe exige le tiroir (le câblage y passe).' },
      { id: 'r2', kind: 'excludes', a: 'plateau', b: 'tiroir', text: 'Le plateau incliné exclut le tiroir (même volume).' },
      { id: 'r3', kind: 'discount', min: 2, pct: 10, text: 'Deux options ou plus : remise de 10 % sur les options.' },
    ],
  };

  function configure(selected) {
    const picked = new Set(selected);
    const trace = [];
    const disabled = new Set();
    for (const rule of CPQ.rules) {
      if (rule.kind === 'requires') {
        if (picked.has(rule.a) && !picked.has(rule.b)) {
          picked.add(rule.b);
          trace.push({ rule, state: 'fire', note: `${rule.b} ajouté automatiquement` });
        } else {
          trace.push({ rule, state: 'ok', note: 'satisfaite' });
        }
      }
      if (rule.kind === 'excludes') {
        if (picked.has(rule.a) && picked.has(rule.b)) {
          picked.delete(rule.b);
          trace.push({ rule, state: 'bad', note: `${rule.b} retiré : conflit` });
        } else {
          trace.push({ rule, state: 'ok', note: 'satisfaite' });
        }
        if (picked.has(rule.a)) disabled.add(rule.b);
        if (picked.has(rule.b)) disabled.add(rule.a);
      }
    }
    const options = CPQ.options.filter(o => picked.has(o.id));
    const optionsTotal = options.reduce((sum, o) => sum + o.price, 0);
    let discount = 0;
    for (const rule of CPQ.rules) {
      if (rule.kind === 'discount') {
        if (options.length >= rule.min) {
          discount = Math.round(optionsTotal * rule.pct) / 100;
          trace.push({ rule, state: 'fire', note: `${options.length} options : −${discount} $` });
        } else {
          trace.push({ rule, state: 'ok', note: `${options.length} option(s) : pas de remise` });
        }
      }
    }
    return { picked, disabled, options, optionsTotal, discount, total: CPQ.base.price + optionsTotal - discount, trace };
  }

  function renderGrilleMarkdown(lines, exportedAt) {
    const groups = { tenu: 'Tenu par une source', infere: 'Inféré', verifier: 'À vérifier' };
    const out = [
      '# Grille de lecture — Zacharie L. Nolet',
      '',
      `Exportée le ${exportedAt}.`,
      '',
      'Mémoire locale. Rien n’est un fil social.',
      '',
    ];
    for (const key of Object.keys(groups)) {
      const items = lines.filter(l => l.kind === key);
      out.push(`## ${groups[key]}`, '');
      out.push(...(items.length ? items.map(l => `- ${l.text}`) : ['_Rien._']), '');
    }
    return `${out.join('\n').trim()}\n`;
  }

  /* ---------- Affichage des sources (le code montré est le code exécuté) ---------- */
  const show = (id, fns) => { $(id).textContent = fns.map(f => f.toString().replace(/\n {2}/g, '\n')).join('\n\n'); };
  show('src1', [normalizeQuery, filterArticles]);
  show('src2', [hash32, fallbackEdition]);
  show('src3', [enqueue, entityKey, mergeNotes]);
  show('src4', [rateOfSums, averageOfRates]);
  show('src5', [configure]);
  show('src6', [renderGrilleMarkdown]);

  /* ---------- Utilitaires ---------- */
  const flash = (el) => { el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash'); };
  const fmtPct = (x) => (x * 100).toLocaleString('fr-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
  const fmtMoney = (x) => x.toLocaleString('fr-CA', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + ' $';
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } },
  };
  const todayCivil = () => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  };
  const shiftCivil = (civil, days) => {
    const [y, m, d] = civil.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d + days));
    return dt.toISOString().slice(0, 10);
  };
  const fmtCivil = (civil) => {
    const [y, m, d] = civil.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  /* ---------- Masthead ---------- */
  const today = $('today');
  today.textContent = fmtCivil(todayCivil());
  today.setAttribute('datetime', todayCivil());

  /* ---------- Lumière (thème) ---------- */
  const THEMES = [['system', 'Système'], ['light', 'Papier'], ['dark', 'Encre']];
  let themeIx = Math.max(0, THEMES.findIndex(t => t[0] === store.get('zln-theme')));
  const applyTheme = () => {
    const [id, label] = THEMES[themeIx];
    if (id === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', id);
    $('themeBtn').textContent = 'Lumière : ' + label;
  };
  applyTheme();
  $('themeBtn').addEventListener('click', () => {
    themeIx = (themeIx + 1) % THEMES.length;
    store.set('zln-theme', THEMES[themeIx][0]);
    applyTheme();
  });

  document.querySelectorAll('.skills .track i[data-w]').forEach(i => i.style.setProperty('--w', i.dataset.w));

  /* ---------- Révélations et compteurs ---------- */
  const animateCount = (el) => {
    const to = Number(el.dataset.to);
    if (reduced || !Number.isFinite(to)) { el.textContent = to; return; }
    const start = performance.now();
    const dur = 900;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(to * eased);
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('in');
        e.target.querySelectorAll('.skills').forEach(s => s.classList.add('in'));
        e.target.querySelectorAll('.count').forEach(animateCount);
        if (e.target.classList.contains('count')) animateCount(e.target);
        io.unobserve(e.target);
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    document.querySelectorAll('.reveal, .rule.draw, .facts').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal, .rule.draw, .skills').forEach(el => el.classList.add('in'));
  }

  /* ---------- 01 Recherche ---------- */
  const qs = $('qs');
  for (const [id, label] of Object.entries(SECTIONS)) {
    const o = document.createElement('option'); o.value = id; o.textContent = label; qs.appendChild(o);
  }
  const renderSearch = () => {
    const q = $('q').value;
    const hits = filterArticles(CATALOG, q, qs.value || undefined);
    const norm = normalizeQuery(q);
    $('qn').innerHTML = `Requête normalisée : <span class="mono">« ${esc(norm)} »</span> · ${hits.length} texte${hits.length > 1 ? 's' : ''} sur ${CATALOG.length}`;
    const out = $('qout');
    out.innerHTML = hits.length
      ? hits.map((a, i) => `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t">${esc(a.title)}</span><span class="s">${esc(SECTIONS[a.section])}</span></li>`).join('')
      : '<li class="empty">Rien. « Netari » ne trouve pas Nectari : la recherche corrige les accents, pas les fautes.</li>';
    flash(out);
  };
  $('q').addEventListener('input', renderSearch);
  qs.addEventListener('change', renderSearch);
  renderSearch();

  /* ---------- 02 Édition ---------- */
  const ed = $('ed');
  ed.value = todayCivil();
  const renderEdition = () => {
    const date = ed.value || todayCivil();
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
  const stamp = () => { clock += 1; return `2026-09-01T08:${String(10 + clock).padStart(2, '0')}:00-04:00`; };
  const renderOps = () => {
    $('qcount').textContent = ops.length === 0
      ? 'File vide. Chaque bouton crée une opération ; la même clé remplace au lieu de s’ajouter.'
      : `${ops.length} opération${ops.length > 1 ? 's' : ''} en file, dédupliquée${ops.length > 1 ? 's' : ''} par entité, clé et action.`;
    const out = $('qops');
    out.innerHTML = ops.length
      ? ops.map((op, i) => `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><span class="t t-mono">${esc(op.id)}</span><span class="s">${esc(op.entity)} · ${esc(op.action)}</span></li>`).join('')
      : '';
    flash(out);
  };
  $('opCut').addEventListener('click', () => { ops = enqueue(ops, makeOp('bookmark', 'upsert', { articleId: 'a-01', savedAt: stamp() }, stamp())); renderOps(); });
  $('opCut2').addEventListener('click', () => { ops = enqueue(ops, makeOp('bookmark', 'upsert', { articleId: 'a-05', savedAt: stamp() }, stamp())); renderOps(); });
  $('opNote').addEventListener('click', () => { ops = enqueue(ops, makeOp('note', 'upsert', { id: 'note_demo_001', articleId: 'a-01', title: 'Clôture volontaire', body: '…' }, stamp())); renderOps(); });
  $('opClear').addEventListener('click', () => { ops = []; renderOps(); });
  renderOps();

  const renderMerge = () => {
    const tl = $('tLocal').value || '08:14';
    const tr = $('tRemote').value || '08:20';
    const local = [{ id: 'note_demo_001', title: 'Clôture volontaire', body: 'Version appareil', updatedAt: `2026-09-01T${tl}:00-04:00` }];
    const remote = [{ id: 'note_demo_001', title: 'Clôture volontaire', body: 'Version serveur', updatedAt: `2026-09-01T${tr}:00-04:00` }];
    const [winner] = mergeNotes(local, remote);
    const out = $('mergeOut');
    const localWins = winner.body === 'Version appareil';
    out.className = 'verdict ' + (localWins ? 'good' : '');
    out.innerHTML = `<strong>${localWins ? 'L’appareil gagne' : 'Le serveur gagne'}</strong> · <span class="mono">updatedAt = ${esc(winner.updatedAt)}</span><br>${localWins ? 'La note locale est plus récente : la synchronisation ne l’écrase pas.' : 'Le serveur porte une écriture plus récente (ou égale) : il remplace la copie locale.'} Un seul objet sort de la fusion, jamais deux.`;
    flash(out);
  };
  $('tLocal').addEventListener('input', renderMerge);
  $('tRemote').addEventListener('input', renderMerge);
  renderMerge();

  /* ---------- 04 Ratio ---------- */
  const ratioIds = [['r1a', 'r1b'], ['r2a', 'r2b'], ['r3a', 'r3b']];
  const renderRatio = () => {
    const rows = ratioIds.map(([a, b]) => ({ onTime: Math.max(0, Number($(a).value) || 0), total: Math.max(0, Number($(b).value) || 0) }));
    const err = $('ratioErr');
    const badRow = ratioIds.findIndex(([a, b]) => Number($(a).value) < 0 || Number($(b).value) <= 0 || Number($(a).value) > Number($(b).value));
    ratioIds.forEach(([a, b], i) => { $(a).setAttribute('aria-invalid', String(i === badRow)); $(b).setAttribute('aria-invalid', String(i === badRow)); });
    if (badRow >= 0) {
      err.textContent = 'Une ligne est impossible : le total doit être supérieur à zéro et au moins égal aux livraisons à temps.';
      err.hidden = false;
      return;
    }
    err.hidden = true;
    const cells = document.querySelectorAll('#ratioTable [data-rate]');
    rows.forEach((r, i) => { cells[i].textContent = r.total ? fmtPct(r.onTime / r.total) : '—'; });
    const avg = averageOfRates(rows);
    const tru = rateOfSums(rows);
    $('rAvg').textContent = fmtPct(avg);
    $('rTrue').textContent = fmtPct(tru);
    const gap = (avg - tru) * 100;
    $('rGap').textContent = (gap >= 0 ? '+' : '−') + Math.abs(gap).toLocaleString('fr-CA', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' point' + (Math.abs(gap) >= 2 ? 's' : '') + ' de la moyenne sur le vrai taux';
    const v = $('rVerdict');
    const big = Math.abs(gap) >= 1;
    v.className = 'verdict ' + (big ? 'bad' : 'good');
    v.innerHTML = big
      ? `<strong>Le tableau de bord mentirait de ${Math.abs(gap).toLocaleString('fr-CA', { maximumFractionDigits: 1 })} point${Math.abs(gap) >= 2 ? 's' : ''}.</strong> Montréal pèse ${rows[1].total.toLocaleString('fr-CA')} livraisons ; la moyenne des taux lui donne le même poids qu’une région de ${rows[2].total.toLocaleString('fr-CA')}. Le grain est la livraison, pas la région.`
      : `<strong>Les volumes sont proches : l’écart est faible.</strong> Il réapparaît dès qu’une région pèse plus que les autres. La bonne mesure reste la somme des numérateurs sur la somme des dénominateurs.`;
    flash(v);
  };
  ratioIds.flat().forEach(id => $(id).addEventListener('input', renderRatio));
  renderRatio();

  /* ---------- 05 CPQ ---------- */
  let cpqSel = new Set(['lampe']);
  const renderCpq = () => {
    const r = configure([...cpqSel]);
    cpqSel = new Set(r.picked);
    const opts = $('cpqOpts');
    opts.innerHTML = CPQ.options.map(o => {
      const off = r.disabled.has(o.id) && !r.picked.has(o.id);
      return `<label class="opt ${off ? 'off' : ''}"><input type="checkbox" id="cpq-${o.id}" data-id="${o.id}" ${r.picked.has(o.id) ? 'checked' : ''} ${off ? 'disabled' : ''}><span>${esc(o.label)}</span><span class="price">+ ${fmtMoney(o.price)}</span></label>`;
    }).join('');
    opts.querySelectorAll('input').forEach(cb => cb.addEventListener('change', () => {
      if (cb.checked) cpqSel.add(cb.dataset.id); else cpqSel.delete(cb.dataset.id);
      renderCpq();
    }));
    $('cpqBase').textContent = `${CPQ.base.label} · ${fmtMoney(CPQ.base.price)}`;
    $('cpqOptions').textContent = r.options.length ? `${r.options.map(o => o.label).join(', ')} · ${fmtMoney(r.optionsTotal)}` : 'aucune';
    $('cpqDisc').textContent = r.discount ? `− ${fmtMoney(r.discount)}` : 'aucune';
    const total = $('cpqTotal');
    total.textContent = fmtMoney(r.total);
    flash(total);
    $('cpqRules').innerHTML = r.trace.map(t => `<li class="${t.state}"><span>${esc(t.rule.text)} <span class="muted">· ${esc(t.note)}</span></span></li>`).join('');
  };
  renderCpq();

  /* ---------- Cité : grille + 06 Markdown ---------- */
  const SEED = [
    { kind: 'tenu', text: 'Le projet de loi a été présenté à l’Assemblée nationale (Journal des débats).' },
    { kind: 'infere', text: 'L’opposition prépare des amendements pour l’étude détaillée en commission.' },
    { kind: 'verifier', text: 'Le délai entre l’adoption du principe et l’étude détaillée dépasse la moyenne des dernières sessions.' },
  ];
  let grille = Array.isArray(store.get('zln-grille')) ? store.get('zln-grille') : SEED.slice();
  const renderMd = () => {
    const md = renderGrilleMarkdown(grille, new Date().toLocaleString('fr-CA', { dateStyle: 'long', timeStyle: 'short' }));
    const ta = $('mdOut');
    ta.value = md;
    flash(ta);
  };
  const renderGrille = () => {
    for (const kind of ['tenu', 'infere', 'verifier']) {
      const ul = $('g-' + kind);
      const items = grille.map((l, i) => ({ l, i })).filter(x => x.l.kind === kind);
      ul.innerHTML = items.length
        ? items.map(x => `<li><span>${esc(x.l.text)}</span><button class="x" type="button" data-i="${x.i}" aria-label="Retirer">×</button></li>`).join('')
        : '<li class="empty">Rien.</li>';
    }
    document.querySelectorAll('#grille .x').forEach(b => b.addEventListener('click', () => {
      grille.splice(Number(b.dataset.i), 1);
      store.set('zln-grille', grille);
      renderGrille();
    }));
    renderMd();
  };
  const gErr = $('gErr');
  const showGErr = (msg) => { gErr.textContent = msg; gErr.hidden = !msg; $('gText').setAttribute('aria-invalid', String(Boolean(msg))); };
  $('gForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const text = $('gText').value.trim();
    if (!text) { showGErr('Écris une phrase avant d’annoter.'); $('gText').focus(); return; }
    if (text.length > 240) { showGErr('Une ligne de grille tient en 240 caractères. Coupe, ou fais-en deux.'); return; }
    if (grille.length >= 60) { showGErr('Soixante lignes, c’est un classeur, pas une grille. Retire des lignes avant d’en ajouter.'); return; }
    showGErr('');
    grille.push({ kind: $('gKind').value, text });
    store.set('zln-grille', grille);
    $('gText').value = '';
    renderGrille();
  });
  $('gText').addEventListener('input', () => { if (!gErr.hidden && $('gText').value.trim()) showGErr(''); });
  renderGrille();
  const copyWith = (btn, msg, getText, done) => async () => {
    btn.setAttribute('aria-busy', 'true');
    btn.disabled = true;
    try {
      await navigator.clipboard.writeText(getText());
      msg.textContent = done;
    } catch (e) {
      msg.textContent = 'Le presse-papiers est bloqué ici : sélectionne le texte et copie-le au clavier.';
    } finally {
      btn.removeAttribute('aria-busy');
      btn.disabled = false;
    }
    setTimeout(() => { msg.textContent = ''; }, 3000);
  };
  $('mdCopy').addEventListener('click', copyWith($('mdCopy'), $('mdMsg'), () => $('mdOut').value, 'Copié dans le presse-papiers.'));

  /* ---------- Contact ---------- */
  const mailto = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('Cahier de compétences');
  for (const id of ['ctaMail', 'mailBtn', 'stickyMail']) { $(id).href = mailto; }
  const mailLink = $('mailLink');
  mailLink.href = mailto;
  mailLink.textContent = CONTACT_EMAIL;
  $('mailCopy').addEventListener('click', copyWith($('mailCopy'), $('mailMsg'), () => CONTACT_EMAIL, 'Adresse copiée.'));
  $('toTop').addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

  /* ---------- Images : état de chargement ---------- */
  document.querySelectorAll('img.img-fade').forEach(img => {
    const mark = () => img.classList.add('loaded');
    if (img.complete && img.naturalWidth > 0) mark();
    else { img.addEventListener('load', mark, { once: true }); img.addEventListener('error', mark, { once: true }); }
  });

  /* ---------- Avis (aucun témoin) ---------- */
  const notice = $('notice');
  if (store.get('zln-notice') !== 'ok') notice.hidden = false;
  $('noticeOk').addEventListener('click', () => { notice.hidden = true; store.set('zln-notice', 'ok'); });

  /* ---------- Appel à l’action collant (mobile), après le masthead ---------- */
  const sticky = $('stickyCta');
  const masthead = document.querySelector('.masthead');
  const contact = $('contact');
  let stickyOn = false;
  const updateSticky = () => {
    const pastHero = masthead.getBoundingClientRect().bottom < 0;
    const atContact = contact.getBoundingClientRect().top < window.innerHeight;
    const want = pastHero && !atContact;
    if (want !== stickyOn) { stickyOn = want; sticky.hidden = !want; document.body.classList.toggle('has-sticky', want); }
  };
  window.addEventListener('scroll', updateSticky, { passive: true });
  window.addEventListener('resize', updateSticky);
  updateSticky();

  /* ---------- Cité : compétences 1867 ---------- */
  const COMPETENCES = [
    { q: 'Défense et milice', a: 'fed', ref: 'art. 91(7)' },
    { q: 'Monnaie et banques', a: 'fed', ref: 'art. 91(14) et 91(15)' },
    { q: 'Droit criminel', a: 'fed', ref: 'art. 91(27) ; les provinces administrent la justice (92(14))' },
    { q: 'Assurance-emploi', a: 'fed', ref: 'art. 91(2A), ajouté en 1940' },
    { q: 'Hôpitaux et santé', a: 'prov', ref: 'art. 92(7) ; Ottawa finance par le Transfert canadien en matière de santé' },
    { q: 'Éducation', a: 'prov', ref: 'art. 93' },
    { q: 'Municipalités', a: 'prov', ref: 'art. 92(8) : créatures des provinces' },
    { q: 'Propriété et droits civils', a: 'prov', ref: 'art. 92(13) ; le Code civil du Québec vit ici' },
    { q: 'Ressources naturelles non renouvelables', a: 'prov', ref: 'art. 92A, ajouté en 1982' },
    { q: 'Télécommunications', a: 'fed', ref: 'art. 92(10)a) et jurisprudence : ouvrages qui dépassent la province' },
    { q: 'Immigration', a: 'part', ref: 'art. 95 ; Accord Canada-Québec de 1991' },
    { q: 'Agriculture', a: 'part', ref: 'art. 95' },
    { q: 'Pensions de vieillesse', a: 'part', ref: 'art. 94A, prépondérance provinciale (d’où le RRQ)' },
    { q: 'Environnement', a: 'part', ref: 'aucun article ne le nomme : jurisprudence, dont le Renvoi sur la tarification de la pollution par les GES (2021)' },
  ];
  const LABELS = { fed: 'Fédéral', prov: 'Provincial', part: 'Partagé' };
  let answers = {};
  const renderQuiz = () => {
    const ul = $('quiz');
    ul.innerHTML = COMPETENCES.map((c, i) => {
      const given = answers[i];
      const why = given
        ? `<span class="why ${given === c.a ? 'right' : 'wrong'}">${given === c.a ? 'Juste' : 'Non : ' + LABELS[c.a]} · ${esc(c.ref)}</span>`
        : '';
      return `<li><span class="q">${esc(c.q)}</span><span class="choices">${Object.entries(LABELS).map(([k, l]) => `<button class="btn small" type="button" data-i="${i}" data-k="${k}" aria-pressed="${given === k}" ${given ? 'disabled' : ''}>${l}</button>`).join('')}</span>${why}</li>`;
    }).join('');
    ul.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      answers[Number(b.dataset.i)] = b.dataset.k;
      renderQuiz();
    }));
    const done = Object.keys(answers).length;
    const right = Object.entries(answers).filter(([i, k]) => COMPETENCES[i].a === k).length;
    const s = $('quizScore');
    if (!done) { s.className = 'verdict'; s.textContent = 'Aucune réponse encore.'; return; }
    s.className = 'verdict ' + (done === COMPETENCES.length ? (right >= 11 ? 'good' : 'bad') : '');
    s.innerHTML = `<strong>${right} sur ${done}</strong>${done < COMPETENCES.length ? ` · ${COMPETENCES.length - done} à répondre` : (right >= 11 ? ' · Tu peux lire Ottawa sans chercher des victoires nettes.' : ' · Relis les articles cités : le fédéral est une machine à compromis, pas un organigramme.')}`;
    if (done) flash(s);
  };
  $('quizReset').addEventListener('click', () => { answers = {}; renderQuiz(); });
  renderQuiz();

  /* ---------- Cité : étapes d’un projet de loi ---------- */
  const STEPS = [
    'Présentation du projet de loi',
    'Adoption du principe',
    'Étude détaillée en commission parlementaire',
    'Prise en considération du rapport de la commission',
    'Adoption du projet de loi',
    'Sanction par le lieutenant-gouverneur',
  ];
  let order = [];
  let placed = 0;
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a.some((v, i) => v !== i) ? a : shuffle(arr);
  };
  const renderSteps = () => {
    const ol = $('steps');
    ol.innerHTML = order.map((ix, pos) => {
      const isPlaced = ix < placed;
      return `<li><span class="n">${isPlaced ? String(ix + 1) : '·'}</span><button class="chip ${isPlaced ? 'placed' : ''}" type="button" data-ix="${ix}" ${isPlaced ? 'disabled' : ''}>${esc(STEPS[ix])}</button></li>`;
    }).join('');
    ol.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => {
      const ix = Number(b.dataset.ix);
      if (ix === placed) {
        placed += 1;
        order = [...order.filter(i => i < placed).sort((a, c) => a - c), ...order.filter(i => i >= placed)];
        renderSteps();
      } else {
        b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
        const out = $('stepsOut');
        out.className = 'verdict bad';
        out.textContent = `Pas encore : l’étape ${placed + 1} vient avant.`;
      }
    }));
    const out = $('stepsOut');
    if (placed === STEPS.length) { out.className = 'verdict good'; out.innerHTML = '<strong>Six sur six.</strong> Entre le principe et l’étude détaillée, il y a souvent des consultations en commission ; c’est là que les mémoires entrent.'; flash(out); }
    else if (placed === 0) { out.className = 'verdict'; out.textContent = 'Six étapes à placer.'; }
    else { out.className = 'verdict'; out.textContent = `${placed} sur 6 placée${placed > 1 ? 's' : ''}.`; }
  };
  const resetSteps = () => { placed = 0; order = shuffle(STEPS.map((_, i) => i)); renderSteps(); };
  $('stepsReset').addEventListener('click', resetSteps);
  resetSteps();

  /* ---------- Cité : leviers ---------- */
  const LEVIERS = [
    ['Sanctions ou embargos', 'qui peut bloquer quoi'],
    ['Alliances et blocs', 'qui dépend de qui'],
    ['Routes commerciales ou énergétiques', 'ce qui transite, et par où'],
    ['Cours de change ou dette', 'ce que coûte la décision'],
    ['Traités et clauses', 'ce qui est signé, et ce qui ne l’est pas'],
    ['Cours et tribunaux', 'qui peut invalider'],
    ['Cycle électoral', 'quelle institution survit au prochain vote'],
  ];
  const lev = $('levList');
  lev.innerHTML = LEVIERS.map((l, i) => `<label class="opt"><input type="checkbox" id="lev-${i}"><span>${esc(l[0])} <span class="muted">· ${esc(l[1])}</span></span></label>`).join('');
  const renderLeviers = () => {
    const n = lev.querySelectorAll('input:checked').length;
    const out = $('leviersOut');
    out.className = 'verdict ' + (n === 0 ? 'bad' : n >= 3 ? 'good' : '');
    out.innerHTML = n === 0
      ? '<strong>Tu as lu une scène.</strong> Des noms, un sommet, un regard. Rien à relire dans un classeur.'
      : n < 3
        ? `<strong>Un début de carte.</strong> ${n} levier${n > 1 ? 's' : ''} nommé${n > 1 ? 's' : ''}. Cherche qui peut bloquer quoi avant de te faire une opinion.`
        : `<strong>Une carte.</strong> ${n} leviers : ça se relit, ça se découpe, ça survit au cycle de nouvelles.`;
    flash(out);
  };
  lev.querySelectorAll('input').forEach(cb => cb.addEventListener('change', renderLeviers));
  renderLeviers();
})();
