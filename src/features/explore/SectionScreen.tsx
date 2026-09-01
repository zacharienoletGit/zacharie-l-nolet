import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { SectionProps } from '../../navigation/types';
import { SECTIONS } from '../../data/sections';
import { filterArticles } from '../../domain/search';
import { useLibrary } from '../../store/LibraryContext';
import { useAppTheme } from '../../theme/ThemeProvider';
import { ArticleRow } from '../../components/ArticleRow';
import { EmptyPress } from '../../components/EmptyPress';
import { SearchField } from '../../components/SearchField';

export function SectionScreen({ navigation, route }: SectionProps) {
  const { sectionId } = route.params;
  const def = SECTIONS[sectionId];
  const { colors, type } = useAppTheme();
  const { articles, bookmarked, refreshing, refreshCatalog } = useLibrary();
  const [query, setQuery] = useState('');

  const items = useMemo(
    () => filterArticles(articles, query, sectionId),
    [articles, query, sectionId],
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={refreshCatalog}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={[type.kicker, { color: colors.accent }]}>{def.label}</Text>
            <Text style={[type.title, { color: colors.text }]}>{def.blurb}</Text>
            <SearchField
              value={query}
              onChangeText={setQuery}
              placeholder="Filtrer cette rubrique"
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyPress
            title="Aucun texte dans cette étagère"
            body="Le catalogue de démo est volontairement étroit. Un endpoint /articles peut l’élargir."
          />
        }
        renderItem={({ item }) => (
          <ArticleRow
            article={item}
            saved={bookmarked(item.id)}
            onPress={() => navigation.navigate('Article', { articleId: item.id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  header: { gap: 10, paddingTop: 8, paddingBottom: 8 },
});
