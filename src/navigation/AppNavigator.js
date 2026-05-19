import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors, radius } from '../theme/colors';
import { text } from '../theme/typography';

import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import TimelineScreen from '../screens/TimelineScreen';
import TimelineDetailScreen from '../screens/TimelineDetailScreen';
import MemoriesScreen from '../screens/MemoriesScreen';
import AddMemoryScreen from '../screens/AddMemoryScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AddOccasionScreen from '../screens/AddOccasionScreen';
import BlackBoxScreen from '../screens/BlackBoxScreen';
import AddBlackBoxScreen from '../screens/AddBlackBoxScreen';
import LettersScreen from '../screens/LettersScreen';
import WriteLetterScreen from '../screens/WriteLetterScreen';
import QuizScreen from '../screens/QuizScreen';
import QuizPlayScreen from '../screens/QuizPlayScreen';
import MoodScreen from '../screens/MoodScreen';
import PhotoPickerScreen from '../screens/PhotoPickerScreen';
import SettingsScreen from '../screens/SettingsScreen';
import VoiceNotesScreen from '../screens/VoiceNotesScreen';
import MemoryOfDayScreen from '../screens/MemoryOfDayScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TABS = [
  { name: 'Home', label: 'Home', glyph: '◯', component: HomeScreen },
  { name: 'Timeline', label: 'Story', glyph: '▱', component: TimelineScreen },
  { name: 'Calendar', label: 'Calendar', glyph: '◧', component: CalendarScreen },
  { name: 'BlackBox', label: 'Vault', glyph: '◼', component: BlackBoxScreen },
  { name: 'Settings', label: 'Us', glyph: '∞', component: SettingsScreen },
];

function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        paddingTop: 8,
        paddingBottom: 22,
        paddingHorizontal: 14,
        backgroundColor: colors.paper,
        borderTopWidth: 1,
        borderTopColor: colors.edge,
      }}
    >
      {state.routes.map((route, index) => {
        const tab = TABS.find((t) => t.name === route.name);
        const focused = state.index === index;
        return (
          <Pressable
            key={route.key}
            testID={`tab-${route.name.toLowerCase()}`}
            onPress={() => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            }}
            style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}
          >
            <Text style={{ fontSize: 18, color: focused ? colors.terracotta : colors.inkFaint, marginBottom: 4 }}>
              {tab?.glyph}
            </Text>
            <Text
              style={[
                text.caption,
                { color: focused ? colors.terracotta : colors.inkFaint, letterSpacing: 1 },
              ]}
            >
              {tab?.label}
            </Text>
            {focused ? (
              <View
                style={{
                  marginTop: 4,
                  width: 18,
                  height: 2,
                  borderRadius: radius.pill,
                  backgroundColor: colors.terracotta,
                }}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(p) => <CustomTabBar {...p} />}
    >
      {TABS.map((t) => (
        <Tab.Screen key={t.name} name={t.name} component={t.component} />
      ))}
    </Tab.Navigator>
  );
}

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.paper, card: colors.paper, text: colors.ink },
};

export default function AppNavigator({ initialRoute }) {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper } }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Main" component={Tabs} />
        <Stack.Screen name="TimelineDetail" component={TimelineDetailScreen} />
        <Stack.Screen name="Memories" component={MemoriesScreen} />
        <Stack.Screen name="AddMemory" component={AddMemoryScreen} />
        <Stack.Screen name="AddOccasion" component={AddOccasionScreen} />
        <Stack.Screen name="AddBlackBox" component={AddBlackBoxScreen} />
        <Stack.Screen name="Letters" component={LettersScreen} />
        <Stack.Screen name="WriteLetter" component={WriteLetterScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="QuizPlay" component={QuizPlayScreen} />
        <Stack.Screen name="Mood" component={MoodScreen} />
        <Stack.Screen name="PhotoPicker" component={PhotoPickerScreen} />
        <Stack.Screen name="VoiceNotes" component={VoiceNotesScreen} />
        <Stack.Screen name="MemoryOfDay" component={MemoryOfDayScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
