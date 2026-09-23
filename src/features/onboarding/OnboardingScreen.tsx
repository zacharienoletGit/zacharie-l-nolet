import React, { useRef, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../store/SettingsContext';
import { useAppTheme } from '../../theme/ThemeProvider';
import { BrandMark } from '../../components/BrandMark';
import { GoldRule } from '../../components/GoldRule';
import { PressableScale } from '../../components/PressableScale';

const PAGES = [
  {
    kicker: '01',
    title: 'Pas un fil. Une édition.',
    body: 'Dix textes par jour. Ensuite, c’est clos. Le reste attend dans les rubriques — tu y vas, on ne t’y pousse pas.',
  },
  {
    kicker: '02',
    title: 'Découper, pas aimer.',
    body: 'Une coupure est une décision. Pas un cœur. Elle entre dans le classeur, avec ou sans réseau.',
  },
  {
    kicker: '03',
    title: 'La marge est à toi.',
    body: 'Annoter : ce qui est dit, ce que tu en fais, ce qu’il reste à vérifier. Rien n’est public.',
  },
  {
    kicker: '04',
    title: 'Remplacer le scroll.',
    body: 'Ferme l’app après l’édition. Si tu reviens pour « voir s’il y a du nouveau », tu as déjà perdu le geste.',
  },
];

export function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, type } = useAppTheme();
  const { completeOnboarding } = useSettings();
  const [index, setIndex] = useState(0);
  const list = useRef<FlatList<(typeof PAGES)[number]>>(null);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    if (next !== index) {
      setIndex(next);
    }
  };

  const last = index === PAGES.length - 1;

  return (
    <View style={[styles.flex, { backgroundColor: colors.bg, paddingTop: insets.top + 12 }]}>
      <View style={styles.brand}>
        <BrandMark size={96} />
        <Text style={[type.kicker, { color: colors.accent }]}>Ludovic Zacharie Nolet Gilbert</Text>
      </View>
      <FlatList
        ref={list}
        data={PAGES}
        keyExtractor={item => item.kicker}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={[styles.page, { width, paddingHorizontal: 24 }]}>
            <Text style={[type.kicker, { color: colors.accent }]}>{item.kicker}</Text>
            <Text style={[type.display, { color: colors.text }]}>{item.title}</Text>
            <GoldRule />
            <Text style={[type.dek, { color: colors.textMuted }]}>{item.body}</Text>
          </View>
        )}
      />
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.dots} accessibilityLabel={`Page ${index + 1} sur ${PAGES.length}`}>
          {PAGES.map((page, i) => (
            <View
              key={page.kicker}
              style={[
                styles.dot,
                { backgroundColor: i === index ? colors.accent : colors.rule },
              ]}
            />
          ))}
        </View>
        <PressableScale
          onPress={() => {
            if (last) {
              completeOnboarding();
              return;
            }
            list.current?.scrollToIndex({ index: index + 1, animated: true });
          }}
          style={[styles.cta, { borderColor: colors.accent }]}
          accessibilityLabel={last ? 'Entrer dans le cahier' : 'Page suivante'}>
          <Text style={[type.ui, { color: colors.accent }]}>
            {last ? 'Entrer dans le cahier' : 'Continuer'}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  brand: { alignItems: 'center', gap: 10, paddingHorizontal: 24 },
  page: { gap: 14, paddingTop: 28 },
  footer: { paddingHorizontal: 24, gap: 14 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center' },
  dot: { width: 18, height: 3 },
  cta: { borderWidth: 1, alignItems: 'center' },
});
