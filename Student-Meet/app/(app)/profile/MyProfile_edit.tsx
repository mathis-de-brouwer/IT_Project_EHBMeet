import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { AuthContext } from '../../_layout';
import UserFooter from '../../../components/footer';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase_backup';

export default function MyProfileEditScreen() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [userData, setUserData] = useState<any>({
    First_Name: '',
    Second_name: '',
    Email: '',
    Department: '',
    Date_Of_Birth: '',
    Gender: '',
    Region: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.email) {
        const userRef = doc(db, 'Users', user.email);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleSave = async () => {
    if (user?.email) {
      const userRef = doc(db, 'Users', user.email);
      try {
        await updateDoc(userRef, {
          ...userData,
        });
        Alert.alert('Success', 'Profile updated successfully.');
        router.back();
      } catch (error) {
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Header Section */}
        <LinearGradient 
          colors={['#44c9ea', 'white']} 
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.goBackButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Profile</Text>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark-outline" size={28} color="white" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Body Section */}
        <View style={styles.body}>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                user?.Profile_Picture
                  ? { uri: user.Profile_Picture }
                  : require('../../../assets/images/default-avatar.png')
              }
              style={styles.profileImage}
            />
            <Text style={styles.profileName}>Edit Profile Picture</Text>
          </View>

          {/* Editable Fields */}
          <View style={styles.infoSection}>
            <EditableField
              label="First Name"
              value={userData.First_Name}
              onChangeText={(text: string) => setUserData({ ...userData, First_Name: text })}
            />
            <EditableField
              label="Last Name"
              value={userData.Second_name}
              onChangeText={(text: string) => setUserData({ ...userData, Second_name: text })}
            />
            <EditableField
              label="Department"
              value={userData.Department}
              onChangeText={(text: string) => setUserData({ ...userData, Department: text })}
            />
            <EditableField
              label="Date of Birth"
              value={userData.Date_Of_Birth}
              onChangeText={(text: string) => setUserData({ ...userData, Date_Of_Birth: text })}
            />
            <EditableField
              label="Email"
              value={user?.email}
              editable={false}
            />
            <EditableField
              label="Gender"
              value={userData.Gender}
              onChangeText={(text: string) => setUserData({ ...userData, Gender: text })}
            />
            <EditableField
              label="Region"
              value={userData.Region}
              onChangeText={(text: string) => setUserData({ ...userData, Region: text })}
            />
          </View>
        </View>
      </ScrollView>
      <UserFooter />
    </View>
  );
}

// Editable Field Component
const EditableField = ({ label, value, onChangeText, editable = true }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <TextInput
      style={styles.textInput}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  header: {
    height: 160,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 28,
    color: 'white',
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    textAlign: 'center',
    transform: [{ translateY: -10 }],
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: -50,
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 18,
    color: '#00bfa5',
    marginTop: 10,
  },
  infoSection: {
    marginHorizontal: 20,
    paddingVertical: 20,
  },
  infoRow: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 18,
    color: '#333',
    marginBottom: 5,
  },
  textInput: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 5,
    color: '#333',
  },
  saveButton: {
    position: 'absolute',
    top: 60,
    right: 30,
  },
  goBackButton: {
    position: 'absolute',
    top: 60,
    left: 30,
  },
});
