import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import TestingFirebase from './app/(tabs)/testingfirebase';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <TestingFirebase />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
});

export default App;
