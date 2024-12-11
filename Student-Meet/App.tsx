import React, { useCallback } from 'react';
import { View } from 'react-native';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

SplashScreen.preventAutoHideAsync();

export default function App() {
  // Fonts laden
  const [fontsLoaded] = useFonts({
    Poppins: require('./assets/fonts/Poppins-Regular.ttf'),
    PoppinsBold: require('./assets/fonts/Poppins-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; // Wacht tot fonts geladen zijn
  }

  return (
    <View
      style={{ flex: 1 }}
      onLayout={onLayoutRootView} // Hier wordt onLayout correct toegepast
    >
      {/* Slot render routes */}
      <Slot />
      <StatusBar style="auto" />
    </View>
  );
}
