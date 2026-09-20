# Feuille de route : projets exemples, deux par compétence

Objectif : transformer chaque compétence affichée sur le site en **deux projets livrables**, chacun avec une preuve vérifiable (dépôt, tests, démo, chiffres). Le niveau visé est celui d’un développeur senior : périmètre fermé, définition de « fini » écrite avant de coder, sécurité et accessibilité dès le départ, mesure du résultat à la fin.

Règles communes à tous les projets (héritées de `CLAUDE.md`) :

- La logique métier vit dans des fonctions pures testées avant l’écran. Un projet sans tests n’est pas livré.
- Les quatre listes (site réel, sécurité, légal, anti-gabarit) sont passées avant toute mise en ligne.
- Aucune donnée inventée : jeux de données synthétiques clairement marqués, ou données publiques citées.
- Chaque projet se termine par une **démonstration de 10 secondes** (enregistrée avec Chromium, sous-titrée) et une fiche d’une page : problème, décision, résultat mesuré.
- Ordre de livraison conseillé : d’abord les projets marqués **★** (les plus convaincants pour un employeur par rapport à l’effort), puis les autres.

Estimation : en heures de travail effectif, pour une personne. Les jalons sont conçus pour être livrables un à un (un jalon = quelque chose qui tourne).

---

## 1. Applications mobiles (React Native, TypeScript)

### 1.1 ★ « Pointage terrain » : feuille de temps hors ligne pour équipes mobiles

- **Problème** : les techniciens sur la route notent leurs heures sur papier ou dans une app qui exige le réseau. Résultat : saisies perdues, paie en retard.
- **Pour qui** : PME de services (entretien, construction, livraison) de 5 à 50 employés.
- **Livrables** : app iPhone et Android (une base de code), écran de pointage en un geste, projets et tâches, résumé hebdomadaire, export CSV signé, synchronisation quand le réseau revient.
- **Pile** : React Native bare, TypeScript, SQLite local (op-sqlite), file d’opérations idempotentes (réutiliser `src/domain/syncQueue.ts`), API PHP 8 minimale (réutiliser `backend/php`), authentification par jeton court, tests Jest sur tout `domain/`.
- **Jalons** :
  1. Domaine pur : `Entrée`, `Journée`, `Semaine`, règles de chevauchement et d’arrondi, 30 tests. (8 h)
  2. Écrans pointage + journée, stockage local, fonctionne 100 % hors ligne. (14 h)
  3. Sync : file, rejeu, résolution « dernière écriture gagne » avec horodatage serveur, tests de conflit. (10 h)
  4. Export CSV + résumé hebdo, accessibilité (44 pt, VoiceOver, Dynamic Type). (8 h)
  5. Fiche, démo vidéo, mise en ligne TestFlight. (4 h)
- **Fini quand** : une semaine simulée de 3 employés, 2 h sans réseau, se synchronise sans doublon ni perte ; couverture des tests du domaine ≥ 90 % ; démarrage à froid < 1,5 s sur iPhone 12.
- **Risques** : horloges des téléphones déréglées (règle : le serveur horodate la réception, le client garde son ordre local) ; conflits de saisie sur la même journée (règle : jamais de fusion silencieuse, on montre les deux).
- **Preuve pour l’employeur** : dépôt public, vidéo « avion mode → sync », chiffres ci-dessus.

### 1.2 « Inventaire par photo » : compter un stock en scannant des étiquettes

- **Problème** : l’inventaire annuel se fait à la main dans Excel ; erreurs de transcription, deux jours perdus.
- **Pour qui** : commerces et ateliers qui ont déjà des codes-barres ou des étiquettes imprimées.
- **Livrables** : lecture de codes-barres (caméra), fiche article, comptage par emplacement, écarts vs quantité théorique importée en CSV, rapport d’écarts, mode deux personnes (comptage croisé).
- **Pile** : React Native bare, `react-native-vision-camera` + décodeur de codes, SQLite, import/export CSV, tests Jest sur l’import (formats, doublons, encodages), tests de rendu RNTL sur la fiche article.
- **Jalons** : (1) import CSV robuste + domaine des écarts, 25 tests (8 h) ; (2) scan + fiche + comptage (12 h) ; (3) rapport d’écarts, comptage croisé, export (8 h) ; (4) fiche + démo (3 h).
- **Fini quand** : 500 articles importés en < 2 s ; scan reconnu en < 300 ms en lumière de magasin ; rapport d’écarts identique à un calcul de référence fait dans un tableur.
- **Risques** : caméra sur appareils bas de gamme (test sur un Android à 200 $) ; étiquettes abîmées (saisie manuelle toujours possible, à un geste).

