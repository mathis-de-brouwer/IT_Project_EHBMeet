import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import { useRouter } from 'expo-router';

interface AdminHeaderProps {
  title: string;
  children?: React.ReactNode;
  showSearch?: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, showSearch = false }) => {
  const router = useRouter();

  return (
    <>
      <LinearGradient 
        colors={['#44c9ea', 'white']} 
        style={styles.header}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={28} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.title}>{title}</Text>
          
          {showSearch && (
            <TouchableOpacity style={styles.searchButton}>
              <FontAwesome name="search" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
      <View style={styles.contentSpacer} />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 150,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 8,
  },
  searchButton: {
    position: 'absolute',
    right: 20,
    top: 20,
  },
  contentSpacer: {
    height: 150,
  },
});

export default AdminHeader; 