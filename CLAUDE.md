# CLAUDE.md — règles permanentes du dépôt

Ces règles viennent de Ludovic Zacharie Nolet Gilbert. Elles s’appliquent à toute session, à tout fichier, sans exception, et priment sur les habitudes par défaut.

## 0. Ce que Zacharie a demandé mot pour mot

- **Aucune marque d’IA dans les livrables.** Pas d’image générée par IA (le portrait « auréole » a été retiré du site, de `assets/brand/` et de l’icône iOS ; ne pas le réintroduire), pas de mention « généré par », « propulsé par » ni de crédit d’outil dans une page, un texte ou un visuel. Utiliser les photos qu’il fournit (`web/photo-*.jpg`, `web/exposat-2026.jpg`).
- **Respecter ce qu’il envoie.** Photos, captures, listes, textes : les utiliser tels quels, pas les remplacer par du contenu inventé ni les « améliorer » sans qu’il le demande. Ne pas inventer de dates, d’employeurs, de témoignages ou de chiffres.
- **Toujours coder selon les quatre listes ci-dessous**, tirées des reels Instagram qu’il a partagés (aj.on.ai, elvernlau, prms.regmi, murphmaxxing). Avant de livrer une page ou une app, passer chaque liste et corriger ce qui manque.
- **Site web : thème clair unique, sobre (« keep it simple »), aux couleurs de la marque du cahier (`docs/DESIGN.md`).** Fond papier `#F3EDE0`, texte encre `#0B1A28`, boutons et liens en encre, or **en filet seulement** `#C4A35A` (rangs et numéros en or encré `#7A5F22` pour le contraste), filets de liste `#D9CDB0`, Georgia + police système. Pas de mode sombre, pas de bouton de lumière, jamais d’or en aplat de bouton. Les visuels (image de partage, vidéo d’introduction, favicon) restent sur fond encre `#0B1A28` : ce sont des images, pas le thème.
- **Deux animations sur le site, pas une de plus, et les deux irréprochables.** (1) **L’ouverture de l’accueil** : une seule séquence de 2 s en six temps (la photo se dévoile de bas en haut, le nom sort du flou mot par mot, le filet se trace, la phrase et les boutons se posent, les compteurs comptent), en CSS pur, classes `.home` dans `style.css`. (2) **Le nom qui se transforme d’une page à l’autre** : le grand nom de l’accueil se réduit et glisse jusqu’à la marque de la barre de navigation par transition de vue entre documents (`view-transition-name: brand`), changement de page immédiat, sans animation, dans les navigateurs qui ne les prennent pas en charge. Aucun autre mouvement : pas de révélation au défilement, pas d’effet de survol animé, pas de flash, pas de fondu d’image. Tout est coupé par `prefers-reduced-motion`.
- App iPhone : encre de minuit `#0B1A28`, papier `#F3EDE0`, or en **filet** `#E0C378` / `#C4A35A`, vocabulaire du cahier (Découper, Feuille, Cabinet, Édition). Voir `docs/DESIGN.md`.
- Langue des livrables et des commentaires : français (Québec).
- **Le site web (`web/`) parle seulement d’informatique et d’embauche.** Pas de section politique, philosophie ou hip-hop : ces sujets restent dans le catalogue de l’app, pas sur le site. Le site est fait pour décrocher un stage, un contrat ou un mandat : chaque page mène vers `engagement.html` et `contact.html`.
- **Écrit pour un employeur, en langage clair.** Le site doit être attirant pour un employeur maintenant et compréhensible par tout le monde : vouvoiement, phrases courtes, aucun jargon sans explication (pas de « grain », « idempotent », « last-write-wins », « mart » sans une phrase « en clair » à côté). Chaque compétence est suivie de sa preuve. Le bouton principal de chaque page mène au contact.
- **Plusieurs pages, sans build.** `index.html`, `parcours.html`, `preuves.html`, `demo.html` (le cahier en version web, avec les fonctions de l’app), `engagement.html`, `coulisses.html` (le site expliqué et mesuré en direct, lié depuis le pied de page), `contact.html`, `cv.html`, plus `404.html`, `confidentialite.html`, `conditions.html`. Un seul `style.css`, un seul `app.js` (les démos ne tournent que si leurs éléments existent).
- **Deux sites distincts, autonomes, dans le même dépôt** : `web/donnees/` (science des données : régression, corrélation, test A/B, en direct) et `web/cpq/` (configurateur complet avec devis, règles, remises, taxes). Chacun a ses propres `index.html`, `style.css` (copie de celui du site principal, que `verify:web` exige identique), `app.js` (seulement son moteur et sa démonstration), `confidentialite.html`, `conditions.html`, `sitemap.xml`, `site.webmanifest`, icônes et `og-image.jpg`. Pas de `404.html` imbriquée : GitHub Pages ne sert que celle de la racine, qui mène aux deux sites. Les anciennes adresses `donnees.html` et `cpq.html` sont des pages de renvoi vers `donnees/` et `cpq/`. Ils ne stockent rien dans le navigateur. Générés par `sites.mjs` (carnet de session) ; le site principal les relie depuis Travailler ensemble, son plan du site et `robots.txt` ; `npm run verify:web` les vérifie avec le reste. L’adresse de contact est écrite dans le HTML et dans la constante `CONTACT_EMAIL` de `app.js` : changer les deux ensemble.

