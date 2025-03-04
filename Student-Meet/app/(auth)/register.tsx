import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Colors from '../../constants/Colors'; // Your color definitions
import { useRouter } from 'expo-router';
import { db, auth } from '@/firebase'; // Import the Firebase instance
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import CryptoJS from 'crypto-js';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { UserRole } from '../../app/types/user';

export default function RegisterScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState({
    First_Name: '',
    Second_name: '',
    email: '',
    Password: '',
    role: 'student' as UserRole,
    Blacklisted: false,
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false
  });
  const [isRegistering, setIsRegistering] = useState(false);

  const checkPasswordStrength = (password: any) => {
    setPasswordStrength({
      length: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[@$!%*?&]/.test(password)
    });
  };

  const handleRegister = async () => {
    if (isRegistering) return; // Prevent multiple submissions
    setIsRegistering(true);

    try {

      

      // Validate required fields
      if (!userData.First_Name || !userData.Second_name || !userData.email || !userData.Password || !confirmPassword) {
        Alert.alert('Error', 'Please fill in all required fields');
        setIsRegistering(false);
        return;
      }

      // Password validation
      if (userData.Password.length < 8) {
        Alert.alert('Error', 'Password must be at least 8 characters long');
        setIsRegistering(false);
        return;
      }

      if (userData.Password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        setIsRegistering(false);
        return;
      }

      // Password strength validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(userData.Password)) {
        Alert.alert('Error', 
          'Password must contain at least:\n' +
          '- 8 characters\n' +
          '- One uppercase letter\n' +
          '- One lowercase letter\n' +
          '- One number\n' +
          '- One special character'
        );
        setIsRegistering(false);
        return;
      }

      // Add email validation for specific domains
      const validDomains = ['@ehb.be', '@student.ehb.be'];
      const emailLower = userData.email.toLowerCase();
      const isValidDomain = validDomains.some(domain => emailLower.endsWith(domain));

      if (!isValidDomain) {
        Alert.alert('Error', 'Please use your EHB email address');
        setIsRegistering(false);
        return;
      }

      // Check if email already exists
      const usersRef = collection(db, "Users");
      const q = query(usersRef, where("email", "==", userData.email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert('Error', 'An account with this email already exists');
        setIsRegistering(false);
        return;
      }

      // Create Firebase Auth user first
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(
          auth, 
          userData.email.toLowerCase(), 
          userData.Password
        );
      } catch (error: any) {
        console.error("Detailed error:", error.code, error.message);
        let errorMessage = 'Registration failed. Please try again.';
        
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already registered.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'Email/password accounts are not enabled. Please contact support.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Please choose a stronger password.';
            break;
        }
        
        Alert.alert('Error', errorMessage);
        setIsRegistering(false);
        return;
      }

      // Now userCredential is accessible here
      const uniqueUserId = userCredential.user.uid;

      // Create user document in Firestore
      const { Password, ...userDataWithoutPassword } = userData;
      const hashedPassword = CryptoJS.SHA256(Password).toString();
      
      await setDoc(doc(db, "Users", uniqueUserId), {
        ...userDataWithoutPassword,
        email: userData.email.toLowerCase(),
        Password: hashedPassword,
        User_ID: uniqueUserId,
        role: 'student',
      });

      Alert.alert('Success', 'Registration successful!', [
        { text: 'OK', onPress: () => router.push('/(auth)/login') }
      ]);
    } catch (error) {
      console.error("Error registering user: ", error);
      Alert.alert('Error', 'Registration failed. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.returnButton} onPress={() => router.back()}>
        <Text style={styles.returnButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name *"
        placeholderTextColor={Colors.placeholder}
        value={userData.First_Name}
        onChangeText={(text) => setUserData({ ...userData, First_Name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name *"
        placeholderTextColor={Colors.placeholder}
        value={userData.Second_name}
        onChangeText={(text) => setUserData({ ...userData, Second_name: text })}
      />
      <TextInput
        style={styles.input}
        placeholder="Email *"
        placeholderTextColor={Colors.placeholder}
        value={userData.email}
        onChangeText={(text) => setUserData({ ...userData, email: text })}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password *"
        placeholderTextColor={Colors.placeholder}
        value={userData.Password}
        onChangeText={(text) => {
          setUserData({ ...userData, Password: text });
          checkPasswordStrength(text);
        }}
        secureTextEntry
      />
      <View style={styles.passwordChecklist}>
        <Text style={[styles.requirementText, { color: passwordStrength.length ? Colors.success : Colors.error }]}>
          • Minimum 8 characters {passwordStrength.length ? '✓' : ''}
        </Text>
        <Text style={[styles.requirementText, { color: passwordStrength.hasUpper ? Colors.success : Colors.error }]}>
          • At least one uppercase letter {passwordStrength.hasUpper ? '✓' : ''}
        </Text>
        <Text style={[styles.requirementText, { color: passwordStrength.hasLower ? Colors.success : Colors.error }]}>
          • At least one lowercase letter {passwordStrength.hasLower ? '✓' : ''}
        </Text>
        <Text style={[styles.requirementText, { color: passwordStrength.hasNumber ? Colors.success : Colors.error }]}>
          • At least one number {passwordStrength.hasNumber ? '✓' : ''}
        </Text>
        <Text style={[styles.requirementText, { color: passwordStrength.hasSpecial ? Colors.success : Colors.error }]}>
          • At least one special character (@$!%*?&) {passwordStrength.hasSpecial ? '✓' : ''}
        </Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Confirm Password *"
        placeholderTextColor={Colors.placeholder}
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.buttonPrimary, isRegistering && styles.buttonDisabled]}
        onPress={handleRegister}
        disabled={isRegistering}
      >
        <Text style={styles.buttonText}>
          {isRegistering ? 'Registering...' : 'Register'}
        </Text>
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
  returnButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondary,
  },
  returnButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordChecklist: {
    width: '90%',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  requirementText: {
    fontSize: 12,
    fontFamily: 'Poppins',
    marginBottom: 2,
  },
  buttonDisabled: {
    backgroundColor: Colors.placeholder,
    opacity: 0.7,
  },
});
