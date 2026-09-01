import React, { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TodayProps } from '../../navigation/types';
import { articlesForEdition, buildEdition, isFeedArticle } from '../../domain/edition';
import { civilDate, isSunday } from '../../lib/dates';
import { useLibrary } from '../../store/LibraryContext';
import { useAppTheme } from '../../theme/ThemeProvider';
import { ArticleRow } from '../../components/ArticleRow';
import { EmptyPress } from '../../components/EmptyPress';
import { Masthead } from '../../components/Masthead';
import { OfflineBanner } from '../../components/OfflineBanner';
import { PressableScale } from '../../components/PressableScale';
import type { Article } from '../../types/models';

function feedSources(items: Article[]): string {
  const names = [
    ...new Set(items.filter(isFeedArticle).map(item => item.source)),
  ];
  return names.length ? names.join(', ') : 'essais du cahier';
}

export function TodayScreen({ navigation }: TodayProps) {
  const insets = useSafeAreaInsets();
  const { colors, type } = useAppTheme();
  const { articles, ready, refreshing, refreshCatalog, online, bookmarked, feedCache } =
    useLibrary();

  const date = civilDate();
  const edition = useMemo(() => buildEdition(articles, date), [articles, date]);
  const items = useMemo(
    () => articlesForEdition(articles, edition),
    [articles, edition],
  );

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      <OfflineBanner visible={!online} />
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={refreshCatalog}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: 32 },
        ]}
        initialNumToRender={10}
        windowSize={7}
        removeClippedSubviews
        ListHeaderComponent={
          <View style={styles.header}>
            <Masthead date={date} />
            <Text style={[type.dek, { color: colors.textMuted }]}>
              {edition.kicker} Pas de « pour toi ». Pas de suite automatique.
            </Text>
            {feedCache?.articles.length ? (
              <Text style={[type.caption, { color: colors.textMuted }]}>
                Flux : {feedSources(items)}
                {feedCache.failures.length
                  ? `  ·  ${feedCache.failures.length} source${feedCache.failures.length > 1 ? 's' : ''} muette${feedCache.failures.length > 1 ? 's' : ''}`
                  : ''}
              </Text>
            ) : null}
            {isSunday(date) ? (
              <PressableScale
                onPress={() =>
                  navigation.navigate('ClasseurTab', { screen: 'Revue' })
                }
                style={[styles.revue, { borderColor: colors.accent }]}
                accessibilityLabel="Ouvrir la revue du dimanche">
                <Text style={[type.ui, { color: colors.accent }]}>
                  Dimanche — relire tes notes de la semaine
                </Text>
              </PressableScale>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          ready ? (
            <EmptyPress
              title="Édition encore vide"
              body="Le catalogue n’a pas renvoyé dix textes. Tire pour rafraîchir, ou ouvre Rubriques."
            />
          ) : (
            <Text style={[type.ui, { color: colors.textMuted }]}>Ouverture du cahier…</Text>
          )
        }
        ListFooterComponent={
          items.length ? (
            <Text style={[type.caption, styles.footer, { color: colors.textMuted }]}>
              L’édition est close. Le reste du catalogue est dans Rubriques — par choix, pas par
              fil.
            </Text>
          ) : undefined
        }
        renderItem={({ item }) => (
          <ArticleRow
            article={item}
            showRank
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
  content: { paddingHorizontal: 20 },
  header: { gap: 12, paddingBottom: 8 },
  footer: { paddingTop: 20, paddingBottom: 8, lineHeight: 20 },
  revue: { borderWidth: 1, paddingHorizontal: 12 },
});
