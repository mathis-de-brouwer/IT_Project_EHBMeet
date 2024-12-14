import React from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type RootStackParamList = {
  home: undefined;
  agenda: undefined;
  activity_add: undefined;
  MyProfile: undefined;
};

type NavigationProp = BottomTabNavigationProp<RootStackParamList>;

const UserFooter = () => {
  const navigation = useNavigation<NavigationProp>(); // Use navigation with the correct type

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('home')}
        >
          <Ionicons name="home-outline" size={35} color="#00bfa5" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('agenda')}
        >
          <Ionicons name="calendar-outline" size={35} color="#00bfa5" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('activity_add')}
        >
          <Ionicons name="add-circle-outline" size={35} color="#00bfa5" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigation.navigate('MyProfile')}
        >
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
