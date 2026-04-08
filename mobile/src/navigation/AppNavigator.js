import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

import DashboardScreen from '../screens/DashboardScreen';
import ChaptersScreen from '../screens/ChaptersScreen';
import ChapterFormScreen from '../screens/ChapterFormScreen';
import ProfileScreen from '../screens/ProfileScreen';

const screenOptions = {
  headerStyle: { backgroundColor: colors.bgCard },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '600' },
  headerShadowVisible: false,
};

function ChaptersStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="ChaptersList" component={ChaptersScreen} options={{ title: 'Chapters' }} />
      <Stack.Screen
        name="ChapterForm"
        component={ChapterFormScreen}
        options={({ route }) => ({
          title: route.params?.chapter ? 'Edit Chapter' : 'New Chapter',
        })}
      />
    </Stack.Navigator>
  );
}

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...screenOptions,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'grid' : 'grid-outline';
          else if (route.name === 'Chapters') iconName = focused ? 'book' : 'book-outline';
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Chapters" component={ChaptersStack} options={{ headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
