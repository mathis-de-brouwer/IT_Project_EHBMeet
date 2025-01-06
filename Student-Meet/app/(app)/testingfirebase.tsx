import EditScreenInfo from '@/components/EditScreenInfo';
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, ScrollView } from 'react-native';
import { db } from '../../firebase_backup.js';
import { collection, addDoc } from 'firebase/firestore';

interface UserData {
  User_ID: string;
  Blacklisted: boolean;
  Description?: string;
  First_Name: string;
  Second_name: string;
  Discord_name?: string;
  Password: string;
  Profile_Picture?: string;
  Steam_name?: string;
  email: string;
}

interface EventData {
  Categoty_id: string;
  Date: string;
  Description?: string;
  Event_Title: string;
  Event_picture?: string;
  Location: string;
  Max_Participants: string;
  Phone_Number?: string;
  User_ID: string;
}

const TestingFirebase: React.FC = () => {
  const [formType, setFormType] = useState<'none' | 'user' | 'event'>('none');
  const [userData, setUserData] = useState<UserData>({
    User_ID: '',
    Blacklisted: false,
    Description: '',
    First_Name: '',
    Second_name: '',
    Discord_name: '',
    Password: '',
    Profile_Picture: '',
    Steam_name: '',
    email: ''
  });

  const [eventData, setEventData] = useState<EventData>({
    Categoty_id: '',
    Date: '',
    Description: '',
    Event_Title: '',
    Event_picture: '',
    Location: '',
    Max_Participants: '',
    Phone_Number: '',
    User_ID: ''
  });

  const handleInputChange = (key: keyof UserData | keyof EventData, value: string, isUser: boolean = true) => {
    if (isUser) {
      setUserData({
        ...userData,
        [key as keyof UserData]: value
      });
    } else {
      setEventData({
        ...eventData,
        [key as keyof EventData]: value
      });
    }
  };

  const validateData = () => {
    if (formType === 'user') {
      const requiredUserFields: (keyof UserData)[] = ['First_Name', 'Second_name', 'Password', 'email'];
      const missingUserFields = requiredUserFields.filter(field => !userData[field]);
      
      if (missingUserFields.length > 0) {
        alert(`Please fill in all required fields:\n${missingUserFields.join(', ')}`);
        return false;
      }
    } else if (formType === 'event') {
      const requiredEventFields: (keyof EventData)[] = ['Date', 'Event_Title', 'Location', 'Max_Participants'];
      const missingEventFields = requiredEventFields.filter(field => !eventData[field]);
      
      if (missingEventFields.length > 0) {
        alert(`Please fill in all required fields:\n${missingEventFields.join(', ')}`);
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateData()) return;
    
    try {
      if (formType === 'user') {
        const userDocRef = await addDoc(collection(db, "Users"), userData);
        console.log("User document written with ID: ", userDocRef.id);
      } else if (formType === 'event') {
        const eventDocRef = await addDoc(collection(db, "Event"), eventData);
        console.log("Event document written with ID: ", eventDocRef.id);
      }
      setFormType('none'); // Return to selection screen after successful submission
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const renderForm = () => {
    switch (formType) {
      case 'user':
        return (
          <>
            <Text style={styles.header}>User Data</Text>
            {Object.keys(userData).map((key) => (
              <View key={key}>
                <TextInput
                  style={[styles.input, isRequiredField(key) && styles.requiredInput]}
                  placeholder={`${key}${isRequiredField(key) ? ' *' : ''}`}
                  value={userData[key as keyof UserData]?.toString() ?? ''}
                  onChangeText={(value) => handleInputChange(key as keyof UserData, value)}
                />
              </View>
            ))}
            <Button title="Submit User" onPress={handleSubmit} />
            <View style={styles.backButton}>
              <Button title="Back" onPress={() => setFormType('none')} color="#666" />
            </View>
          </>
        );
      case 'event':
        return (
          <>
            <Text style={styles.header}>Event Data</Text>
            {Object.keys(eventData).map((key) => (
              <TextInput
                key={key}
                style={styles.input}
                placeholder={key}
                value={eventData[key as keyof EventData]}
                onChangeText={(value) => handleInputChange(key as keyof EventData, value, false)}
              />
            ))}
            <Button title="Submit Event" onPress={handleSubmit} />
            <View style={styles.backButton}>
              <Button title="Back" onPress={() => setFormType('none')} color="#666" />
            </View>
          </>
        );
      default:
        return (
          <View style={styles.buttonContainer}>
            <View style={styles.selectionButton}>
              <Button title="Make User" onPress={() => setFormType('user')} />
            </View>
            <View style={styles.selectionButton}>
              <Button title="Make Event" onPress={() => setFormType('event')} />
            </View>
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {renderForm()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#333',
  },
  input: {
    height: 48,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  requiredInput: {
    borderColor: '#ff6b6b',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    marginTop: 20,
  },
  selectionButton: {
    marginVertical: 10,
  },
  backButton: {
    marginTop: 20,
  },
});

const isRequiredField = (field: string): boolean => {
  const requiredUserFields = ['First_Name', 'Second_name', 'Password', 'email'];
  const requiredEventFields = ['Date', 'Event_Title', 'Location', 'Max_Participants'];
  return [...requiredUserFields, ...requiredEventFields].includes(field);
};

export default TestingFirebase; 