import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/theme/tokens';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <BottomSheetModalProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg },
            headerTintColor: colors.textPrimary,
            headerTitleStyle: { fontWeight: '600' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: 'Obyay',
              headerLargeTitle: true,
              headerLargeTitleStyle: {
                color: colors.textPrimary,
                fontWeight: '800',
              },
            }}
          />
          <Stack.Screen
            name="NewHobby"
            options={{
              presentation: 'modal',
              title: 'New Hobby',
              headerStyle: { backgroundColor: colors.surface },
            }}
          />
          <Stack.Screen
            name="hobby/[hobbyId]"
            options={{
              title: '',
              headerBackTitle: 'Back',
            }}
          />
          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
