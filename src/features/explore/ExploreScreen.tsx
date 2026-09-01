import React, { useMemo, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ExploreProps } from '../../navigation/types';
import { SECTION_GROUPS, SECTIONS } from '../../data/sections';
import { filterArticles } from '../../domain/search';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useLibrary } from '../../store/LibraryContext';
import { useAppTheme } from '../../theme/ThemeProvider';
import { ArticleRow } from '../../components/ArticleRow';
import { PressableScale } from '../../components/PressableScale';
import { SearchField } from '../../components/SearchField';
import { OfflineBanner } from '../../components/OfflineBanner';
import type { Article } from '../../types/models';

export function ExploreScreen({ navigation }: ExploreProps) {
  const insets = useSafeAreaInsets();
  const { colors, type } = useAppTheme();
  const { articles, refreshing, refreshCatalog, online, bookmarked } = useLibrary();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 200);

  const filtered = useMemo(
    () => filterArticles(articles, debouncedQuery),
    [articles, debouncedQuery],
  );

  const searching = query.trim().length > 0;

  const sections = useMemo(() => {
    if (searching) {
      return [
        {
          title: `${filtered.length} texte${filtered.length > 1 ? 's' : ''}`,
          data: filtered,
        },
      ];
    }
    return [];
  }, [filtered, searching]);

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      <OfflineBanner visible={!online} />
      <SectionList
        sections={sections}
        keyExtractor={(item: Article) => item.id}
        refreshing={refreshing}
        onRefresh={refreshCatalog}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingHorizontal: 20,
          paddingBottom: 32,
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[type.kicker, { color: colors.accent }]}>Sommaire</Text>
            <Text style={[type.display, { color: colors.text }]}>Rubriques</Text>
            <Text style={[type.dek, { color: colors.textMuted }]}>
              Choisis une étagère. La recherche filtre le catalogue, elle ne fabrique pas un fil.
            </Text>
            <SearchField value={query} onChangeText={setQuery} />
            {!searching
              ? SECTION_GROUPS.map(group => (
                  <View key={group.id} style={styles.group}>
                    <Text style={[type.kicker, { color: colors.textMuted }]}>
                      {group.label}
                    </Text>
                    <View style={styles.chips}>
                      {group.sections.map(id => (
                        <PressableScale
                          key={id}
                          onPress={() => navigation.navigate('Section', { sectionId: id })}
                          accessibilityLabel={SECTIONS[id].label}
                          style={[
                            styles.chip,
                            { borderColor: colors.rule, backgroundColor: colors.surface },
                          ]}>
                          <Text style={[type.ui, { color: colors.text }]}>
                            {SECTIONS[id].label}
                          </Text>
                          <Text style={[type.caption, { color: colors.textMuted }]}>
                            {SECTIONS[id].blurb}
                          </Text>
                        </PressableScale>
                      ))}
                    </View>
                  </View>
                ))
              : null}
          </View>
        }
        renderItem={({ item }) => (
          <ArticleRow
            article={item}
            saved={bookmarked(item.id)}
            onPress={() => navigation.navigate('Article', { articleId: item.id })}
          />
        )}
        renderSectionHeader={({ section }) =>
          searching ? (
            <Text style={[type.kicker, styles.hits, { color: colors.accent }]}>
              {section.title}
            </Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { gap: 12, paddingBottom: 8 },
  group: { gap: 10, paddingTop: 10 },
  chips: { gap: 8 },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  hits: { paddingTop: 12 },
});
