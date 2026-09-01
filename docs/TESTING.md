# Tests et performance

## Unitaires (Jest)

```bash
npm test
```

| Fichier | Grain |
| --- | --- |
| `__tests__/edition.test.ts` | 10 textes, rangs, repli déterministe |
| `__tests__/library.test.ts` | upsert / delete / toggle / preview |
| `__tests__/search.test.ts` | accents, rubrique, Netari → Nectari |
| `__tests__/syncQueue.test.ts` | dédup, merge LWW |

Règle : la logique métier reste dans `src/domain/`. Un écran ne calcule pas un rang.

## UI (React Native Testing Library)

À ajouter quand un écran devient instable :

```tsx
import { render, userEvent } from '@testing-library/react-native';
```

Périmètre utile, pas le chrome Navigation :

- `SearchField` + `filterArticles`
- `NoteEditorScreen` : autosave après frappe (fake timers 1400 ms)
- `ArticleRow` : label d’accessibilité contient la rubrique et les minutes

Mock : `jest.setup.js` (AsyncStorage, NetInfo, gesture-handler).

Ne pas monter `<App />` en unitaire : trop de native. Contrat = tests domaine. Navigation = simulateur.

## E2E (Detox, plus tard)

Scénario minimum anti-régression sociale :

1. Finir l’accueil.  
2. Ouvrir le texte `01`.  
3. Découper.  
4. Annoter trois lignes. Enregistrer.  
5. Classeur → la coupure et la note sont là.  
6. Mode avion → éditer la note → elle survit.  

## Performance

- Édition : 10 cellules, pas de window infinie.  
- Rubriques : debounce 200 ms, pas de refiltre à chaque glyphe.  
- Images : 1 bitmap (portrait). Pas de liste d’illustrations.  
- Sync : une file, pas un poll.  
- Listes : `removeClippedSubviews`, `keyExtractor` stable (`id`).  
- Éviter `ScrollView` + `.map` sur le catalogue.  

Mesure : Xcode Instruments → Time Profiler sur un iPhone réel, pas seulement le simulateur. Le jank apparaît au clavier + autosave : d’où le debounce 1,4 s.

## Recette manuelle iPhone

- Dynamic Type : Réglages → Accessibilité → Texte plus grand. Les titres Georgia doivent grandir.  
- Contraste : Papier *et* Encre. L’or n’est jamais le seul porteur de sens (le rang a aussi le titre).  
- Reduce Motion : les stacks restent des push natifs ; pas d’anim custom obligatoire.  
