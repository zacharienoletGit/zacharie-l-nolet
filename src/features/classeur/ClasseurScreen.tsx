import React, { useMemo, useState } from 'react';
import { Alert, SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ClasseurProps } from '../../navigation/types';
import { daysWithNotes, notesOnDay } from '../../domain/calendarNotes';
import { renderClasseurMarkdown } from '../../domain/classeurMarkdown';
import { notePreview, notesForArticle, standaloneNotes } from '../../domain/library';
import { normalizeQuery } from '../../domain/search';
import {
  civilDate,
  formatEditionDate,
  formatStamp,
  isSunday,
  monthMeta,
} from '../../lib/dates';
import { shareMarkdownFile } from '../../services/export/shareMarkdown';
import { useLibrary } from '../../store/LibraryContext';
import { useAppTheme } from '../../theme/ThemeProvider';
import { EmptyPress } from '../../components/EmptyPress';
import { MonthGrid } from '../../components/MonthGrid';
import { PressableScale } from '../../components/PressableScale';
import { SearchField } from '../../components/SearchField';
import type { Article, Note } from '../../types/models';

type FilterId = 'all' | 'cuttings' | 'notes' | 'calendar';

type Row =
  | { kind: 'article'; article: Article }
  | { kind: 'note'; note: Note };