---

## 2. Code testé et qualité (Jest, fonctions pures, revue)

### 2.1 ★ « Règles de paie québécoise » : bibliothèque testée contre les tables officielles

- **Problème** : les petits outils internes calculent mal les retenues (RRQ, RQAP, AE, impôt) parce que les règles changent chaque année et que personne ne les teste.
- **Pour qui** : développeurs d’outils internes, comptables qui veulent vérifier un chiffre.
- **Livrables** : paquet TypeScript sans dépendance, fonctions pures par retenue et par année, tables de paramètres versionnées, **tests générés à partir des exemples publiés par Revenu Québec et l’ARC** (documents cités, valeurs recopiées, jamais inventées), page de démonstration statique.
- **Pile** : TypeScript, Jest, tests basés sur des tables (`test.each`), tests de propriétés (fast-check) pour la monotonie et les bornes, publication npm privée ou dépôt public.
- **Jalons** : (1) modèle de paramètres + une retenue (RRQ) avec 20 cas officiels (6 h) ; (2) les autres retenues (12 h) ; (3) propriétés + cas limites (plafonds, mi-année) (6 h) ; (4) démo web + fiche (4 h).
- **Fini quand** : 100 % des exemples officiels reproduits au cent près ; couverture ≥ 95 % ; temps de calcul < 1 ms par employé.
- **Risques** : mauvaise lecture d’une table officielle (revue croisée obligatoire par une seconde personne ; chaque cas cite sa page source).

### 2.2 « Filet de sécurité » : ajouter des tests à un code existant sans le réécrire

- **Problème** : un logiciel utile n’a aucun test ; personne n’ose le modifier.
- **Pour qui** : toute équipe qui hérite d’un code ancien (ici : le backend PHP du dépôt, puis un projet ouvert choisi sur GitHub).
- **Livrables** : tests de caractérisation (on capture le comportement actuel avant de changer quoi que ce soit), harnais d’exécution, rapport de couverture avant/après, trois corrections de bogues trouvées par les tests, journal des décisions.
- **Pile** : PHPUnit pour `backend/php` (routeur, store, contrats HTTP), Jest pour la partie TypeScript, GitHub Actions qui bloque la fusion si la couverture baisse.
- **Jalons** : (1) harnais + 15 tests de caractérisation sur les routes `/v1` (6 h) ; (2) verrou de fichiers et cas concurrents testés (5 h) ; (3) même méthode sur un projet ouvert de 2 à 5 k lignes, avec une contribution acceptée (10 h) ; (4) fiche (2 h).
- **Fini quand** : couverture du backend de 0 % à ≥ 80 % sans changer son comportement documenté ; une contribution fusionnée en amont.
- **Risques** : figer un comportement buggé (chaque test de caractérisation porte un commentaire « voulu » ou « à corriger »).

---

## 3. Travail hors ligne et synchronisation

### 3.1 ★ « Cahier partagé » : notes synchronisées entre deux personnes sans conflit perdu

- **Problème** : deux personnes modifient la même note hors ligne ; les outils simples écrasent l’une des versions.
- **Pour qui** : petites équipes (2 à 10) qui travaillent sur le terrain.
- **Livrables** : extension de l’application de lecture du dépôt : partage d’un classeur, fusion **par paragraphe** (pas par note entière), historique visible, résolution manuelle quand deux personnes touchent le même paragraphe.
- **Pile** : réutiliser `src/domain/syncQueue.ts` et `classeurMarkdown.ts` ; fusion à trois voies au niveau des paragraphes ; horodatage hybride (compteur logique + heure) ; API PHP avec journal des opérations ; tests Jest de fusion sur 40 scénarios.
- **Jalons** : (1) modèle d’opérations par paragraphe + 40 tests (10 h) ; (2) journal serveur + rejeu (8 h) ; (3) écran d’historique et de résolution (8 h) ; (4) démo à deux téléphones, fiche (4 h).
- **Fini quand** : 1 000 opérations rejouées dans un ordre aléatoire donnent le même document final sur les deux appareils (test de convergence) ; aucune perte de paragraphe dans 40 scénarios.
- **Risques** : complexité des CRDT complets (on choisit délibérément une fusion par paragraphe avec résolution manuelle, documentée comme un compromis).

