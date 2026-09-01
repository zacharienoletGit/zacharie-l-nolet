import type { SectionId } from '../types/models';

export type SectionGroupId =
  | 'atelier'
  | 'decision'
  | 'monde'
  | 'cite'
  | 'culture';

export type SectionDef = {
  id: SectionId;
  label: string;
  blurb: string;
};

export type SectionGroup = {
  id: SectionGroupId;
  label: string;
  sections: SectionId[];
};

export const SECTIONS: Record<SectionId, SectionDef> = {
  informatique: {
    id: 'informatique',
    label: 'Informatique',
    blurb: 'Systèmes, architecture, mémoire locale.',
  },
  programmation: {
    id: 'programmation',
    label: 'Programmation',
    blurb: 'Le grain du code avant l’abstraction.',
  },
  intelligence_affaires: {
    id: 'intelligence_affaires',
    label: "Intelligence d'affaires",
    blurb: 'Question métier → grain → source.',
  },
  domaine_informatique: {
    id: 'domaine_informatique',
    label: "Domaine de l'informatique",
    blurb: 'Métier, périmètre, vocabulaire partagé.',
  },
  sage_x3: {
    id: 'sage_x3',
    label: 'Sage X3',
    blurb: 'L’opérationnel, pas une copie.',
  },
  nectari: {
    id: 'nectari',
    label: 'Nectari',
    blurb: 'Cloner le champ certifié. Ne pas inventer.',
  },
  jitterbit: {
    id: 'jitterbit',
    label: 'Jitterbit',
    blurb: 'L’horloge d’intégration, pas le métier.',
  },
  cpq: {
    id: 'cpq',
    label: 'CPQ',
    blurb: 'Règles de prix et de configuration.',
  },
  power_bi: {
    id: 'power_bi',
    label: 'Power BI',
    blurb: 'Le mart, pas la source. Pas de somme de ratio.',
  },
  nouvelles_internationales: {
    id: 'nouvelles_internationales',
    label: 'Nouvelles internationales',
    blurb: 'Le monde, hors fil d’actualité.',
  },
  nouvelles_canadiennes: {
    id: 'nouvelles_canadiennes',
    label: 'Nouvelles canadiennes',
    blurb: 'Le pays, à hauteur d’article.',
  },
  nouvelles_americaines: {
    id: 'nouvelles_americaines',
    label: 'Nouvelles américaines',
    blurb: 'Les États-Unis, sans le bruit de chaîne.',
  },
  nouvelles_quebecoises: {
    id: 'nouvelles_quebecoises',
    label: 'Nouvelles québécoises',
    blurb: 'Le Québec, en phrases longues.',
  },
  politique_internationale: {
    id: 'politique_internationale',
    label: 'Politique internationale',
    blurb: 'Pouvoir, frontières, institutions.',
  },
  politique_quebecoise: {
    id: 'politique_quebecoise',
    label: 'Politique québécoise',
    blurb: 'Assemblée, régions, débats publics.',
  },
  politique_canadienne: {
    id: 'politique_canadienne',
    label: 'Politique canadienne',
    blurb: 'Fédéral, provinces, compromis.',
  },
  philosophie: {
    id: 'philosophie',
    label: 'Philosophie',
    blurb: 'Lire pour tenir, pas pour réagir.',
  },
  hip_hop: {
    id: 'hip_hop',
    label: 'Hip-hop',
    blurb: 'Forme, rythme, archive orale.',
  },
};

export const SECTION_GROUPS: SectionGroup[] = [
  {
    id: 'atelier',
    label: 'Atelier',
    sections: ['informatique', 'programmation', 'domaine_informatique', 'cpq'],
  },
  {
    id: 'decision',
    label: 'Décision',
    sections: [
      'intelligence_affaires',
      'power_bi',
      'sage_x3',
      'nectari',
      'jitterbit',
    ],
  },
  {
    id: 'monde',
    label: 'Monde',
    sections: [
      'nouvelles_internationales',
      'nouvelles_canadiennes',
      'nouvelles_americaines',
      'nouvelles_quebecoises',
    ],
  },
  {
    id: 'cite',
    label: 'Cité',
    sections: [
      'politique_internationale',
      'politique_quebecoise',
      'politique_canadienne',
    ],
  },
  {
    id: 'culture',
    label: 'Culture',
    sections: ['philosophie', 'hip_hop'],
  },
];

export function sectionLabel(id: SectionId): string {
  return SECTIONS[id].label;
}
