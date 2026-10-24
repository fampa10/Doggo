import React, { useEffect } from 'react';
import { StyleSheet, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { BreedListScreen } from './src/screens/BreedListScreen';
import { BreedDetailScreen } from './src/screens/BreedDetailScreen';
import { useDogStore } from './src/store/dogStore';
import { useAppTheme } from './src/hooks/useAppTheme';
import { useNetworkSync } from './src/hooks/useNetworkSync';

function MainApp(): React.JSX.Element {
  const { colors, isDark } = useAppTheme();
  const hydrateFromStorage = useDogStore((state) => state.hydrateFromStorage);
  const selectedBreedId = useDogStore((state) => state.selectedBreedId);

  // Initialize network listeners
  useNetworkSync();

  // Hydrate normalized cache from AsyncStorage on app launch
  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: colors.background,
          paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight || 0 : 0,
        },
      ]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {selectedBreedId ? <BreedDetailScreen /> : <BreedListScreen />}
    </SafeAreaView>
  );
}

export default function App(): React.JSX.Element {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
});
