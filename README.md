# Zacharie L. Nolet

Cahier de lecture iPhone — **pas un réseau social**.  
React Native 0.87, workflow **bare** (Xcode / CocoaPods). Une édition de **dix textes** par jour, des rubriques, un classeur local (coupures + notes), sync PHP optionnelle.

Marque : *Zacharie L. Nolet*. Palette : encre de minuit + filet d’or. Aucun fil infini, aucun like.

## Prérequis

| Outil | Version visée |
| --- | --- |
| macOS | Sequoia / Tahoe |
| Xcode | 16+ (le poste de dev a déjà Xcode 26) |
| Node | ≥ 22.11 |
| CocoaPods | via Bundler (`Gemfile`) ou `brew install cocoapods` |
| Simulateur iPhone | iPhone 16 / 17, iOS récent |
| PHP 8+ | seulement pour le backend d’exemple |

Ruby système 2.6 suffit pour Bundler. Si `pod` n’est pas dans le PATH, utilise **uniquement** `bundle exec pod`.

## Installer et lancer (iOS)

```bash
cd ~/Projects/zacharie-l-nolet
npm install

# CocoaPods (une fois, et après chaque ajout natif)
cd ios
bundle install
bundle exec pod install
cd ..

npm start
# autre terminal
npm run ios
```

Ou ouvrir le workspace — **pas** le `.xcodeproj` :

```bash
xed ios/ZacharieLNolet.xcworkspace
```

Schéma : `ZacharieLNolet`. Bundle id : `ca.zacharienolet.app`.  
Nom sous l’icône : **Z. L. Nolet** (le nom long est dans l’app).

### Si `bundle exec pod install` échoue

```bash
brew install cocoapods ruby
cd ios && bundle exec pod install
```

Sur Apple Silicon, un `pod` mal installé sous Rosetta casse le lien. Préfère Bundler local au projet.

### Premier lancement

1. Metro (`npm start`) doit rester ouvert.
2. L’accueil (4 pages) explique le geste : édition, coupure, marge, fermer l’app.
3. **Édition** = Top 10 du jour. Tire pour rafraîchir (catalogue mock, ~180 ms).
4. **Rubriques** = étagères + recherche.
5. **Classeur** = coupures + notes, hors-ligne.
6. **Cabinet** = thème Papier / Encre / Système, corps de texte, sync.

## Backend PHP (optionnel)

Sans URL, l’app reste **local-first** : catalogue mock + AsyncStorage.

```bash
npm run backend
# écoute http://127.0.0.1:8080
curl http://127.0.0.1:8080/v1/health
```

Dans `src/services/config.ts` :

```ts
apiBaseUrl: 'http://127.0.0.1:8080/v1',
```

Le simulateur iOS voit `127.0.0.1` comme la machine hôte.  
`NSAllowsLocalNetworking` est déjà à `true`.

| Méthode | Chemin | Rôle |
| --- | --- | --- |
| GET | `/v1/health` | Pulse |
| GET | `/v1/articles` | Catalogue |
| GET | `/v1/articles/:id` | Détail |
| GET | `/v1/edition/:YYYY-MM-DD` | Top 10 |
| GET/POST | `/v1/notes` | Liste / upsert |
| PUT/DELETE | `/v1/notes/:id` | Éditer / détruire |
| GET/POST | `/v1/bookmarks` | Liste / upsert |
| DELETE | `/v1/bookmarks/:articleId` | Retirer une coupure |

Stockage : fichiers JSON à `backend/php/data/` (`flock`).  
Le catalogue servi par PHP est généré depuis le TS :

```bash
npm run export-catalog
```

## Architecture (grain)

```
src/
  domain/          # fonctions pures — tester ici
  data/            # catalogue + rubriques + exemples
  services/        # API, AsyncStorage, sync
  store/           # Context (Library, Settings)
  features/        # écrans
  navigation/      # tabs + stacks
backend/php/      # exemple mobile, pas un ERP
```

- **Vérité locale** : notes et coupures dans AsyncStorage.
- **File de sync** : ops idempotentes, last-write-wins sur `updatedAt`.
- **Catalogue** : essais éditoriaux + flux RSS publics (`config.feedsEnabled`). Cache AsyncStorage hors-ligne.
- **Édition live** : diversité d’étagères + récence. Pas un score d’« importance » inventé.
- **Métier** (Sage X3, Nectari, Jitterbit, Power BI, CPQ) : essais du cahier seulement — aucun flux qui inventerait un KPI.
- **Calendrier** : notes au jour de création. Revue lundi→dimanche, mise en avant le dimanche.
- **Export** : Markdown vers Fichiers (feuille iOS + Documents si FS lié).

Les flux sont listés dans `src/services/feeds/registry.ts` (Radio-Canada, Le Devoir, CBC, BBC, Le Monde, NPR, HN, Ars, Aeon, Pitchfork). Couper le réseau : `feedsEnabled: false`.

Aucun chiffre Sage / KPI / COUNT dans le catalogue. Ce sont des textes de lecture.

## Tests

```bash
npm test
```

Couvre édition (10 textes, rangs, repli déterministe), classeur, recherche, file de sync.  
Notes UI / perf : `docs/TESTING.md`.

## Android

Le JS est partagé. La cible de design est **iPhone**.  
`npm run android` n’est pas le chemin de recette.

## Documents

- `docs/DESIGN.md` — pourquoi ce UI, pas un template
- `docs/UX-CLASSEUR.md` — spec coupures / notes
- `docs/TESTING.md` — tests et perf
- `docs/REPRODUCE.md` — prompts de rôle pour un autre développeur
- `web/` — site d’embauche (accueil avec vidéo, parcours, preuves exécutées avec clips vidéo, travailler ensemble, contact, CV imprimable + PDF). Site statique complet : 404, confidentialité, conditions, `robots.txt`, `sitemap.xml`, favicons, image Open Graph, en-têtes de sécurité (`_headers`). Déployé sur GitHub Pages par `.github/workflows/pages.yml` (activer Settings → Pages → Source : GitHub Actions).
- `CLAUDE.md` — règles permanentes de code du dépôt (site réel, sécurité, légal, identité).
- `docs/PROJETS.md` — feuille de route : dix-huit projets exemples, deux par compétence (dont une boutique de t-shirts Shopify et son plan de marketing sur les réseaux), avec jalons, critères de « fini » et ordre de livraison sur six mois.

## Licence

Usage privé — Zacharie L. Nolet.
