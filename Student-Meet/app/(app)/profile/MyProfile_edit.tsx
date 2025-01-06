import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { AuthContext } from '../../_layout';
import UserFooter from '../../../components/footer';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import Colors from '../../../constants/Colors';

interface EditableFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
}

const EditableField = ({ label, value, onChangeText, editable = true }: EditableFieldProps) => (
  <View style={{ marginBottom: 20 }}>
    <Text style={{ fontSize: 16, color: Colors.text, marginBottom: 8 }}>{label}</Text>
    <TextInput
      style={{
        borderWidth: 1,
        borderColor: Colors.inputBorder,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: Colors.text,
        backgroundColor: editable ? Colors.inputBackground : '#f5f5f5',
      }}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
    />
  </View>
);

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
  const [userID, setUserID] = useState<string>(''); // State to store userID

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.email) {
        const userRef = doc(db, 'Users', user?.User_ID); 
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
          const userData = userSnap.data();
          console.log('Fetched user document:', userData);
          if (userData?.User_ID) {
            setUserID(userData.User_ID); // Assign the User_ID from Firestore to the state
            setUserData(userData);
          } else {
            console.error('User_ID is missing in the document.');
          }
        } else {
          console.error('User document not found with User_ID.');
        }
      } else {
        console.error('User email is undefined.');
      }
    };
    fetchUserData();
  }, [user]);

  // Handle save button press and update Firestore document using User_ID
  const handleSave = async () => {
    console.log('handleSave called');
    if (!userID) {
      console.error('User ID is undefined.');
      return;
    }
    const userRef = doc(db, 'Users', userID);
    try {
      await updateDoc(userRef, {
        ...userData,
      });
      console.log('User data updated successfully');
      Alert.alert('Success', 'Profile updated successfully.');
      router.back();
    } catch (error) {
      console.error('Error updating Firestore document:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

 
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Header Section */}
        <LinearGradient colors={['#44c9ea', 'white']} style={styles.header}>
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
              source={{
                uri: `https://ui-avatars.com/api/?name=${userData.First_Name}+${userData.Second_name}&background=random`,
              }}
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
              label="Second Name"
              value={userData.Second_name}
              onChangeText={(text: string) => setUserData({ ...userData, Second_name: text })}
            />
            <EditableField
              label="Email"
              value={userData.email}
              editable={false}
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
    </View>
  );
} 

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: Colors.background,
    },
    scrollViewContent: {
      flexGrow: 1,
    },
    header: {
      padding: 20,
      paddingTop: 60,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white',
    },
    goBackButton: {
      padding: 8,
    },
    saveButton: {
      padding: 8,
    },
    body: {
      flex: 1,
      padding: 20,
    },
    profileImageContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    profileImage: {
      width: 100,
      height: 100,
      borderRadius: 50,
    },
    profileName: {
      marginTop: 10,
      fontSize: 16,
      color: Colors.primary,
    },
    infoSection: {
      backgroundColor: 'white',
      borderRadius: 15,
      padding: 20,
      marginBottom: 20,
    },
  });
