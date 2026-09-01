# Rationale UI / navigation

## Ce que l’app refuse

Un fil vertical infini, des cœurs, des commentaires, un « For you », des cartes Inter-sur-fond-lavande. C’est le look des templates et le geste des réseaux. Ici le produit est un **cahier** : on ouvre, on lit, on annote, on ferme.

## Navigation

Quatre onglets, pas une taxonomie de dix-huit sections en tab bar.

| Onglet | Rôle | Stack |
| --- | --- | --- |
| **Édition** | Top 10 du jour, clos | Texte → Feuille |
| **Rubriques** | Étagères groupées (Atelier, Décision, Monde, Cité, Culture) + recherche | Section → Texte → Feuille |
| **Classeur** | Coupures + notes, hors-ligne | Feuille / Texte |
| **Cabinet** | Lumière, corps, sync, revoir l’accueil | — |

L’accueil (onboarding) est un root stack, pas un modal marketing. Quatre phrases, puis « Entrer dans le cahier ».

Pourquoi pas un tab par rubrique : Facebook-scale 101 — une tab bar n’est pas un sitemap. Les 18 sections vivent dans Rubriques, en groupes métier.

## Forme « édition »

Exactement dix textes. Rang `01`–`10` en filet d’or. Pied de liste : *L’édition est close.* Le reste n’est pas « la suite du feed » : il faut **changer d’onglet**. C’est volontairement un peu frottant.

Pull-to-refresh recharge le catalogue et les flux. Ça ne pagine pas.

S’il y a des RSS du jour (ou de la veille), l’édition compose **une diversité d’étagères**. Ce n’est pas un classement d’importance — on n’en a pas la rédaction. Les rubriques métier restent des essais : on ne branche pas un blog marketing pour inventer un taux.

## Palette

- Papier (clair) : crème `#F3EDE0`, encre `#0B1A28`
- Encre (sombre) : midnight `#0B1A28`, or `#E0C378` en **filet**, jamais en bouton plein écran
- Contraste texte / fond > 7:1 sur le corps

L’or est un filet de journal, pas un « premium gradient ». Le portrait (auréole) est la seule image de marque — coin / sceau, pas avatar social.

## Typo

Georgia pour titres et corps (journal iOS, pas Inter). Chrome système pour les onglets et champs. Trois corps (Lecture / Large / Très large) **en plus** du Dynamic Type iOS (`allowFontScaling`).

Cibles : 44 pt minimum, labels VoiceOver en français, `accessibilityState.selected` sur filtres et coupures.

## Anti-générique (checklist)

- Pictogrammes géométriques maison, pas une icon font
- Filets, petites capitales, rangs — pas de cards à 16 px partout
- Verbe **Découper** au lieu de Bookmark
- **Feuille** au lieu de Note
- **Cabinet** au lieu de Settings
- Pas d’emoji dans l’UI

## Perf (mobile)

- `FlatList` / `SectionList`, `memo(ArticleRow)`, `initialNumToRender={10}`
- Recherche debounce 200 ms
- Une seule image (portrait), pas de blur
- Persist AsyncStorage après mutation, pas à chaque keystroke (notes : 1,4 s)
- Sync : file puis pull, jamais un merge silencieux si le réseau ment
