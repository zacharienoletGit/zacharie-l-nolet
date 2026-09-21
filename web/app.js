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
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
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
  if ($('toTop')) $('toTop').addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'auto' }); });

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

  /* Classeur partagé (zln-feuilles) : on relit le stockage avant chaque écriture, pour ne jamais écraser
     une feuille écrite par un autre onglet ; l’événement storage rafraîchit l’affichage. */
  const FEUILLES_KEY = 'zln-feuilles';
  const cleanFeuille = (n) => ({ title: n.title.slice(0, 120), body: n.body.slice(0, 2000), ...(typeof n.articleId === 'string' ? { articleId: n.articleId.slice(0, 40) } : {}) });
  const readFeuilles = (fallback) => {
    const stored = store.get(FEUILLES_KEY);
    return Array.isArray(stored)
      ? stored.filter(n => n && typeof n === 'object' && typeof n.title === 'string' && typeof n.body === 'string').map(cleanFeuille).slice(0, 60)
      : (fallback || []);
  };
  const sameFeuille = (a, b) => a.title === b.title && a.body === b.body && (a.articleId || '') === (b.articleId || '');
  const writeFeuilles = (mutate, fallback) => {
    const next = mutate(readFeuilles(fallback));
    return { saved: store.set(FEUILLES_KEY, next), next };
  };
  const onOtherTab = (fn) => window.addEventListener('storage', (e) => { if (e.key === FEUILLES_KEY || e.key === null) fn(); });

  /* ---------- Coulisses : la page se mesure elle-même ---------- */
  if ($('metaLoaded')) {
    const ko = (n) => (n / 1024).toLocaleString('fr-CA', { maximumFractionDigits: 0 }) + ' Ko';
    const measure = () => {
      const nav = performance.getEntriesByType('navigation')[0];
      const res = performance.getEntriesByType('resource');
      const mine = (u) => u.startsWith(location.origin) || u.startsWith('file:');
      const foreign = res.filter(r => !mine(r.name)).length;
      const bytes = res.concat(nav ? [nav] : []).reduce((t, r) => t + (r.transferSize || r.encodedBodySize || r.decodedBodySize || 0), 0);
      const n = res.length + (nav ? 1 : 0);
      $('metaLoaded').textContent = (n === 1 ? '1 fichier chargé, la page elle-même' : `${n} fichiers chargés, page comprise`) +
        (foreign ? `, dont ${foreign} depuis un autre site.` : ', tous depuis ce site.') +
        (bytes ? ` Poids total : ${ko(bytes)}.` : ' Poids non mesurable hors d’un serveur web.');
    };
    if (document.readyState === 'complete') measure(); else window.addEventListener('load', () => setTimeout(measure, 0));

    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const csp = cspMeta ? cspMeta.getAttribute('content') : '';
    const has = (d) => csp.split(';').map(x => x.trim()).find(x => x.startsWith(d + ' ')) || '';
    const said = [];
    if (has('connect-src').includes("'none'")) said.push('aucune connexion sortante');
    if (has('script-src') && !has('script-src').includes("'unsafe-inline'")) said.push('aucun script en ligne');
    if (has('style-src') && !has('style-src').includes("'unsafe-inline'")) said.push('aucun style en ligne');
    if (has('object-src').includes("'none'")) said.push('aucun objet embarqué');
    if (has('form-action').includes("'none'")) said.push('aucun envoi de formulaire vers un serveur');
    $('metaCsp').textContent = csp
      ? `Cette page déclare : ${said.join(', ')}. Politique complète : ${csp}`
      : 'Aucune politique trouvée dans l’en-tête de cette page.';

    const lum = (rgb) => {
      const m = rgb.match(/\d+(\.\d+)?/g);
      if (!m || m.length < 3) return null;
      const [r, g, b] = m.slice(0, 3).map(v => { const c = Number(v) / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (fg, bg) => { const a = lum(fg), b = lum(bg); return a === null || b === null ? null : ((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)); };
    const probe = document.createElement('span'); probe.className = 'muted'; probe.hidden = true; document.body.appendChild(probe);
    const cs = getComputedStyle(document.body), cm = getComputedStyle(probe);
    const r1 = ratio(cs.color, cs.backgroundColor), r2 = ratio(cm.color, cs.backgroundColor);
    probe.remove();
    const f = (x) => x === null ? 'non mesurable' : x.toLocaleString('fr-CA', { maximumFractionDigits: 1 }) + ' pour 1';
    $('metaContrast').textContent = `Texte courant sur le fond : ${f(r1)}. Texte secondaire sur le fond : ${f(r2)}.`;

    const reducedNow = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const vt = 'startViewTransition' in document && 'onpagereveal' in window;
    $('metaMotion').textContent = (reducedNow
      ? 'Vous avez demandé moins d’animations : les deux sont coupées sur ce site.'
      : 'Vos réglages permettent les animations : les deux du site sont actives.') +
      (vt ? ' Votre navigateur connaît les transitions de vue entre pages : le nom devrait glisser de l’accueil à la barre de navigation.' : ' Votre navigateur ne connaît pas encore les transitions de vue entre pages : la page change sans animation.');
  }



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


  function noteBlock(note, article) {
    const title = note.title.trim() || 'Sans titre';
    const link = article ? `\n_En marge de : ${article.title}_\n` : '\n';
    return `### ${title}\n${link}\n${note.body.trim() || '_Feuille vide._'}\n`;
  }

  function renderClasseurMarkdown(input) {
    const byId = new Map(input.articles.map(a => [a.id, a]));
    const lines = [
      '# Classeur — Ludovic Zacharie Nolet Gilbert',
      '',
      `Exporté le ${input.exportedAt}.`,
      '',
      'Mémoire locale. Rien n’est un fil social.',
      '',
    ];
    if (input.bookmarks.length) {
      lines.push('## Coupures', '');
      for (const mark of input.bookmarks) {
        const article = byId.get(mark.articleId);
        lines.push(`- ${article ? article.title : mark.articleId}`);
      }
      lines.push('');
    }
    if (!input.notes.length) {
      lines.push('## Notes', '', '_Aucune feuille._', '');
    } else {
      lines.push('## Notes', '');
      for (const note of input.notes) {
        lines.push(noteBlock(note, note.articleId ? byId.get(note.articleId) : undefined));
      }
    }
    return `${lines.join('\n').trim()}\n`;
  }

  function renderFeuillesMarkdown(notes, exportedAt) {
    const lines = [
      '# Classeur — Ludovic Zacharie Nolet Gilbert',
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


  /* ---------- Démo : le cahier, en version web, avec les fonctions de l’application ---------- */
  if ($('cahier')) {
    const cahier = $('cahier');
    const tabs = [...cahier.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(t => $(t.getAttribute('aria-controls')));
    const select = (tab, focus) => {
      tabs.forEach((t, i) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[i].hidden = !on;
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t, false));
      t.addEventListener('keydown', (e) => {
        const k = e.key;
        let j = null;
        if (k === 'ArrowRight') j = (i + 1) % tabs.length;
        else if (k === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
        else if (k === 'Home') j = 0;
        else if (k === 'End') j = tabs.length - 1;
        if (j !== null) { e.preventDefault(); select(tabs[j], true); }
      });
    });

    const clips = new Set();
    let feuilles = readFeuilles([]);
    let pendingArticle = null;
    const byId = (id) => CATALOG.find(a => a.id === id);
    const today = new Date();
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    $('chEdDate').value = iso(today);
    $('chDate').textContent = today.toLocaleDateString('fr-CA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const row = (a, i, list) => `<li>
      <span class="n">${String(i + 1).padStart(2, '0')}</span>
      <h4>${esc(a.title)}</h4>
      <p class="dek">${esc(a.dek)}</p>
      <p class="meta">${esc(SECTIONS[a.section] || a.section)} · ${esc(a.source)} · ${a.min} min</p>
      <div class="acts">
        <button class="btn small" type="button" id="${list}-clip-${esc(a.id)}" data-clip="${esc(a.id)}" aria-pressed="${clips.has(a.id)}" aria-label="${clips.has(a.id) ? 'Retirer la coupure' : 'Découper'} : ${esc(a.title)}">${clips.has(a.id) ? 'Découpé' : 'Découper'}</button>
        <button class="btn small" type="button" id="${list}-feuille-${esc(a.id)}" data-feuille="${esc(a.id)}" aria-label="Écrire une feuille sur : ${esc(a.title)}">Feuille</button>
      </div>
    </li>`;
    // Après un retrait dans le Classeur, le bouton activé disparaît : le focus va au bouton voisin, sinon au titre de la liste.
    const focusAfterRemoval = (listId, titleId, selector, index) => {
      if (document.activeElement && document.activeElement !== document.body) return;
      const buttons = [...$(listId).querySelectorAll(selector)];
      const target = buttons[Math.min(index, buttons.length - 1)] || $(titleId);
      if (target) target.focus();
    };
    const wire = (root) => {
      root.querySelectorAll('[data-clip]').forEach(b => b.addEventListener('click', () => {
        const id = b.dataset.clip;
        const inClasseur = root === $('chClips');
        const index = inClasseur ? [...root.querySelectorAll('[data-clip]')].indexOf(b) : -1;
        if (clips.has(id)) clips.delete(id); else clips.add(id);
        renderAll();
        if (inClasseur) focusAfterRemoval('chClips', 'chClipsTitle', '[data-clip]', index);
      }));
      root.querySelectorAll('[data-feuille]').forEach(b => b.addEventListener('click', () => {
        const a = byId(b.dataset.feuille);
        pendingArticle = a ? a.id : null;
        $('chNTitle').value = a ? a.title : '';
        select($('tab-classeur'), false);
        $('chNBody').focus();
      }));
    };
    const renderEdition = () => keepFocus(() => {
      const date = $('chEdDate').value || iso(today);
      const ed = fallbackEdition(CATALOG, date);
      $('chEdition').innerHTML = ed.map((a, i) => row(a, i, 'ed')).join('');
      wire($('chEdition'));
      $('chEdNote').textContent = `Édition du ${date} : ${ed.length} textes sur ${CATALOG.length}, choisis par empreinte de la date, les mêmes sur chaque appareil.`;
    });
    const renderResults = () => keepFocus(() => {
      const q = $('chQ').value;
      const sec = $('chSec').value;
      const found = filterArticles(CATALOG, q, sec);
      $('chResults').innerHTML = found.length ? found.map((a, i) => row(a, i, 'res')).join('') : '<li class="empty">Aucun texte. Essayez un autre mot, avec ou sans accent.</li>';
      wire($('chResults'));
      $('chQn').textContent = q.trim() ? `Requête normalisée : « ${normalizeQuery(q)} » · ${found.length} texte${found.length > 1 ? 's' : ''}` : `${found.length} textes`;
    });
    const renderClasseur = () => keepFocus(() => {
      const list = [...clips].map(byId).filter(Boolean);
      $('chClips').innerHTML = list.length ? list.map((a, i) => row(a, i, 'clip')).join('') : '<li class="empty">Aucune coupure. Découpez un texte dans l’Édition ou les Rubriques.</li>';
      wire($('chClips'));
      $('chNotes').innerHTML = feuilles.length
        ? feuilles.map((n, i) => { const a = n.articleId ? byId(n.articleId) : null; return `<li><span class="n">${String(i + 1).padStart(2, '0')}</span><h4>${esc(n.title.trim() || 'Sans titre')}</h4>${a ? `<p class="meta">En marge de : ${esc(a.title)}</p>` : ''}<p class="dek">${esc(n.body)}</p><div class="acts"><button class="btn small" type="button" id="chrm-${i}" data-rm="${i}" aria-label="Retirer la feuille : ${esc(n.title.trim() || 'Sans titre')}">Retirer</button></div></li>`; }).join('')
        : '<li class="empty">Aucune feuille. Écrivez-en une ci-dessous.</li>';
      $('chNotes').querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => {
        const gone = feuilles[Number(b.dataset.rm)];
        const r = writeFeuilles(cur => { const k = cur.findIndex(n => sameFeuille(n, gone)); return k >= 0 ? cur.filter((_, j) => j !== k) : cur; }, feuilles.filter(n => !sameFeuille(n, gone)));
        feuilles = r.saved ? readFeuilles(r.next) : feuilles.filter((_, j) => j !== Number(b.dataset.rm));
        $('chNStatus').textContent = r.saved ? 'Feuille retirée.' : 'Feuille retirée pour cette visite seulement : le navigateur refuse le stockage local.';
        const index = Number(b.dataset.rm);
        renderAll();
        focusAfterRemoval('chNotes', 'chNotesTitle', '[data-rm]', index);
      }));
      $('chCount').textContent = String(clips.size + feuilles.length);
      $('chKvTextes').textContent = String(CATALOG.length);
      $('chKvClips').textContent = String(clips.size);
      $('chKvNotes').textContent = String(feuilles.length);
    });
    const renderAll = () => { renderEdition(); renderResults(); renderClasseur(); };

    $('chEdDate').addEventListener('change', renderEdition);
    $('chQ').addEventListener('input', renderResults);
    $('chSec').addEventListener('change', renderResults);
    const chErr = $('chNErr');
    const showChErr = (msg) => { chErr.textContent = msg; chErr.hidden = !msg; $('chNBody').setAttribute('aria-invalid', String(Boolean(msg))); };
    $('chNoteForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const title = $('chNTitle').value.trim();
      const body = $('chNBody').value.trim();
      if (!body) { showChErr('Une feuille vide ne s’enregistre pas : écrivez au moins une ligne.'); $('chNBody').focus(); return; }
      if (feuilles.length >= 60) { showChErr('Soixante feuilles, c’est un classeur plein. Retirez-en avant d’en ajouter.'); return; }
      showChErr('');
      const note = cleanFeuille({ title, body, articleId: pendingArticle || undefined });
      const r = writeFeuilles(cur => cur.length >= 60 ? cur : cur.concat([note]), feuilles);
      feuilles = r.saved ? readFeuilles(r.next) : feuilles.concat([note]);
      pendingArticle = null;
      $('chNTitle').value = ''; $('chNBody').value = '';
      $('chNStatus').textContent = r.saved ? 'Feuille enregistrée dans votre navigateur.' : 'Feuille gardée pour cette visite seulement : le navigateur refuse le stockage local.';
      renderClasseur();
      $('chNTitle').focus();
    });
    $('chNBody').addEventListener('input', () => { if (!chErr.hidden && $('chNBody').value.trim()) showChErr(''); });
    $('chMd').addEventListener('click', () => {
      $('chMdOut').value = renderClasseurMarkdown({ notes: feuilles, bookmarks: [...clips].map(articleId => ({ articleId })), articles: CATALOG, exportedAt: new Date().toLocaleString('fr-CA', { dateStyle: 'long', timeStyle: 'short' }) });
      $('chMdOut').hidden = false;
      $('chMdOut').focus();
    });
    cahier.querySelectorAll('input[name="chSize"]').forEach(r => r.addEventListener('change', () => { cahier.dataset.size = r.value; }));
    $('chWelcomeBtn').addEventListener('click', () => {
      const w = $('chWelcome');
      w.hidden = !w.hidden;
      $('chWelcomeBtn').setAttribute('aria-expanded', String(!w.hidden));
    });
    $('chReset').addEventListener('click', () => {
      clips.clear();
      $('chQ').value = ''; $('chSec').value = '';
      $('chEdDate').value = iso(today);
      cahier.dataset.size = 'lecture';
      cahier.querySelector('input[name="chSize"][value="lecture"]').checked = true;
      renderAll();
      $('chResetMsg').textContent = 'Coupures et réglages remis à zéro. Vos feuilles restent dans votre navigateur.';
    });
    onOtherTab(() => { feuilles = readFeuilles(feuilles); renderClasseur(); });
    renderAll();
  }


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

  const show = (id, fns, note) => {
    $(id).textContent = (note ? note + '\n\n' : '') + fns.map(f => f.toString().replace(/\n {2}/g, '\n')).join('\n\n');
  };


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
    const renderTable = () => {
      $('dRows').innerHTML = rows.map((r, i) => `<tr><td>${esc(r.m)}</td><td class="num"><input type="number" id="dx${i}" value="${r.x}" min="0" max="1000" step="0.5" aria-label="${esc(r.m)}, publicité en milliers de dollars" aria-describedby="dRegErr"></td><td class="num"><input type="number" id="dy${i}" value="${r.y}" min="0" max="100000" step="1" aria-label="${esc(r.m)}, ventes en milliers de dollars" aria-describedby="dRegErr"></td></tr>`).join('');
      $('dRows').querySelectorAll('input').forEach(el => el.addEventListener('input', renderReg));
    };
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
      $('dRegVerdict').textContent = outlier
        ? `Un seul mois hors norme change tout : r passe de ${f1(linreg(BASE.map(b => b[0]), BASE.map(b => b[1])).r)} à ${f1(m.r)}. On regarde les points avant de croire le chiffre.`
        : 'Une corrélation forte ne dit pas qui cause quoi : publicité et ventes peuvent monter ensemble parce que c’est la haute saison. Ajoutez un mois hors norme pour voir le chiffre plier.';
      drawChart(xs, ys, m, pred, spend);
    };
    const drawChart = (xs, ys, m, pred, spend) => {
      const W = 560, H = 320, L = 52, R = 30, T = 16, B = 44;
      const allX = xs.concat(pred !== null ? [spend] : []), allY = ys.concat(pred !== null ? [pred] : []);
      const x0 = 0, x1 = Math.max(...allX) * 1.1 || 1, y0 = 0, y1 = Math.max(...allY) * 1.1 || 1;
      const sx = (v) => L + ((v - x0) / (x1 - x0)) * (W - L - R), sy = (v) => H - B - ((v - y0) / (y1 - y0)) * (H - T - B);
      const ticks = (max, n) => Array.from({ length: n + 1 }, (_, i) => Math.round((max / n) * i));
      const svg = [`<svg viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="dChartTitle" class="chart"><title id="dChartTitle">Nuage de points : publicité en abscisse, ventes en ordonnée, avec la droite ajustée</title>`];
      for (const t of ticks(y1, 4)) svg.push(`<line class="grid" x1="${L}" x2="${W - R}" y1="${sy(t)}" y2="${sy(t)}"/><text class="tick" x="${L - 8}" y="${sy(t) + 4}" text-anchor="end">${t}</text>`);
      for (const t of ticks(x1, 4)) svg.push(`<text class="tick" x="${sx(t)}" y="${H - B + 18}" text-anchor="middle">${t}</text>`);
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
      if (q.errors.length) { $('cqLines').innerHTML = ''; $('cqTotals').innerHTML = ''; $('cqTotal').textContent = '—'; lastQuote = null; return; }
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
    $('cqCopy').addEventListener('click', copyWith($('cqCopy'), $('cqMsg'), quoteText, 'Devis copié dans le presse-papiers.'));
    render(null);
    show('srcCq', [resolveOptions, buildQuote], '// CQ : plateau au cm², trois matériaux, six options, quatre règles, paliers de remise, livraison, TPS et TVQ');
  }

  if (!$('q')) return;

  /* ---------- Sources affichées : le code montré est le code exécuté ---------- */
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
    const tl = $('tLocal').value;
    const tr = $('tRemote').value;
    const out0 = $('mergeOut');
    const okL = /^\d{2}:\d{2}$/.test(tl);
    const okR = /^\d{2}:\d{2}$/.test(tr);
    $('tLocal').setAttribute('aria-invalid', String(!okL));
    $('tRemote').setAttribute('aria-invalid', String(!okR));
    if (!okL || !okR) {
      out0.className = 'verdict';
      out0.textContent = 'Indiquez les deux heures pour voir qui gagne.';
      return;
    }
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
  const readNum = (id) => { const raw = $(id).value.trim(); if (raw === '') return NaN; const v = Number(raw); return Number.isFinite(v) ? v : NaN; };
  const renderRatio = () => {
    const err = $('ratioErr');
    const raw = ratioIds.map(([a, b]) => ({ onTime: readNum(a), total: readNum(b) }));
    // Des dénombrements : entiers, bornés, et jamais plus de livraisons à temps que de livraisons. Chaque case est jugée seule.
    const count = (v, min) => Number.isInteger(v) && v >= min && v <= 1000000;
    const invalid = raw.map(r => ({
      onTime: !count(r.onTime, 0) || (count(r.total, 1) && r.onTime > r.total),
      total: !count(r.total, 1) || (count(r.onTime, 0) && r.onTime > r.total),
    }));
    ratioIds.forEach(([a, b], i) => { $(a).setAttribute('aria-invalid', String(invalid[i].onTime)); $(b).setAttribute('aria-invalid', String(invalid[i].total)); });
    const badRow = invalid.findIndex(x => x.onTime || x.total);
    if (badRow >= 0) {
      err.textContent = 'Une ligne est incomplète ou impossible : des nombres entiers, un total entre 1 et 1 000 000 et au moins égal aux livraisons à temps.';
      err.hidden = false;
      document.querySelectorAll('#ratioTable [data-rate]').forEach(c => { c.textContent = '—'; });
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
  let notes = readFeuilles(SEED.slice());
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
      const gone = notes[Number(b.dataset.i)];
      const r = writeFeuilles(cur => { const k = cur.findIndex(n => sameFeuille(n, gone)); return k >= 0 ? cur.filter((_, j) => j !== k) : cur; }, notes.filter(n => !sameFeuille(n, gone)));
      const saved = r.saved;
      notes = saved ? readFeuilles(r.next) : notes.filter((_, j) => j !== Number(b.dataset.i));
      renderNotes();
      $('nStatus').textContent = saved ? 'Note retirée.' : 'Note retirée pour cette visite seulement : le navigateur refuse le stockage local.';
      if (!document.activeElement || document.activeElement === document.body) { const left = $('nList').querySelectorAll('.x'); (left[Math.min(Number(b.dataset.i), left.length - 1)] || $('nTitle')).focus(); }
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
    const note = cleanFeuille({ title, body });
    const r = writeFeuilles(cur => cur.length >= 60 ? cur : cur.concat([note]), notes);
    const saved = r.saved;
    notes = saved ? readFeuilles(r.next) : notes.concat([note]);
    $('nTitle').value = '';
    $('nBody').value = '';
    renderNotes();
    $('nStatus').textContent = saved ? 'Note enregistrée.' : 'Note gardée pour cette visite seulement : le navigateur refuse le stockage local.';
    $('nTitle').focus();
  });
  $('nBody').addEventListener('input', () => { if (!nErr.hidden && $('nBody').value.trim()) showNErr(''); });
  onOtherTab(() => { notes = readFeuilles(notes); renderNotes(); });
  renderNotes();
  $('mdCopy').addEventListener('click', copyWith($('mdCopy'), $('mdMsg'), () => $('mdOut').value, 'Copié dans le presse-papiers.'));
})();
