# Spec UX — Coupures et notes

Grain : une **coupure** = `articleId` + `savedAt`. Une **note** = texte libre, optionnellement liée à un article. Ce ne sont pas le même objet.

## Coupure (bookmark)

| Action | Où | Comportement |
| --- | --- | --- |
| Découper | Texte (article) | Toggle. Vibration courte. Label : « Coupure au classeur » si actif. |
| Voir | Classeur → Coupures | Titre + chapeau. Badge « n notes » si la marge existe. |
| Ouvrir | Tap coupure | Stack article (relecture). |
| Retirer | Retap « Coupure au classeur » | Sort du classeur + op `bookmark/delete` en file. |

Pas de dossiers, pas de tags. La coupure est une décision, pas une collection.

Hors-ligne : toujours possible. File locale jusqu’au prochain `syncNow`.

## Note (feuille)

| Action | Où | Comportement |
| --- | --- | --- |
| Annoter | Texte | Ouvre une feuille liée (`articleId`). Brouillon local tant que titre et corps sont vides. |
| Nouvelle feuille | Classeur | Note libre, sans article. |
| Saisir | Feuille | Titre + corps. Autosave 1,4 s après la dernière frappe si le texte n’est pas vide. |
| Enregistrer | Bouton | Flush immédiat. Flash « Enregistré dans le classeur ». |
| Éditer | Classeur / marge de l’article | Même écran, même id. |
| Détruire | Alerte | Confirmation. Op `note/delete`. Retour arrière. |
| Relier | En-tête | « En marge de … » ramène à l’article. |

Structure de saisie suggérée (placeholder, pas un validateur) :

1. Ce qui est dit  
2. Ce que j’en fais  
3. Ce que je dois vérifier  

## Calendrier

Grain : **jour de `createdAt`**, pas `updatedAt`. Retoucher une feuille le dimanche ne la déplace pas.

| Action | Où | Comportement |
| --- | --- | --- |
| Voir le mois | Classeur → Calendrier | Grille lundi→dimanche. Point d’or si une note existe. |
| Ouvrir un jour | Tap une date | Liste des feuilles de ce jour-là. |
| Revue | Classeur / Cabinet / Édition (le dimanche) | Semaine lundi→dimanche. Silence nommé, pas un trou. |

La revue est toujours ouvrable. Le dimanche, elle est mise en avant : clôturer, pas scroller.

## Export Markdown → Fichiers

| Fichier | Contenu |
| --- | --- |
| `Classeur-Zacharie-L-Nolet-YYYY-MM-DD.md` | Coupures + notes classées par jour civil |
| `Revue-dimanche-START_END.md` | Semaine en cours, un titre par jour |

iOS : feuille de partage → **Enregistrer dans Fichiers**.  
Si `@dr.pogodin/react-native-fs` est lié (`pod install`), le fichier est aussi écrit dans Documents (visible sous l’app dans Fichiers, `UIFileSharingEnabled`).

## États vides

- Classeur blanc : « Découpe un texte, ou ouvre une feuille. Rien n’est public. »
- Hors-ligne : bannière sur Édition / Rubriques. Le classeur ne se bloque jamais.

## Sync (si `apiBaseUrl` est posé)

1. Pousser la file (upsert/delete notes + bookmarks).  
2. Tirer remote.  
3. Merge last-write-wins (`updatedAt` / `savedAt`).  
4. L’appareil reste la vérité si le réseau échoue.

Cabinet affiche : nombre de coupures, de notes, taille de la file, horodatage de sync.

## Accessibilité

- Bouton Découper : `accessibilityState.selected`
- Filtres Tout / Coupures / Notes : idem
- Champs : labels « Titre de la note », « Corps de la note »
- Alerte détruire : verbe clair, style destructif iOS
