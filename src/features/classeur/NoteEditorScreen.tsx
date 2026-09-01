import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NoteEditorProps } from '../../navigation/types';
import { createNoteId } from '../../domain/library';
import { useLibrary } from '../../store/LibraryContext';
import { useAppTheme } from '../../theme/ThemeProvider';
import { PressableScale } from '../../components/PressableScale';
import { GoldRule } from '../../components/GoldRule';
import type { Note } from '../../types/models';

export function NoteEditorScreen({ navigation, route }: NoteEditorProps) {
  const { noteId, articleId } = route.params;
  const insets = useSafeAreaInsets();
  const { colors, type } = useAppTheme();
  const { notes, saveNote, removeNote, articleById } = useLibrary();

  const initial = useMemo<Note>(() => {
    const found = noteId ? notes.find(n => n.id === noteId) : undefined;
    if (found) {
      return found;
    }
    const now = new Date().toISOString();
    return {
      id: noteId ?? createNoteId(),
      articleId,
      title: '',
      body: '',
      createdAt: now,
      updatedAt: now,
    };
  }, [noteId, articleId, notes]);

  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [dirty, setDirty] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const article = initial.articleId ? articleById(initial.articleId) : undefined;
  const exists = notes.some(n => n.id === initial.id);

  useEffect(() => {
    return () => {
      if (persistTimer.current) {
        clearTimeout(persistTimer.current);
      }
    };
  }, []);

  const persist = (nextTitle: string, nextBody: string) => {
    if (!nextTitle.trim() && !nextBody.trim()) {
      return;
    }
    saveNote({
      ...initial,
      title: nextTitle.trim(),
      body: nextBody,
    });
    setDirty(false);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
  };

  const schedule = (nextTitle: string, nextBody: string) => {
    setDirty(true);
    if (persistTimer.current) {
      clearTimeout(persistTimer.current);
    }
    persistTimer.current = setTimeout(() => persist(nextTitle, nextBody), 1400);
  };

  const onDelete = () => {
    Alert.alert('Détruire cette feuille ?', 'La note quitte le classeur local et la file de sync.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Détruire',
        style: 'destructive',
        onPress: () => {
          if (exists) {
            removeNote(initial.id);
          }
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 24 },
        ]}>
        <Text style={[type.kicker, { color: colors.accent }]}>
          {savedFlash ? 'Enregistré dans le classeur' : dirty ? 'Brouillon…' : 'Feuille'}
        </Text>
        {article ? (
          <PressableScale
            onPress={() => navigation.navigate('Article', { articleId: article.id })}
            accessibilityLabel={`Lié à ${article.title}`}>
            <Text style={[type.caption, { color: colors.textMuted }]}>
              En marge de « {article.title} »
            </Text>
          </PressableScale>
        ) : (
          <Text style={[type.caption, { color: colors.textMuted }]}>
            Note libre — aucune coupure obligatoire.
          </Text>
        )}
        <GoldRule />
        <TextInput
          value={title}
          onChangeText={text => {
            setTitle(text);
            schedule(text, body);
          }}
          placeholder="Titre — une phrase que tu retrouveras"
          placeholderTextColor={colors.textMuted}
          allowFontScaling
          accessibilityLabel="Titre de la note"
          style={[type.title, styles.title, { color: colors.text }]}
        />
        <TextInput
          value={body}
          onChangeText={text => {
            setBody(text);
            schedule(title, text);
          }}
          placeholder={
            'Trois mouvements : ce qui est dit. Ce que j’en fais. Ce que je dois vérifier.'
          }
          placeholderTextColor={colors.textMuted}
          multiline
          textAlignVertical="top"
          allowFontScaling
          accessibilityLabel="Corps de la note"
          style={[type.body, styles.body, { color: colors.text }]}
        />
        <View style={styles.row}>
          <PressableScale
            onPress={() => persist(title, body)}
            accessibilityLabel="Enregistrer maintenant"
            style={[styles.btn, { borderColor: colors.accent }]}>
            <Text style={[type.ui, { color: colors.accent }]}>Enregistrer</Text>
          </PressableScale>
          <PressableScale
            onPress={onDelete}
            accessibilityLabel="Supprimer la note"
            style={[styles.btn, { borderColor: colors.danger }]}>
            <Text style={[type.ui, { color: colors.danger }]}>Détruire</Text>
          </PressableScale>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 12, gap: 12 },
  title: { paddingVertical: 4 },
  body: { minHeight: 280 },
  row: { flexDirection: 'row', gap: 10 },
  btn: { borderWidth: 1, paddingHorizontal: 14 },
});
