import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import UserFooter from '../../components/footer';
import Colors from '../../constants/Colors';

const Home = () => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#44c9ea', 'white']} style={styles.header}>
        <Text style={styles.title}>Student Meet</Text>
        <TouchableOpacity>
          <FontAwesome name="search" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.placeholderText}>Evenementen komen hier...</Text>
        <Text style={styles.placeholderText}>Scroll omhoog voor meer evenementen!</Text>
      </ScrollView>

      {/* Footer */}
      <UserFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 120,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins',
  },
  body: {
    paddingTop: 120, // Provides space below the header
    paddingBottom: 100, // Provides space above the footer
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: Colors.text,
    fontFamily: 'Poppins',
    marginVertical: 20,
  },
});

export default Home;

