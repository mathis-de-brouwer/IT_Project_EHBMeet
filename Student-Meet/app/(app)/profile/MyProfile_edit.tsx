import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { AuthContext } from '../../_layout';
import UserFooter from '../../../components/footer';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Colors from '../../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserData } from '@/app/types/user';

export default function MyProfileEditScreen() {
  const { user, signIn } = useContext(AuthContext);
  const router = useRouter();
  const [userData, setUserData] = useState<any>({
    First_Name: '',
    Second_name: '',
    Email: '',
    Department: '',
    Date_Of_Birth: '',
    Gender: '',
    Region: '',
    Description: '',
    Steam_name: '',
    Discord_name: '',
  });
  const [userID, setUserID] = useState<string>(''); // State to store userID

  // Fetch the user's data and store userID
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.email) {
        const userRef = doc(db, 'Users', user?.User_ID); // Fetch using User_ID as the document ID
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
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
    if (!userID) {
      console.error('User ID is undefined.');
      return;
    }

    try {
      const userRef = doc(db, 'Users', userID);
      
      // Create an update object only with defined values
      const updateData = {
        First_Name: userData.First_Name || user?.First_Name,
        Second_name: userData.Second_name || user?.Second_name,
        Description: userData.Description || null,  // Use null instead of undefined
        Department: userData.Department || null,
        Date_Of_Birth: userData.Date_Of_Birth || null,
        Gender: userData.Gender || null,
        Region: userData.Region || null,
        Discord_name: userData.Discord_name || null,  // Use null instead of undefined
        Steam_name: userData.Steam_name || null
      };

      // Remove any null values from the update object
      Object.keys(updateData).forEach(key => 
        updateData[key] === null && delete updateData[key]
      );

      await updateDoc(userRef, updateData);
      
      // Update AsyncStorage with new data
      const updatedUserData = { ...userData, ...updateData };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      // Update AuthContext
      signIn(updatedUserData as UserData);
      
      console.log('Updated fields:', updateData);
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
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
            <EditableField label="Email" value={user?.email} editable={false} />
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
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>About Me</Text>
              <EditableField
                label="Description"
                value={userData.Description}
                onChangeText={(text: string) => setUserData({ ...userData, Description: text })}
                multiline={true}
                numberOfLines={4}
                placeholder="Tell something about yourself..."
              />
              
              <Text style={styles.sectionTitle}>Gaming Profiles</Text>
              <EditableField
                label="Steam Username"
                value={userData.Steam_name}
                onChangeText={(text: string) => setUserData({ ...userData, Steam_name: text })}
                placeholder="Your Steam username"
              />
              <EditableField
                label="Discord Username"
                value={userData.Discord_name}
                onChangeText={(text: string) => setUserData({ ...userData, Discord_name: text })}
                placeholder="Your Discord username"
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <UserFooter />
    </View>
  );
}

// Editable Field Component
const EditableField = ({ 
  label, 
  value, 
  onChangeText, 
  editable = true, 
  multiline = false,
  numberOfLines = 1,
  placeholder = ""
}: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <TextInput
      style={[
        styles.textInput,
        multiline && styles.multilineInput
      ]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      multiline={multiline}
      numberOfLines={numberOfLines}
      placeholder={placeholder}
      placeholderTextColor={Colors.placeholder}
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  descriptionSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
    backgroundColor: Colors.inputBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    padding: 10,
  },
});
