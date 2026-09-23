import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NavigationProp } from '@react-navigation/native';
import type { CabinetProps, MainTabParamList } from '../../navigation/types';
import type { FontScaleId, ThemeMode } from '../../types/models';
import { renderClasseurMarkdown } from '../../domain/classeurMarkdown';
import { civilDate, formatStamp, isSunday } from '../../lib/dates';
import { shareMarkdownFile } from '../../services/export/shareMarkdown';
import { isRemoteEnabled } from '../../services/config';
import { useLibrary } from '../../store/LibraryContext';
import { useSettings } from '../../store/SettingsContext';
import { useAppTheme } from '../../theme/ThemeProvider';
import { BrandMark } from '../../components/BrandMark';
import { GoldRule } from '../../components/GoldRule';
import { PressableScale } from '../../components/PressableScale';

export function CabinetScreen({ navigation }: CabinetProps) {
  const insets = useSafeAreaInsets();
  const { colors, type } = useAppTheme();
  const { settings, setThemeMode, setFontScale, replayOnboarding } = useSettings();
  const {
    notes,
    bookmarks,
    articles,
    queue,
    online,
    syncNow,
    syncing,
    lastSync,
    feedCache,
  } = useLibrary();
  const today = civilDate();

  const exportClasseur = async () => {
    try {
      const mode = await shareMarkdownFile(
        `Classeur-Ludovic-Zacharie-Nolet-Gilbert-${today}.md`,
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
          'Choisis « Enregistrer dans Fichiers » dans la feuille iOS.',
        );
      }
    } catch {
      Alert.alert('Export annulé', 'Le classeur n’a pas quitté l’appareil.');
    }
  };

  const openRevue = () => {
    navigation
      .getParent<NavigationProp<MainTabParamList>>()
      ?.navigate('ClasseurTab', { screen: 'Revue' });
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 28 },
      ]}>
      <BrandMark size={88} />
      <Text style={[type.kicker, { color: colors.accent }]}>Cabinet</Text>
      <Text style={[type.display, { color: colors.text }]}>Ludovic Zacharie Nolet Gilbert</Text>
      <Text style={[type.dek, { color: colors.textMuted }]}>
        Ceci n’est pas un réseau social. Pas de likes, pas de commentaires, pas de fil. Un cahier,
        une édition, une mémoire.
      </Text>
      <GoldRule />

      <Text style={[type.kicker, { color: colors.textMuted }]}>Lumière</Text>
      <View style={styles.row}>
        {(
          [
            ['system', 'Système'],
            ['light', 'Papier'],
            ['dark', 'Encre'],
          ] as const
        ).map(([id, label]: readonly [ThemeMode, string]) => (
          <Choice
            key={id}
            label={label}
            selected={settings.themeMode === id}
            onPress={() => setThemeMode(id)}
          />
        ))}
      </View>

      <Text style={[type.kicker, { color: colors.textMuted }]}>Corps de texte</Text>
      <View style={styles.row}>
        {(
          [
            ['regular', 'Lecture'],
            ['large', 'Large'],
            ['xlarge', 'Très large'],
          ] as const
        ).map(([id, label]: readonly [FontScaleId, string]) => (
          <Choice
            key={id}
            label={label}
            selected={settings.fontScale === id}
            onPress={() => setFontScale(id)}
          />
        ))}
      </View>
      <Text style={[type.caption, { color: colors.textMuted }]}>
        Les tailles respectent aussi les réglages d’accessibilité iOS (Dynamic Type).
      </Text>

      <GoldRule />
      <Text style={[type.kicker, { color: colors.textMuted }]}>Classeur</Text>
      <PressableScale
        onPress={openRevue}
        style={[styles.choice, { borderColor: isSunday(today) ? colors.accent : colors.rule }]}>
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
        style={[styles.choice, { borderColor: colors.accent }]}
        accessibilityLabel="Exporter le classeur en Markdown">
        <Text style={[type.ui, { color: colors.accent }]}>
          Exporter vers Fichiers (.md)
        </Text>
      </PressableScale>
      {feedCache?.fetchedAt ? (
        <Text style={[type.caption, { color: colors.textMuted }]}>
          Flux : {feedCache.articles.length} titres, {feedCache.failures.length} muets,{' '}
          {formatStamp(feedCache.fetchedAt)}.
        </Text>
      ) : (
        <Text style={[type.caption, { color: colors.textMuted }]}>
          Les flux se chargent à l’ouverture. Sage / Nectari / Power BI restent des essais — pas
          un KPI inventé.
        </Text>
      )}

      <GoldRule />
      <Text style={[type.kicker, { color: colors.textMuted }]}>Mémoire</Text>
      <Text style={[type.ui, { color: colors.text }]}>
        {bookmarks.length} coupure{bookmarks.length > 1 ? 's' : ''}  ·  {notes.length} note
        {notes.length > 1 ? 's' : ''}
        {queue.length ? `  ·  ${queue.length} en file` : ''}
      </Text>
      <Text style={[type.caption, { color: colors.textMuted }]}>
        {online ? 'Réseau présent.' : 'Hors-ligne.'}{' '}
        {isRemoteEnabled()
            ? lastSync
              ? `Sync : ${formatStamp(lastSync)}`
              : 'Serveur configuré, pas encore synchronisé.'
          : 'Aucun serveur — AsyncStorage est la source.'}
      </Text>
      {isRemoteEnabled() ? (
        <PressableScale
          onPress={syncNow}
          disabled={syncing}
          style={[styles.choice, { borderColor: colors.accent }]}>
          <Text style={[type.ui, { color: colors.accent }]}>
            {syncing ? 'Sync…' : 'Synchroniser maintenant'}
          </Text>
        </PressableScale>
      ) : null}

      <PressableScale
        onPress={replayOnboarding}
        accessibilityLabel="Revoir l’accueil"
        style={[styles.choice, { borderColor: colors.rule }]}>
        <Text style={[type.ui, { color: colors.text }]}>Revoir l’accueil</Text>
      </PressableScale>
    </ScrollView>
  );
}

function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, type } = useAppTheme();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={[
        styles.choice,
        { borderColor: selected ? colors.accent : colors.rule },
      ]}>
      <Text style={[type.ui, { color: selected ? colors.accent : colors.text }]}>
        {label}
      </Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, gap: 14 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  choice: { borderWidth: 1, paddingHorizontal: 12 },
});