### 3.2 « Formulaire d’inspection » : PWA qui fonctionne sans réseau et envoie plus tard

- **Problème** : les inspections (bâtiment, véhicule, sécurité) se font en sous-sol ou en région sans couverture.
- **Pour qui** : organismes et entreprises qui ont déjà un formulaire papier.
- **Livrables** : application web installable (PWA), formulaire avec photos, signature, géolocalisation optionnelle, file d’envoi en arrière-plan, tableau de bord d’envoi (en attente, envoyé, refusé), export PDF.
- **Pile** : HTML/CSS/JS sans cadre (comme le site), Service Worker avec cache et « background sync », IndexedDB, API PHP de réception avec validation stricte et limite de taille, tests Playwright en mode hors ligne.
- **Jalons** : (1) formulaire + IndexedDB + validation (8 h) ; (2) Service Worker, file d’envoi, reprise (8 h) ; (3) photos compressées côté client, signature, PDF (8 h) ; (4) tests hors ligne automatisés, fiche (4 h).
- **Fini quand** : 20 inspections faites en mode avion partent toutes au retour du réseau, sans doublon ; poids de l’application < 200 Ko hors photos ; score Lighthouse PWA 100.
- **Risques** : limites de stockage iOS (compression des photos à 1 600 px, alerte à 80 % du quota).

---

## 4. Serveurs et API en PHP

### 4.1 ★ « API de réservation » : créneaux, verrous, paiement simulé, zéro double réservation

- **Problème** : deux clients réservent le même créneau à la même seconde.
- **Pour qui** : petites entreprises de services (salon, garage, clinique).
- **Livrables** : API PHP 8 avec MySQL, contrats JSON versionnés (`/v2`), verrouillage pessimiste des créneaux, jetons d’idempotence sur la création, journal d’audit, documentation OpenAPI, collection de tests HTTP.
- **Pile** : PHP 8.3 sans cadre lourd (routeur maison comme `backend/php/router.php`), PDO avec requêtes préparées, transactions `SELECT … FOR UPDATE`, PHPUnit + tests d’intégration sur base réelle, GitHub Actions avec service MySQL.
- **Jalons** : (1) schéma + migrations + domaine des créneaux (6 h) ; (2) routes + validation + idempotence (10 h) ; (3) test de charge à 200 requêtes simultanées sur un créneau, zéro doublon (6 h) ; (4) OpenAPI + fiche (4 h).
- **Fini quand** : 200 requêtes concurrentes → 1 réservation, 199 refus propres (HTTP 409) ; p95 < 120 ms ; tout point d’entrée validé côté serveur (type, longueur, plage).
- **Risques** : interblocages MySQL (ordre d’acquisition documenté, délai d’attente court, nouvel essai unique).

### 4.2 « Passerelle de courriels transactionnels » : file, reprise, journal, rien de perdu

- **Problème** : un site envoie ses courriels directement pendant la requête ; quand le fournisseur tombe, les confirmations disparaissent.
- **Pour qui** : tout site PHP qui envoie des confirmations, des factures ou des rappels.
- **Livrables** : service qui met les courriels en file (table), travailleur avec reprise exponentielle, gabarits versionnés, journal consultable, tableau de bord minimal, protection contre l’envoi en double, désabonnement en un clic.
- **Pile** : PHP 8, MySQL, cron ou `supervisord`, fournisseur SMTP interchangeable (interface + double de test), PHPUnit, tests de reprise avec fournisseur simulé qui échoue.
- **Jalons** : (1) file + travailleur + reprise (8 h) ; (2) gabarits + journal + tableau de bord (8 h) ; (3) tests de panne, désabonnement, conformité (pied de page, adresse réelle) (6 h) ; (4) fiche (2 h).
- **Fini quand** : 1 000 courriels avec un fournisseur qui échoue 30 % du temps → 100 % livrés, 0 doublon ; aucun secret dans le code (variables d’environnement, `.env` ignoré).
- **Risques** : boucle d’envoi en cas de bogue (plafond d’envois par heure, disjoncteur).

