import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <LinearGradient colors={['#44c9ea', 'white']} style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity style={styles.searchButton}>
          <FontAwesome name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 150, // Vergroot de hoogte om ruimte te creëren
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins',
    marginTop: 10, // Plaatst de titel iets naar beneden
  },
  searchButton: {
    position: 'absolute',
    right: 20, // Plaatst de knop aan de rechterkant
    top: 0,
  },
});

export default Header;
