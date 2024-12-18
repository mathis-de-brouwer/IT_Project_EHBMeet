import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase_backup.js'; // Ensure you have correct Firebase imports
import { AuthContext } from '../_layout';
import { UserData } from '../../app/types/user';
<<<<<<< Updated upstream
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../firebase_backup';
=======
import Colors from '../../constants/Colors';
>>>>>>> Stashed changes

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
<<<<<<< Updated upstream
      // Sign out any existing session first
      await signOut(auth);
      
      // Then sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("email", "==", emailLower));
      const querySnapshot = await getDocs(q);
=======
      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      const user = userCredential.user;
>>>>>>> Stashed changes

      // Fetch user data from Firestore
      const userDocRef = doc(db, 'Users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        Alert.alert('Error', 'No user found with this email');
        return;
      }

      const userData = userDoc.data();

      // Validate structure before casting
      if (
        typeof userData.First_Name === 'string' &&
        typeof userData.Second_name === 'string' &&
        typeof userData.email === 'string' &&
        typeof userData.User_ID === 'string' &&
        typeof userData.Password === 'string'
      ) {
        // Cast to UserData type
        const typedUserData = userData as UserData;

<<<<<<< Updated upstream
      if (userData.Password === hashedPassword) {
        // Store user data in AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        signIn(userData as UserData);
        console.log('Login successful for user:', userDoc.id);
        router.replace('/home');
=======
        // Check for blacklist status
        if (typedUserData.Blacklisted) {
          Alert.alert('Access Denied', 'Your account has been blacklisted. Please contact support.');
          return;
        }

        // Sign in and navigate
        signIn(typedUserData);
        Alert.alert('Success', 'Logged in successfully!');
        router.replace('/(app)/home');
>>>>>>> Stashed changes
      } else {
        throw new Error('Invalid user data format');
      }
<<<<<<< Updated upstream
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert('Error', 'Failed to login. Please try again.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Navigate to login screen
      router.replace('/login');
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
=======
    } catch (error: any) {
      console.error('Login Error:', error);
      Alert.alert('Login Error', error.message || 'An error occurred during login. Please try again.');
>>>>>>> Stashed changes
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Login to your account</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor={Colors.placeholder}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor={Colors.placeholder}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Login Button */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Login</Text>
      </TouchableOpacity>

      {/* Navigation to Register */}
      <TouchableOpacity style={styles.registerButton} onPress={() => router.push('/register')}>
        <Text style={styles.registerButtonText}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: Colors.text,
    marginBottom: 8,
    fontFamily: 'Poppins',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    padding: 14,
    backgroundColor: Colors.inputBackground,
    fontSize: 16,
    marginBottom: 16,
    width: '90%',
    fontFamily: 'Poppins',
    color: Colors.text,
  },
  loginButton: {
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    width: '90%',
    marginBottom: 16,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
  registerButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Poppins',
  },
});

export default LoginScreen;