## Projets à venir

- La feuille de route est `docs/PROJETS.md` (deux projets par compétence, jalons, critères de « fini »). Un projet n’apparaît sur le site que **livré** (dépôt, vidéo, chiffres) ; rien de planifié n’est présenté comme fait. Quand un projet est livré, l’ajouter à `web/parcours.html` (section Projets) et au CV, puis regénérer le PDF.

## Vidéo (le site en contient : `web/video/`)

- Les clips sont de **vrais enregistrements** du site fait avec Chromium (script `record.mjs` du carnet de session, à refaire si les démos changent), jamais des animations décoratives ni des images de banque. Durée cible : 9 à 12 s.
- Format : **MP4 H.264** (yuv420p, `-crf 26`, `+faststart`), 1280 × 720, moins de 1,5 Mo par clip. Le WebM VP9 a été essayé et pesait plus lourd sur ces captures d’écran : on ne le sert pas.
- Chaque clip a une **affiche** (`.jpg`), des **sous-titres** WebVTT en français (`.fr.vtt`, piste `captions` par défaut) et une légende sous la vidéo. Jamais de sous-titres incrustés dans l’image.
- Balise : `controls muted playsinline preload="none" poster width height aria-label`. Seule la vidéo d’introduction démarre seule, muette, quand elle est visible, et s’arrête hors écran ou si `prefers-reduced-motion` est actif ; les clips de démonstration se lancent au clic.
- Aucun son, donc aucune transcription audio nécessaire ; le texte de la page dit déjà ce que montre chaque clip.
- CSP : `media-src 'self'`. Cache long sur `/video/*` (`_headers`).

## CV

- `web/cv.html` (une page, feuille `cv.css`, impression Letter) et `web/Ludovic-Zacharie-Nolet-Gilbert-CV.pdf` généré avec Chromium (`page.pdf`, média print). Regénérer le PDF à chaque changement du CV, et recopier le résultat sous l’ancien nom `web/Zacharie-L-Nolet-CV.pdf` (alias gardé pour les liens déjà partagés). Le PDF doit tenir sur **une** page.

## A. Ne jamais avoir l’air « vibecodé » (reel aj.on.ai, « 30 reasons your site looks vibecoded »)

Seul le point 1 était lisible dans la capture ; les autres sont les signes habituels du même reel. Tout ce qui suit est interdit :

1. Dégradés violents (violet → bleu, rose → orange), texte en dégradé, halos flous derrière les blocs.
2. Inter, Space Grotesk ou la police système seule comme « choix sûr » ; pas de paire de polices réfléchie.
3. Cartes arrondies partout, ombre portée sur chaque bloc, `rounded-lg` sur tout.
4. Tout centré ; hero pleine hauteur avec deux boutons et un slogan de type « Ship faster. Think clearer. ».
5. Émojis comme icônes ou marqueurs de section ; icônes « étincelle » ; libellés « AI-powered ».
6. Grille de trois fonctionnalités avec icône + titre + phrase générique ; bandeau « Trusted by » avec faux logos.
7. Faux témoignages, fausses statistiques, lorem ipsum, liens `#` qui ne mènent nulle part, texte de remplissage.
8. Glassmorphisme, néons sur fond noir, blobs flottants, animations sur chaque élément au défilement.
9. Couleurs Tailwind par défaut, gris purs, mode sombre inversé sans soin.
10. Pied de page générique, pas de favicon, pas de page 404, pas de vraie adresse de contact.
11. Copie sans voix : phrases de marketing, superlatifs, « seamless », « effortless », « unlock ».
12. Contenu qui ne prouve rien : si on affirme une compétence, on la montre (code exécuté, chiffres vérifiables, sources).

Ce qu’on fait à la place : une identité liée au sujet (ici le cahier de lecture), une hiérarchie typographique, des filets plutôt que des cartes, des chiffres tirés du dépôt, un mouvement rare et justifié, `prefers-reduced-motion` respecté.

## B. Ce qui rend un site réel (reel prms.regmi, « Your vibe coded site is fake ») — 20 points