---

## 5. Tableaux de bord et données (Power BI, modèle en étoile)

### 5.1 ★ « Livraisons à temps » : un tableau de bord qui ne ment pas

- **Problème** : le rapport actuel fait la moyenne des taux par région (voir démonstration 04) ; les décisions se prennent sur un chiffre faux.
- **Pour qui** : directeur des opérations d’un distributeur régional.
- **Livrables** : modèle en étoile (faits : livraisons ; dimensions : date, région, client, transporteur), mesures DAX justes (`DIVIDE(SUM, SUM)`), page « pourquoi ce chiffre » qui montre les numérateurs et dénominateurs, tests de mesures, jeu de données synthétique documenté, guide d’un page pour l’utilisateur.
- **Pile** : Power BI Desktop, Power Query pour le nettoyage, DAX, jeu de données généré par script (Node) avec graine fixe, tests des mesures par comparaison à un calcul Node de référence, exposition des tests dans le dépôt.
- **Jalons** : (1) générateur de données + calcul de référence (6 h) ; (2) modèle + mesures + tests (10 h) ; (3) pages, filtres, accessibilité (contraste, ordre de tabulation) (8 h) ; (4) fiche + vidéo (3 h).
- **Fini quand** : chaque mesure égale le calcul de référence sur 12 mois × 5 régions ; ouverture du rapport < 3 s ; un gestionnaire non technique retrouve « d’où vient le chiffre » en moins de 30 s (test avec deux personnes).
- **Risques** : sommer un ratio quelque part par accident (règle : aucune colonne calculée de taux au niveau ligne ; tests qui échouent si une mesure `AVERAGE` porte sur un taux).

### 5.2 « Du grand livre au tableau de bord » : Sage X3 → Nectari → Power BI, sans réinventer un chiffre

- **Problème** : le tableau de bord recalcule des montants que l’ERP connaît déjà ; les deux ne concordent plus.
- **Pour qui** : PME manufacturière qui a Sage X3 et Nectari.
- **Livrables** : cartographie des champs certifiés (quel chiffre vit où), rapport Nectari qui **clone** le champ certifié au lieu de le recalculer, extraction planifiée par Jitterbit vers un mart, modèle Power BI qui lit le mart et jamais la source, test de réconciliation automatique ERP ↔ tableau de bord chaque nuit.
- **Pile** : Sage X3 (environnement de démonstration ou données anonymisées), Nectari, Jitterbit (cadence, reprise, journal), MySQL ou SQL Server pour le mart, Power BI, script de réconciliation Node avec seuil de tolérance à 0,00 $.
- **Jalons** : (1) cartographie + document « vocabulaire partagé » (produit, article, item) (6 h) ; (2) rapport Nectari cloné + extraction Jitterbit (10 h) ; (3) mart + modèle Power BI (10 h) ; (4) réconciliation nocturne + alerte (5 h) ; (5) fiche (3 h).
- **Fini quand** : réconciliation à 0,00 $ d’écart sur 3 mois de clôture ; aucun `COUNT` ou `SUM` recalculé sur un champ que l’ERP certifie ; une panne d’extraction est visible en moins de 15 minutes.
- **Risques** : accès à un environnement Sage X3 (solution : jeu anonymisé fourni par un partenaire, ou instance d’essai ; la cartographie et le script de réconciliation se testent sans l’ERP).

---

## 6. Configurateurs de prix et de produit (règles CPQ)

### 6.1 ★ « Moteur de règles CPQ » : bibliothèque avec explication de chaque décision

- **Problème** : les règles de prix vivent dans des `if` éparpillés ou dans la tête d’un vendeur ; personne ne sait pourquoi un devis vaut ce qu’il vaut.
- **Pour qui** : équipes de vente d’équipement configurable (mobilier, machines, abonnements).
- **Livrables** : bibliothèque TypeScript (généralisation de la démonstration 05) : règles d’exigence, d’exclusion, de quantité, de remise par paliers, de prix par région ; **trace lisible** de chaque règle appliquée ; détection de règles contradictoires au chargement ; éditeur de règles en JSON validé par schéma ; démo web.
- **Pile** : TypeScript, Jest (tests par table + tests de propriétés : une configuration valide reste valide après ajout d’une option compatible), JSON Schema, page statique.
- **Jalons** : (1) modèle + résolution à point fixe + trace (8 h) ; (2) contradictions et cycles détectés (6 h) ; (3) paliers, régions, devises (6 h) ; (4) démo + fiche (4 h).
- **Fini quand** : 200 configurations aléatoires résolues sans boucle infinie ; chaque prix accompagné d’une trace que le métier peut lire ; règles contradictoires refusées avec un message clair.
- **Risques** : explosion combinatoire (limite de passes documentée, alerte au-delà).

