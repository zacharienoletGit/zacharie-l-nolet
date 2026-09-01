# API PHP — Zacharie L. Nolet

Exemple **mobile**, pas un ETL. JSON + fichiers. PHP 8+.

```bash
# depuis la racine du repo
npm run backend
curl http://127.0.0.1:8080/v1/health
```

Préfixe `/v1` optionnel : `/notes` et `/v1/notes` sont acceptés.

Données mutables : `data/notes.json`, `data/bookmarks.json` (créés au premier POST).  
Catalogue lu : `data/catalog.json` (généré par `npm run export-catalog`).