1. Page 404 personnalisée (`web/404.html`).
2. Appel à l’action au-dessus de la ligne de flottaison.
3. Balise `<title>` propre à chaque page.
4. Balise `<meta name="description">` propre à chaque page.
5. Image Open Graph (`og:image`, 1200 × 630) et carte Twitter.
6. Jeu de favicons : SVG, PNG 32, Apple touch 180, PWA 192 et 512, `site.webmanifest`.
7. `robots.txt`.
8. `sitemap.xml`.
9. Texte alternatif sur chaque image (décrire la photo, pas « image »).
10. Points de rupture mobiles ; aucun défilement horizontal à 400 px.
11. Appel à l’action collant sur mobile.
12. États de chargement (images, boutons occupés `aria-busy`).
13. États d’erreur des formulaires (message, `aria-invalid`, focus).
14. Page ou état de remerciement après un envoi.
15. Page de politique de confidentialité (`web/confidentialite.html`).
16. Page de conditions d’utilisation (`web/conditions.html`).
17. Avis sur les témoins : si aucun témoin, le dire honnêtement dans un avis discret plutôt que d’installer une bannière de consentement vide.
18. Mesure d’audience : seulement respectueuse de la vie privée, sans témoin (Plausible, Umami, ou les journaux de l’hébergeur), déclarée dans la politique. Jamais Google Analytics ni pixel publicitaire.
19. Vraie adresse de contact (courriel réel, lieu réel).
20. Le vingtième point était coupé dans la capture ; on garde : `<link rel="canonical">` et `lang` correct sur chaque page.

## C. Sécurité avant lancement (reel elvernlau, « 20 things to tell Claude to add before launching »)

1. Cacher les clés d’API (jamais dans le code client ni dans Git ; variables d’environnement côté serveur).
2. Purger les secrets de l’historique Git ; `.env` ignoré ; `.env.example` sans valeur réelle.
3. Utiliser seulement la clé publique/anon d’une base de données côté client.
4. Activer la sécurité au niveau des lignes (RLS) sur chaque table exposée.
5. Chiffrer les données sensibles au repos.
6. Faire l’authentification côté serveur, jamais seulement dans l’interface.
7. Verrouiller l’accès aux enregistrements : un utilisateur ne lit et n’écrit que les siens.
8. Bloquer la manipulation de champs : ne jamais accepter `role`, `prix`, `userId` venant du client.
9. Témoins de session `Secure`, `HttpOnly`, `SameSite`.
10. Hacher les mots de passe (argon2id ou bcrypt), jamais de réversible.
11. Limiter le débit et journaliser les tentatives (connexion, API).
12. Protection contre les robots sur les formulaires publics.
13. Requêtes paramétrées, jamais de SQL concaténé.
14. Valider toutes les entrées côté serveur (type, longueur, plage).
15. Échapper tout contenu utilisateur avant de l’afficher (`web/app.js` : `esc()` pour tout `innerHTML`).
16. Restreindre les téléversements (type, taille, nom, stockage hors racine web).
17. Réduire les réponses d’API au strict nécessaire (pas de dump d’objet).
18. En-têtes de sécurité : CSP, HSTS, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` (`web/_headers`, et `<meta http-equiv="Content-Security-Policy">` pour GitHub Pages).
19. Forcer HTTPS (`upgrade-insecure-requests`, HSTS).
20. Scanner les dépendances (`npm audit`) avant chaque livraison et corriger ce qui est haut ou critique.

Pour la page web statique : pas de style ni de script en ligne (la CSP est `style-src 'self'; script-src 'self'`), aucune connexion sortante (`connect-src 'none'`), aucune dépendance externe.

## D. Ne pas se faire poursuivre (reel murphmaxxing, « 10 ways your vibecoded app is getting sued »)

1. Avoir une politique de confidentialité.
2. Y dire clairement quelles données sont collectées (ou qu’aucune ne l’est).
3. Y mentionner tout usage d’IA sur les données des utilisateurs (ou son absence).
4. Y nommer les tiers qui reçoivent des données (ou leur absence).
5. Supprimer les téléversements des utilisateurs quand ils le demandent ou quittent.
6. Aucun espace de stockage public par défaut.
7. Aucun faux témoignage, aucun faux avis.
8. Résilier doit être aussi simple que s’inscrire.
9. Aucun renouvellement automatique sans rappel préalable.
10. Toute fonction d’IA conversationnelle doit répondre correctement aux propos d’automutilation (ressources, orientation), jamais les ignorer.

## Comment vérifier avant de livrer

- `web/` : `npm run verify:web` (Playwright est une dépendance de développement ; une fois, `npx playwright install chromium`. Le script ouvre toutes les pages dans Chromium, bureau et 400 px, et exerce les démonstrations ; le déploiement l’exécute aussi et refuse de publier en cas d’échec) ; ouvrir les pages ; vérifier les listes B, C, D ; aucun débordement horizontal à 400 px ; aucune erreur console ; photos ≤ 105 Ko avec variante 480 px (`srcset`).
- App : `npm test` doit rester vert ; `npm audit` sans vulnérabilité haute ou critique.
- Relire la liste A une dernière fois sur une capture d’écran : si une page pourrait être celle de n’importe qui, elle n’est pas finie.
