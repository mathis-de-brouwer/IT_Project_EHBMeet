import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <LinearGradient 
      colors={['#44c9ea', 'white']} 
      style={styles.header}
    >
      <View style={styles.headerContent}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 150,
    width: '100%',
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
    paddingTop: 40,
    position: 'relative',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins',
    marginBottom: 20,
  },
});

export default Header;