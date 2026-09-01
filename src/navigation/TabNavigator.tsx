import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, StyleSheet, Text } from 'react-native';
import { ArticleScreen } from '../features/article/ArticleScreen';
import { CabinetScreen } from '../features/cabinet/CabinetScreen';
import { ClasseurScreen } from '../features/classeur/ClasseurScreen';
import { NoteEditorScreen } from '../features/classeur/NoteEditorScreen';
import { RevueScreen } from '../features/classeur/RevueScreen';
import { ExploreScreen } from '../features/explore/ExploreScreen';
import { SectionScreen } from '../features/explore/SectionScreen';
import { TodayScreen } from '../features/today/TodayScreen';
import { TabGlyph } from '../components/TabGlyph';
import { useAppTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/typography';
import { SECTIONS } from '../data/sections';
import { stackOptions } from './stackOptions';
import type {
  CabinetStackParamList,
  ClasseurStackParamList,
  EditionStackParamList,
  MainTabParamList,
  RubriquesStackParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const EditionStack = createNativeStackNavigator<EditionStackParamList>();
const RubriquesStack = createNativeStackNavigator<RubriquesStackParamList>();
const ClasseurStack = createNativeStackNavigator<ClasseurStackParamList>();
const CabinetStack = createNativeStackNavigator<CabinetStackParamList>();

function EditionNavigator() {
  const { colors } = useAppTheme();
  return (
    <EditionStack.Navigator screenOptions={stackOptions(colors)}>
      <EditionStack.Screen
        name="Today"
        component={TodayScreen}
        options={{ headerShown: false }}
      />
      <EditionStack.Screen
        name="Article"
        component={ArticleScreen}
        options={{ title: 'Texte' }}
      />
      <EditionStack.Screen
        name="NoteEditor"
        component={NoteEditorScreen}
        options={{ title: 'Feuille' }}
      />
    </EditionStack.Navigator>
  );
}

function RubriquesNavigator() {
  const { colors } = useAppTheme();
  return (
    <RubriquesStack.Navigator screenOptions={stackOptions(colors)}>
      <RubriquesStack.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ headerShown: false }}
      />
      <RubriquesStack.Screen
        name="Section"
        component={SectionScreen}
        options={({ route }) => ({ title: SECTIONS[route.params.sectionId].label })}
      />
      <RubriquesStack.Screen
        name="Article"
        component={ArticleScreen}
        options={{ title: 'Texte' }}
      />
      <RubriquesStack.Screen
        name="NoteEditor"
        component={NoteEditorScreen}
        options={{ title: 'Feuille' }}
      />
    </RubriquesStack.Navigator>
  );
}

function ClasseurNavigator() {
  const { colors } = useAppTheme();
  return (
    <ClasseurStack.Navigator screenOptions={stackOptions(colors)}>
      <ClasseurStack.Screen
        name="ClasseurHome"
        component={ClasseurScreen}
        options={{ headerShown: false }}
      />
      <ClasseurStack.Screen
        name="Revue"
        component={RevueScreen}
        options={{ title: 'Revue' }}
      />
      <ClasseurStack.Screen
        name="NoteEditor"
        component={NoteEditorScreen}
        options={{ title: 'Feuille' }}
      />
      <ClasseurStack.Screen
        name="Article"
        component={ArticleScreen}
        options={{ title: 'Texte' }}
      />
    </ClasseurStack.Navigator>
  );
}

function CabinetNavigator() {
  const { colors } = useAppTheme();
  return (
    <CabinetStack.Navigator screenOptions={stackOptions(colors)}>
      <CabinetStack.Screen
        name="CabinetHome"
        component={CabinetScreen}
        options={{ headerShown: false }}
      />
    </CabinetStack.Navigator>
  );
}

export function TabNavigator() {
  const { colors, type } = useAppTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.accent,
          borderTopWidth: StyleSheet.hairlineWidth * 2,
          height: Platform.OS === 'ios' ? 84 : 68,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: fonts.ui,
          fontSize: 11,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="EditionTab"
        component={EditionNavigator}
        options={{
          title: 'Édition',
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph name="edition" color={color} focused={focused} />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={[type.kicker, { color, fontSize: 10 }]}>Édition</Text>
          ),
          tabBarAccessibilityLabel: 'Édition du jour',
        }}
      />
      <Tab.Screen
        name="RubriquesTab"
        component={RubriquesNavigator}
        options={{
          title: 'Rubriques',
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph name="rubriques" color={color} focused={focused} />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={[type.kicker, { color, fontSize: 10 }]}>Rubriques</Text>
          ),
          tabBarAccessibilityLabel: 'Rubriques',
        }}
      />
      <Tab.Screen
        name="ClasseurTab"
        component={ClasseurNavigator}
        options={{
          title: 'Classeur',
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph name="classeur" color={color} focused={focused} />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={[type.kicker, { color, fontSize: 10 }]}>Classeur</Text>
          ),
          tabBarAccessibilityLabel: 'Classeur',
        }}
      />
      <Tab.Screen
        name="CabinetTab"
        component={CabinetNavigator}
        options={{
          title: 'Cabinet',
          tabBarIcon: ({ color, focused }) => (
            <TabGlyph name="cabinet" color={color} focused={focused} />
          ),
          tabBarLabel: ({ color }) => (
            <Text style={[type.kicker, { color, fontSize: 10 }]}>Cabinet</Text>
          ),
          tabBarAccessibilityLabel: 'Cabinet',
        }}
      />
    </Tab.Navigator>
  );
}
