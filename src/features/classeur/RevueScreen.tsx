import React, { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { buildSundayRevue } from '../../domain/calendarNotes';
import { renderRevueMarkdown } from '../../domain/classeurMarkdown';
import { notePreview } from '../../domain/library';
import { civilDate } from '../../lib/dates';
import type { ClasseurStackParamList } from '../../navigation/types';
import { shareMarkdownFile } from '../../services/export/shareMarkdown';
import { useLibrary } from '../../store/LibraryContext';
import { useAppTheme } from '../../theme/ThemeProvider';
import { EmptyPress } from '../../components/EmptyPress';
import { GoldRule } from '../../components/GoldRule';
import { PressableScale } from '../../components/PressableScale';

type Props = NativeStackScreenProps<ClasseurStackParamList, 'Revue'>;

export function RevueScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { colors, type } = useAppTheme();
  const { notes, articles } = useLibrary();
  const today = civilDate();
  const revue = useMemo(() => buildSundayRevue(notes, today), [notes, today]);

  const exportRevue = async () => {
    const filename = `Revue-dimanche-${revue.start}_${revue.end}.md`;
    try {
      const mode = await shareMarkdownFile(
        filename,
        renderRevueMarkdown(revue, articles),
      );
      if (mode === 'text') {
        Alert.alert(
          'Feuille de partage',
          'Choisis « Enregistrer dans Fichiers ». Relance `pod install` pour écrire aussi le .md dans Documents.',
        );
      }
    } catch {
      Alert.alert('Export impossible', 'La feuille de partage a été annulée.');
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 28 },
      ]}>
      <Text style={[type.kicker, { color: colors.accent }]}>
        {revue.isSunday ? 'Clôture' : 'Semaine en cours'}
      </Text>
      <Text style={[type.display, { color: colors.text }]}>Revue du dimanche</Text>
      <Text style={[type.dek, { color: colors.textMuted }]}>
        Semaine {revue.label}. Les notes sont classées au jour de création — pas à la
        dernière retouche.
      </Text>
      {!revue.isSunday ? (
        <Text style={[type.caption, { color: colors.textMuted }]}>
          Tu peux relire maintenant. La revue se clôt le dimanche : on n’invente pas une
          « streak ».
        </Text>
      ) : (
        <Text style={[type.caption, { color: colors.accent }]}>
          Dimanche — relis, exporte, ferme. Le fil peut attendre lundi.
        </Text>
      )}
      <GoldRule />
      <Text style={[type.ui, { color: colors.text }]}>
        {revue.noteCount} note{revue.noteCount > 1 ? 's' : ''} cette semaine
      </Text>
      <PressableScale
        onPress={exportRevue}
        style={[styles.btn, { borderColor: colors.accent }]}
        accessibilityLabel="Exporter la revue en Markdown">
        <Text style={[type.ui, { color: colors.accent }]}>
          Exporter la revue (.md)
        </Text>
      </PressableScale>

      {!revue.noteCount ? (
        <EmptyPress
          title="Semaine encore silencieuse"
          body="Annoter un texte, ou ouvrir une feuille. La revue n’invente rien."
        />
      ) : null}

      {revue.days.map(day => (
        <View key={day.date} style={styles.day}>
          <Text style={[type.kicker, { color: colors.textMuted }]}>{day.label}</Text>
          {!day.notes.length ? (
            <Text style={[type.caption, { color: colors.textMuted }]}>Silence.</Text>
          ) : (
            day.notes.map(note => (
              <PressableScale
                key={note.id}
                onPress={() => navigation.navigate('NoteEditor', { noteId: note.id })}
                style={[styles.note, { borderBottomColor: colors.rule }]}
                accessibilityLabel={note.title || 'Note sans titre'}>
                <Text style={[type.titleSm, { color: colors.text }]}>
                  {note.title || 'Sans titre'}
                </Text>
                <Text style={[type.caption, { color: colors.textMuted }]} numberOfLines={3}>
                  {notePreview(note)}
                </Text>
              </PressableScale>
            ))
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  btn: { borderWidth: 1, paddingHorizontal: 12, alignSelf: 'flex-start' },
  day: { gap: 8, paddingTop: 8 },
  note: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
});
