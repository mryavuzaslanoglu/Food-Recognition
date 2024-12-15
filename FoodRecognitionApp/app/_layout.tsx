import { Stack } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { PaperProvider } from 'react-native-paper';
import { theme } from '../src/constants/theme';
import React from 'react';
import { View, LogBox, Platform } from 'react-native';
import { ErrorBoundary } from '../src/components/common/ErrorBoundary';

// Development logging
if (__DEV__) {
  LogBox.ignoreLogs(['Require cycle:']);
  console.log('Platform:', Platform.OS);
  console.log('Running in development mode');
}

SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [fontsLoaded, fontError] = useFonts({
    // Eğer özel font kullanacaksanız buraya ekleyin
  });

  useEffect(() => {
    if (fontError) {
      console.error('Font yükleme hatası:', fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(error => {
        console.error('Splash screen gizleme hatası:', error);
      });
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ErrorBoundary>
      <PaperProvider theme={theme}>
        <Stack>
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }} 
          />
        </Stack>
      </PaperProvider>
    </ErrorBoundary>
  );
};

export default RootLayout;