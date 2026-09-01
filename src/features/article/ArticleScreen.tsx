import React, { useMemo } from 'react';
import { Linking, ScrollView, Share, StyleSheet, Text, View, Vibration } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ArticleProps } from '../../navigation/types';
import { sectionLabel } from '../../data/sections';
import { notesForArticle } from '../../domain/library';
import { formatStamp } from '../../lib/dates';
import { useLibrary } from '../../store/LibraryContext';
import { useAppTheme } from '../../theme/ThemeProvider';
import { EmptyPress } from '../../components/EmptyPress';
import { GoldRule } from '../../components/GoldRule';
import { PressableScale } from '../../components/PressableScale';

export function ArticleScreen({ navigation, route }: ArticleProps) {
  const { articleId } = route.params;
  const insets = useSafeAreaInsets();
  const { colors, type, isDark } = useAppTheme();
  const { articleById, bookmarked, toggleBookmark, notes, startNote } = useLibrary();
  const article = articleById(articleId);
  const saved = bookmarked(articleId);
  const linked = useMemo(
    () => notesForArticle(notes, articleId),
    [notes, articleId],
  );

  if (!article) {
    return (
      <View style={[styles.flex, { backgroundColor: colors.bg, padding: 20 }]}>
        <EmptyPress
          title="Texte introuvable"
          body="L’identifiant n’est plus dans le catalogue chargé."
        />
      </View>
    );
  }

  const paragraphs = article.body.split(/\n\n+/);

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 28 },
        ]}>
        <Text style={[type.kicker, { color: colors.accent }]}>
          {sectionLabel(article.section)}
        </Text>
        <Text style={[type.display, { color: colors.text }]}>{article.title}</Text>
        <Text style={[type.dek, { color: colors.textMuted }]}>{article.dek}</Text>
        <Text style={[type.caption, { color: colors.textMuted }]}>
          {article.readingMinutes} min  ·  {article.source}  ·  {formatStamp(article.publishedAt)}
        </Text>
        <GoldRule />

        <View style={styles.actions}>
          <PressableScale
            onPress={() => {
              toggleBookmark(article.id);
              Vibration.vibrate(10);
            }}
            accessibilityLabel={saved ? 'Retirer la coupure' : 'Découper l’article'}
            accessibilityState={{ selected: saved }}
            style={[styles.action, { borderColor: colors.accent }]}>
            <Text style={[type.ui, { color: colors.accent }]}>
              {saved ? 'Coupure au classeur' : 'Découper'}
            </Text>
          </PressableScale>
          <PressableScale
            onPress={() =>
              navigation.navigate('NoteEditor', {
                articleId: article.id,
                noteId: startNote(article.id).id,
              })
            }
            accessibilityLabel="Annoter dans le classeur"
            style={[styles.action, { borderColor: colors.rule }]}>
            <Text style={[type.ui, { color: colors.text }]}>Annoter</Text>
          </PressableScale>
          {article.canonicalUrl ? (
            <PressableScale
              onPress={() =>
                Linking.openURL(article.canonicalUrl as string).catch(() => undefined)
              }
              accessibilityLabel="Lire à la source"
              style={[styles.action, { borderColor: colors.rule }]}>
              <Text style={[type.ui, { color: colors.text }]}>Source</Text>
            </PressableScale>
          ) : (
            <PressableScale
              onPress={() =>
                Share.share({
                  title: article.title,
                  message: `${article.title}\n\n${article.dek}`,
                }).catch(() => undefined)
              }
              accessibilityLabel="Partager le chapeau"
              style={[styles.action, { borderColor: colors.rule }]}>
              <Text style={[type.ui, { color: colors.text }]}>Envoyer</Text>
            </PressableScale>
          )}
        </View>

        {paragraphs.map((paragraph, index) => (
          <Text
            key={`${article.id}-${index}`}
            style={[
              type.body,
              styles.para,
              { color: colors.text },
              index === 0 && !isDark ? styles.first : null,
            ]}>
            {paragraph}
          </Text>
        ))}

        {linked.length ? (
          <View style={styles.margin}>
            <GoldRule />
            <Text style={[type.kicker, { color: colors.accent }]}>Dans la marge</Text>
            {linked.map(note => (
              <PressableScale
                key={note.id}
                onPress={() => navigation.navigate('NoteEditor', { noteId: note.id })}
                accessibilityLabel={`Note ${note.title || 'sans titre'}`}>
                <Text style={[type.titleSm, { color: colors.text }]}>
                  {note.title || 'Sans titre'}
                </Text>
                <Text style={[type.caption, { color: colors.textMuted }]} numberOfLines={2}>
                  {note.body}
                </Text>
              </PressableScale>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 8, gap: 14 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  action: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  para: { marginBottom: 4 },
  first: { fontVariant: ['lining-nums'] },
  margin: { gap: 10, paddingTop: 8 },
});
