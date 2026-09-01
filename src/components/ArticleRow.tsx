import React, { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Article } from '../types/models';
import { sectionLabel } from '../data/sections';
import { useAppTheme } from '../theme/ThemeProvider';
import { PressableScale } from './PressableScale';

type Props = {
  article: Article;
  onPress: () => void;
  showRank?: boolean;
  saved?: boolean;
};

function ArticleRowInner({ article, onPress, showRank, saved }: Props) {
  const { colors, type } = useAppTheme();

  return (
    <PressableScale
      onPress={onPress}
      accessibilityLabel={`${article.title}. ${sectionLabel(article.section)}. ${article.readingMinutes} minutes.`}
      style={[styles.row, { borderBottomColor: colors.rule }]}>
      {showRank && article.rank ? (
        <View style={styles.rankCol} accessibilityElementsHidden>
          <Text style={[type.kicker, { color: colors.accent }]}>
            {String(article.rank).padStart(2, '0')}
          </Text>
        </View>
      ) : null}
      <View style={styles.body}>
        <Text style={[type.kicker, { color: colors.textMuted }]}>
          {sectionLabel(article.section)}
          {saved ? '  ·  coupure' : ''}
        </Text>
        <Text style={[type.titleSm, { color: colors.text }]}>{article.title}</Text>
        <Text style={[type.dek, { color: colors.textMuted }]} numberOfLines={3}>
          {article.dek}
        </Text>
        <Text style={[type.caption, { color: colors.textMuted }]}>
          {article.readingMinutes} min  ·  {article.source}
        </Text>
      </View>
    </PressableScale>
  );
}

export const ArticleRow = memo(ArticleRowInner);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  rankCol: {
    width: 28,
    paddingTop: 4,
  },
  body: {
    flex: 1,
    gap: 6,
  },
});
