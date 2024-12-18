import React from 'react';
import { View, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';

const UserFooter = () => {
  const router = useRouter();
  const currentPath = usePathname();

  const isActive = (path: string) => currentPath.includes(path);

  const navigate = (path: string) => {
    router.replace(path as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.footerContainer}>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigate('/(app)/home')}
        >
          <Ionicons 
            name={isActive('home') ? 'home' : 'home-outline'} 
            size={35} 
            color={isActive('home') ? '#00bfa5' : '#666'} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigate('/(app)/agenda')}
        >
          <Ionicons 
            name={isActive('agenda') ? 'calendar' : 'calendar-outline'} 
            size={35} 
            color={isActive('agenda') ? '#00bfa5' : '#666'} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigate('/(app)/events/activity_add')}
        >
          <Ionicons 
            name={isActive('activity_add') ? 'add-circle' : 'add-circle-outline'} 
            size={35} 
            color={isActive('activity_add') ? '#00bfa5' : '#666'} 
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => navigate('/(app)/profile/MyProfile')}
        >
          <Ionicons 
            name={isActive('profile') ? 'person' : 'person-outline'} 
            size={35} 
            color={isActive('profile') ? '#00bfa5' : '#666'} 
          />
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
