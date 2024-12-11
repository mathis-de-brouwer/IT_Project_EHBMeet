import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import UserFooter from '../components/footer';

const Home = () => {
  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.content}>Welcome to Student Meet!</Text>
      </View>
      <UserFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default Home;