### 6.2 « Devis en trois écrans » : configurateur client avec PDF et suivi

- **Problème** : le client attend deux jours un devis que des règles simples pourraient produire à l’instant.
- **Pour qui** : PME qui vend des produits à options (pupitres, portes, remorques…).
- **Livrables** : parcours web en trois écrans (choisir, ajuster, recevoir), prix en direct via le moteur 6.1, PDF de devis avec numéro, envoi par courriel via la passerelle 4.2, suivi des devis ouverts, sans compte client.
- **Pile** : HTML/CSS/JS sans cadre, moteur 6.1, API PHP (4.x), génération PDF côté serveur, tests Playwright de bout en bout, mesure Lighthouse.
- **Jalons** : (1) écrans + moteur en direct (8 h) ; (2) PDF + envoi + suivi (8 h) ; (3) accessibilité, mobile, listes de mise en ligne (6 h) ; (4) fiche + vidéo (3 h).
- **Fini quand** : un devis complet en < 90 s au chronomètre ; PDF identique au prix affiché (test automatique) ; Lighthouse ≥ 95 sur les quatre axes.
- **Risques** : manipulation du prix côté client (le serveur recalcule tout avec le même moteur ; le client n’envoie que ses choix).

---

## 7. Sites web sécurisés et mise en ligne

### 7.1 ★ « Vitrine en un jour » : gabarit de site PME qui passe les quatre listes d’office

- **Problème** : les sites de PME livrés vite oublient la 404, la confidentialité, les en-têtes, l’accessibilité.
- **Pour qui** : PME et travailleurs autonomes ; agences qui veulent un socle sain.
- **Livrables** : gabarit statique (HTML/CSS/JS, sans cadre) déjà conforme aux listes B, C, D de `CLAUDE.md`, générateur de pages minimal, formulaire de contact sans serveur puis avec serveur (option), script de vérification automatique qui rejoue les listes (404 présente, CSP sans style en ligne, alt sur chaque image, sitemap cohérent, contraste), déploiement GitHub Pages ou Netlify en un commit.
- **Pile** : ce dépôt (`web/`) comme point de départ, Node pour le générateur et le vérificateur, Playwright pour les tests, GitHub Actions.
- **Jalons** : (1) extraire le socle du site actuel (6 h) ; (2) vérificateur automatique des listes (8 h) ; (3) deux sites de démonstration (une clinique, un atelier) avec contenu fictif clairement marqué (8 h) ; (4) fiche (2 h).
- **Fini quand** : un nouveau site part de zéro à « en ligne et conforme » en moins d’une journée ; le vérificateur échoue si l’une des 50 vérifications tombe ; Lighthouse ≥ 95.
- **Risques** : le gabarit devient un gabarit (règle A) : chaque site garde sa propre typographie, sa couleur et ses textes ; le socle ne fournit que la structure et la sécurité.

### 7.2 « Audit de sécurité d’un site existant » : rapport, correctifs, preuve avant/après

- **Problème** : un site en ligne depuis des années n’a jamais été audité.
- **Pour qui** : PME ou organisme qui a un site (avec sa permission écrite ; sinon, un site de démonstration volontairement vulnérable).
- **Livrables** : rapport lisible par un non-technicien (constat, risque, correctif, priorité), correctifs appliqués (en-têtes, CSP, formulaires, dépendances, secrets, HTTPS), captures avant/après, vérification automatisée rejouable.
- **Pile** : Mozilla Observatory, `npm audit` / `composer audit`, Playwright pour rejouer les vérifications, ZAP en mode passif seulement, check-list des 20 points de sécurité de `CLAUDE.md`.
- **Jalons** : (1) méthode + grille de notation (4 h) ; (2) audit d’un site de démonstration vulnérable, 20 constats (8 h) ; (3) correctifs + preuves (10 h) ; (4) rapport modèle réutilisable (4 h).
- **Fini quand** : note Observatory de F à A ; 0 dépendance vulnérable haute ou critique ; rapport compris par une personne non technique (test avec deux lecteurs).
- **Risques** : tester sans permission (jamais ; autorisation écrite ou site de démonstration).

