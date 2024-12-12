import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { db } from '../../firebase_backup.js';
import { collection, addDoc } from 'firebase/firestore';

export default function RegisterScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    First_Name: '',
    Second_name: '',
    email: '',
    Password: '',
    User_ID: '',
    Blacklisted: false,
    Description: '',
    Discord_name: '',
    Profile_Picture: '',
    Steam_name: '',
  });

  const handleRegister = async () => {
    // Validate required fields
    if (!userData.First_Name || !userData.Second_name || !userData.email || !userData.Password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const userDocRef = await addDoc(collection(db, "Users"), userData);
      console.log("User registered with ID: ", userDocRef.id);
      Alert.alert('Success', 'Registration successful!', [
        { text: 'OK', onPress: () => router.push('/login') }
      ]);
    } catch (error) {
      console.error("Error registering user: ", error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name *"
        placeholderTextColor={Colors.placeholder}
        value={userData.First_Name}
        onChangeText={(text) => setUserData({...userData, First_Name: text})}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name *"
        placeholderTextColor={Colors.placeholder}
        value={userData.Second_name}
        onChangeText={(text) => setUserData({...userData, Second_name: text})}
      />
      <TextInput
        style={styles.input}
        placeholder="Email *"
        placeholderTextColor={Colors.placeholder}
        value={userData.email}
        onChangeText={(text) => setUserData({...userData, email: text})}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password *"
        placeholderTextColor={Colors.placeholder}
        value={userData.Password}
        onChangeText={(text) => setUserData({...userData, Password: text})}
        secureTextEntry
      />
      <TouchableOpacity style={styles.buttonPrimary} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
    fontFamily: 'Poppins',
    marginBottom: 40,
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: Colors.inputBackground,
    fontFamily: 'Poppins',
    fontSize: 16,
    color: Colors.text,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
});

