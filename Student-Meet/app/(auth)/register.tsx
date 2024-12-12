import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { db } from '../../firebase_backup.js';
import { collection, addDoc, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import CryptoJS from 'crypto-js';

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

    // Add email validation for multiple domains
    const validDomains = ['@ehb.be', '@student.ehb.be'];
    const emailLower = userData.email.toLowerCase();
    const isValidDomain = validDomains.some(domain => emailLower.endsWith(domain));

    if (!isValidDomain) {
      Alert.alert('Error', 'Please use your EHB email address');
      return;
    }

    try {
      // Check if email already exists
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("email", "==", userData.email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert('Error', 'An account with this email already exists');
        return;
      }

      // Hash the password
      const hashedPassword = CryptoJS.SHA256(userData.Password).toString();

      // Generate unique User_ID
      const timestamp = Date.now();
      const randomNum = Math.floor(Math.random() * 1000);
      const uniqueUserId = `${timestamp}${randomNum}`;

      // Create document ID from name
      const customDocId = `${userData.First_Name.toLowerCase()}.${userData.Second_name.toLowerCase()}`
        .replace(/\s+/g, '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9.]/g, '');

      // Check if document with this name combination already exists
      const docRef = doc(db, "Users", customDocId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        Alert.alert('Error', 'A user with this name combination already exists');
        return;
      }

      // Create user document with hashed password
      const { User_ID, Password, ...userDataWithoutSensitive } = userData;
      await setDoc(docRef, {
        ...userDataWithoutSensitive,
        Password: hashedPassword, // Store hashed password instead of plain text
        email: userData.email.toLowerCase(),
        User_ID: uniqueUserId
      });

      console.log("User registered with Doc ID: ", customDocId);
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