---

## 8. Travail en équipe et communication

### 8.1 ★ « Projet à quatre » : mener un développement en équipe avec Git, revues et livraisons hebdomadaires

- **Problème** : les projets étudiants échouent sur l’organisation, pas sur la technique.
- **Pour qui** : une équipe de 3 à 5 (camarades, ou bénévoles d’un organisme).
- **Livrables** : un des projets ci-dessus (1.1 ou 3.2) mené en équipe : tableau de tâches, branches courtes, revue obligatoire (une approbation), intégration continue qui bloque sans tests, démonstration chaque vendredi, journal des décisions, rétrospective écrite.
- **Pile** : GitHub (Projects, PR, Actions), conventions de commit, gabarit de PR, `CODEOWNERS`, réunions de 15 minutes.
- **Jalons** : (1) charte d’équipe + définition de « fini » (3 h) ; (2) trois sprints d’une semaine avec démo (le temps du projet choisi) ; (3) rétrospective + fiche (3 h).
- **Fini quand** : 100 % des fusions passées par revue et intégration continue ; trois démonstrations tenues à l’heure ; chaque décision majeure retrouvable dans le journal.
- **Risques** : un membre absent (tâches petites, jamais bloquantes plus d’un jour ; règle du binôme).

### 8.2 « Expliquer à un non-technicien » : trois fiches d’une page et trois vidéos de dix secondes

- **Problème** : un bon travail mal expliqué ne se vend pas ; les employeurs veulent quelqu’un qui sait dire ce qu’il a fait.
- **Pour qui** : gestionnaires, clients, recruteurs.
- **Livrables** : pour trois projets livrés, une fiche d’une page (problème, décision, résultat chiffré, ce que je referais autrement), une vidéo de 10 s enregistrée et sous-titrée (méthode de `web/video/`), une présentation orale de 3 minutes chronométrée, retour écrit de deux lecteurs non techniciens.
- **Pile** : Markdown, Chromium pour les vidéos, sous-titres WebVTT, `cv.html` comme gabarit d’impression.
- **Jalons** : (1) gabarit de fiche (2 h) ; (2) trois fiches + trois vidéos (8 h) ; (3) présentation + retours + corrections (4 h).
- **Fini quand** : les deux lecteurs répondent correctement à « qu’est-ce que ça fait, pour qui, et quel résultat » après lecture ; la présentation tient en 3 minutes sans note.
- **Risques** : jargon (chaque fiche passe le test « en clair » de `CLAUDE.md`).

---

## Ordre de livraison recommandé (six mois, à temps partiel)

| Mois | Projets | Pourquoi dans cet ordre |
| --- | --- | --- |
| 1 | 6.1 Moteur CPQ ★, 2.1 Règles de paie ★ | Purement logiciel, testable seul, deux bibliothèques publiables rapidement. |
| 2 | 5.1 Livraisons à temps ★, 7.1 Vitrine en un jour ★ | Deux preuves visuelles fortes pour les employeurs BI et web. |
| 3 | 4.1 API de réservation ★ | Montre la rigueur serveur (concurrence, validation, tests d’intégration). |
| 4 | 1.1 Pointage terrain ★ (en équipe : 8.1 ★) | Le projet mobile phare, mené en équipe avec revues et démos. |
| 5 | 3.1 Cahier partagé ★, 8.2 Fiches et vidéos | Approfondit la synchronisation ; met en mots tout ce qui précède. |
| 6 | Au choix selon les offres visées : 5.2, 6.2, 3.2, 4.2, 1.2, 2.2, 7.2 | À aligner sur le type d’employeur (BI, web, mobile). |

Chaque projet terminé rejoint le site (`web/parcours.html`, section Projets) **seulement une fois livré**, avec son dépôt, sa vidéo et ses chiffres. Rien de planifié n’est présenté comme fait.