export function ClasseurScreen({ navigation }: ClasseurProps) {
  const insets = useSafeAreaInsets();
  const { colors, type } = useAppTheme();
  const {
    bookmarks,
    notes,
    articles,
    articleById,
    startNote,
    online,
    lastSync,
  } = useLibrary();
  const [filter, setFilter] = useState<FilterId>('all');
  const [query, setQuery] = useState('');
  const today = civilDate();
  const [selectedDay, setSelectedDay] = useState(today);
  const [cursor, setCursor] = useState(() => monthMeta(today));
  const marked = useMemo(() => daysWithNotes(notes), [notes]);

  const exportClasseur = async () => {
    const filename = `Classeur-Zacharie-L-Nolet-${today}.md`;
    try {
      const mode = await shareMarkdownFile(
        filename,
        renderClasseurMarkdown({
          notes,
          bookmarks,
          articles,
          exportedAt: new Date().toISOString(),
        }),
      );
      if (mode === 'text') {
        Alert.alert(
          'Enregistrer dans Fichiers',
          'Dans la feuille iOS, choisis « Enregistrer dans Fichiers ». Après `bundle exec pod install`, le .md atterrit aussi dans Documents de l’app.',
        );
      }
    } catch {
      Alert.alert('Export annulé', 'Rien n’a quitté le classeur.');
    }
  };

  const sections = useMemo(() => {
    const q = normalizeQuery(query);
    const cuttings: Row[] = bookmarks
      .map(b => articleById(b.articleId))
      .filter((a): a is Article => Boolean(a))
      .filter(article => {
        if (!q) {
          return true;
        }
        return normalizeQuery(`${article.title} ${article.dek}`).includes(q);
      })
      .map(article => ({ kind: 'article' as const, article }));

    const freeNotes = standaloneNotes(notes).filter(note => {
      if (!q) {
        return true;
      }
      return normalizeQuery(`${note.title} ${note.body}`).includes(q);
    });

    const blocks: { title: string; data: Row[] }[] = [];
    if (filter !== 'notes' && cuttings.length) {
      blocks.push({ title: 'Coupures', data: cuttings });
    }
    if (filter !== 'cuttings' && freeNotes.length) {
      blocks.push({
        title: 'Notes libres',
        data: freeNotes.map(note => ({ kind: 'note' as const, note })),
      });
    }
    return blocks;
  }, [bookmarks, notes, articleById, filter, query]);

  const dayNotes = useMemo(() => {
    const q = normalizeQuery(query);
    return notesOnDay(notes, selectedDay).filter(note => {
      if (!q) {
        return true;
      }
      return normalizeQuery(`${note.title} ${note.body}`).includes(q);
    });
  }, [notes, selectedDay, query]);

  const header = (
    <View style={styles.header}>
      <Text style={[type.kicker, { color: colors.accent }]}>Mémoire locale</Text>
      <Text style={[type.display, { color: colors.text }]}>Classeur</Text>
      <Text style={[type.caption, { color: colors.textMuted }]}>
        {online
          ? lastSync
            ? `Dernière sync ${formatStamp(lastSync)}`
            : 'Prêt hors-ligne. Les notes sont datées au calendrier.'
          : 'Hors-ligne — rien n’est perdu.'}
      </Text>
      <View style={styles.filters}>
        {(
          [
            ['all', 'Tout'],
            ['cuttings', 'Coupures'],
            ['notes', 'Notes'],
            ['calendar', 'Calendrier'],
          ] as const
        ).map(([id, label]) => (
          <PressableScale
            key={id}
            onPress={() => setFilter(id)}
            accessibilityState={{ selected: filter === id }}
            accessibilityLabel={label}
            style={[
              styles.filter,
              { borderColor: filter === id ? colors.accent : colors.rule },
            ]}>
            <Text
              style={[type.ui, { color: filter === id ? colors.accent : colors.text }]}>
              {label}
            </Text>
          </PressableScale>
        ))}
      </View>
      <SearchField
        value={query}
        onChangeText={setQuery}
        placeholder="Relire une coupure ou une note"
      />
      <View style={styles.row}>
        <PressableScale
          onPress={() => navigation.navigate('NoteEditor', { noteId: startNote().id })}
          style={[styles.compose, { borderColor: colors.accent }]}
          accessibilityLabel="Nouvelle note libre">
          <Text style={[type.ui, { color: colors.accent }]}>Nouvelle feuille</Text>
        </PressableScale>
        <PressableScale
          onPress={() => navigation.navigate('Revue')}
          style={[styles.compose, { borderColor: isSunday(today) ? colors.accent : colors.rule }]}
          accessibilityLabel="Revue du dimanche">
          <Text
            style={[
              type.ui,
              { color: isSunday(today) ? colors.accent : colors.text },
            ]}>
            {isSunday(today) ? 'Revue du dimanche' : 'Revue de la semaine'}
          </Text>
        </PressableScale>
        <PressableScale
          onPress={exportClasseur}
          style={[styles.compose, { borderColor: colors.rule }]}
          accessibilityLabel="Exporter le classeur en Markdown">
          <Text style={[type.ui, { color: colors.text }]}>Export .md</Text>
        </PressableScale>
      </View>
    </View>
  );

  if (filter === 'calendar') {
    return (
      <View style={[styles.flex, { backgroundColor: colors.bg }]}>
        <SectionList
          sections={[{ title: formatEditionDate(selectedDay), data: dayNotes }]}
          keyExtractor={item => item.id}
          contentContainerStyle={{
            paddingTop: insets.top + 12,
            paddingHorizontal: 20,
            paddingBottom: 36,
          }}
          ListHeaderComponent={
            <View style={styles.header}>
              {header}
              <MonthGrid
                year={cursor.year}
                month={cursor.month}
                selected={selectedDay}
                marked={marked}
                today={today}
                onSelect={setSelectedDay}
                onPrev={() =>
                  setCursor(current =>
                    current.month === 1
                      ? { year: current.year - 1, month: 12 }
                      : { year: current.year, month: current.month - 1 },
                  )
                }
                onNext={() =>
                  setCursor(current =>
                    current.month === 12
                      ? { year: current.year + 1, month: 1 }
                      : { year: current.year, month: current.month + 1 },
                  )
                }
              />
            </View>
          }
          ListEmptyComponent={
            <EmptyPress
              title="Aucune feuille ce jour-là"
              body="Le calendrier classe la création, pas l’édition. Un dimanche vide n’est pas un échec."
            />
          }
          renderSectionHeader={({ section }) => (
            <Text style={[type.kicker, styles.section, { color: colors.textMuted }]}>
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <PressableScale
              onPress={() => navigation.navigate('NoteEditor', { noteId: item.id })}
              style={[styles.item, { borderBottomColor: colors.rule }]}
              accessibilityLabel={item.title || 'Note sans titre'}>
              <Text style={[type.titleSm, { color: colors.text }]}>
                {item.title || 'Sans titre'}
              </Text>
              <Text style={[type.caption, { color: colors.textMuted }]} numberOfLines={3}>
                {notePreview(item)}
              </Text>
            </PressableScale>
          )}
        />
      </View>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      <SectionList
        sections={sections}
        keyExtractor={item =>
          item.kind === 'article' ? `a-${item.article.id}` : `n-${item.note.id}`
        }
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 36,
        }}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyPress
            title="Classeur encore blanc"
            body="Découpe un texte depuis une édition, ou ouvre une feuille. Rien n’est publié. Rien n’est social."
          />
        }
        renderSectionHeader={({ section }) => (
          <Text style={[type.kicker, styles.section, { color: colors.textMuted }]}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => {
          if (item.kind === 'article') {
            const linked = notesForArticle(notes, item.article.id).length;
            return (
              <PressableScale
                onPress={() =>
                  navigation.navigate('Article', { articleId: item.article.id })
                }
                style={[styles.item, { borderBottomColor: colors.rule }]}
                accessibilityLabel={item.article.title}>
                <Text style={[type.titleSm, { color: colors.text }]}>
                  {item.article.title}
                </Text>
                <Text style={[type.caption, { color: colors.textMuted }]}>
                  {item.article.dek}
                  {linked ? `  ·  ${linked} note${linked > 1 ? 's' : ''}` : ''}
                </Text>
              </PressableScale>
            );
          }
          return (
            <PressableScale
              onPress={() => navigation.navigate('NoteEditor', { noteId: item.note.id })}
              style={[styles.item, { borderBottomColor: colors.rule }]}
              accessibilityLabel={item.note.title || 'Note sans titre'}>
              <Text style={[type.titleSm, { color: colors.text }]}>
                {item.note.title || 'Sans titre'}
              </Text>
              <Text style={[type.caption, { color: colors.textMuted }]} numberOfLines={3}>
                {notePreview(item.note)}
              </Text>
            </PressableScale>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: 12, paddingBottom: 8 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  compose: { borderWidth: 1, paddingHorizontal: 12, alignSelf: 'flex-start' },
  section: { paddingTop: 18, paddingBottom: 4 },
  item: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 4 },
});
