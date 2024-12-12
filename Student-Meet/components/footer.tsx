import React from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const UserFooter = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.iconContainer}>
          <Ionicons name="home-outline" size={35} color="#00bfa5" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconContainer}>
          <Ionicons name="calendar-outline" size={35} color="#00bfa5" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconContainer}>
          <Ionicons name="add-circle-outline" size={35} color="#00bfa5" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconContainer}>
          <Ionicons name="person-outline" size={35} color="#00bfa5" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#f0f4f5',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 70,
    backgroundColor: '#f0f4f5',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 5,
    marginTop: 'auto',
  },
  iconContainer: {
    padding: 15,
  },
});

export default UserFooter;
