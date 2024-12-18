import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Colors from '../../constants/Colors';
import { useRouter } from 'expo-router';
import { db } from '../../firebase_backup.js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { AuthContext } from '../_layout';
import { UserData } from '../../app/types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate email domain
    const validDomains = ['@ehb.be', '@student.ehb.be'];
    const emailLower = email.toLowerCase();
    const isValidDomain = validDomains.some(domain => emailLower.endsWith(domain));

    if (!isValidDomain) {
      Alert.alert('Error', 'Please use your EHB email address');
      return;
    }

    try {
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("email", "==", emailLower));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Error', 'No user found with this email');
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Hash the entered password and compare with stored hash
      const hashedPassword = CryptoJS.SHA256(password).toString();

      if (userData.Password === hashedPassword) {
        // Store user data in AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        signIn(userData as UserData);
        console.log('Login successful for user:', userDoc.id);
        router.push('/home');
      } else {
        Alert.alert('Error', 'Incorrect password');
      }
    } catch (error) {
      console.error("Error during login: ", error);
      Alert.alert('Error', 'Login failed. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={Colors.placeholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonSecondary} onPress={() => router.push('/register')}>
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
    backgroundColor: Colors.secondary,
    paddingVertical: 15,
    borderRadius: 8,
    width: '90%',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonSecondary: {
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
