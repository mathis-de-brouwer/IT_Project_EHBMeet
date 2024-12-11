import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import { ScrollView } from 'react-native';


export default function HomeScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
      <LinearGradient
        colors={['#44c9ea', 'white']}
        style={styles.header} >
        <Text style={styles.title}>Student Meet</Text>
        <TouchableOpacity>
          <FontAwesome name="search" size={24} color="white" />
        </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Body */}
      <ScrollView contentContainerStyle={styles.body}>
        {/* Placeholder for events */}
        <Text style={styles.placeholderText}>Evenementen komen hier...</Text>
        <Text style={styles.placeholderText}>Scroll omhoog voor meer evenementen!</Text>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity>
          <Ionicons name="home" size={30} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="calendar" size={30} color={Colors.secondary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="add-circle" size={50} color={Colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Ionicons name="person" size={30} color={Colors.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
    paddingTop: 120, // Zorgt voor ruimte onder de header
    paddingBottom: 100, // Zorgt voor ruimte boven de footer
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 18,
    color: Colors.text,
    fontFamily: 'Poppins',
    marginVertical: 20,
  },
  navigation: {
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#f1f2f6',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});
