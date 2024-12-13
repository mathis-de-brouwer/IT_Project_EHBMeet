import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Header from '../../components/header';
import UserFooter from '../../components/footer';

const ActivityAdd = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <Header title="Add Activity" />

      {/* Body */}
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.text}>This is the Add Activity Page</Text>
      </ScrollView>

      {/* Footer */}
      <UserFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f5',
  },
  body: {
    paddingTop: 150, // Provides space below the header
    paddingBottom: 70, // Provides space above the footer
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
});

export default ActivityAdd;
