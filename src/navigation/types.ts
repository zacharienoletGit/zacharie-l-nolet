import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { SectionId } from '../types/models';

export type ReaderParams = {
  Article: { articleId: string };
  NoteEditor: { noteId?: string; articleId?: string };
};

export type EditionStackParamList = {
  Today: undefined;
} & ReaderParams;

export type RubriquesStackParamList = {
  Explore: undefined;
  Section: { sectionId: SectionId };
} & ReaderParams;

export type ClasseurStackParamList = {
  ClasseurHome: undefined;
  Revue: undefined;
  NoteEditor: { noteId?: string; articleId?: string };
  Article: { articleId: string };
};

export type CabinetStackParamList = {
  CabinetHome: undefined;
};

export type MainTabParamList = {
  EditionTab: NavigatorScreenParams<EditionStackParamList>;
  RubriquesTab: NavigatorScreenParams<RubriquesStackParamList>;
  ClasseurTab: NavigatorScreenParams<ClasseurStackParamList>;
  CabinetTab: NavigatorScreenParams<CabinetStackParamList>;
};

export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type TodayProps = CompositeScreenProps<
  NativeStackScreenProps<EditionStackParamList, 'Today'>,
  BottomTabScreenProps<MainTabParamList>
>;

export type ArticleProps = NativeStackScreenProps<
  EditionStackParamList & RubriquesStackParamList & ClasseurStackParamList,
  'Article'
>;

export type ExploreProps = NativeStackScreenProps<RubriquesStackParamList, 'Explore'>;
export type SectionProps = NativeStackScreenProps<RubriquesStackParamList, 'Section'>;
export type ClasseurProps = NativeStackScreenProps<ClasseurStackParamList, 'ClasseurHome'>;
export type NoteEditorProps = NativeStackScreenProps<ClasseurStackParamList, 'NoteEditor'>;
export type CabinetProps = NativeStackScreenProps<CabinetStackParamList, 'CabinetHome'>;
