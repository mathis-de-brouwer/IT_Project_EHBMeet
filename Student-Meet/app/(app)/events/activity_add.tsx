import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { db } from '../../../firebase_backup';
import { collection, addDoc } from 'firebase/firestore';
import Colors from '../../../constants/Colors';
import { AuthContext } from '../../_layout';
import UserFooter from '../../../components/footer';
import { Picker } from '@react-native-picker/picker';
import { EventCategory } from '../../types/event';

interface EventData {
  Category_id: string;
  Date: string;
  Description: string;
  Event_Title: string;
  Event_picture?: string;
  Location: string;
  Max_Participants: string;
  Phone_Number?: string;
  User_ID: string;
}

export default function ActivityAddScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const initialEventData = {
    Category_id: '',
    Date: '',
    Description: '',
    Event_Title: '',
    Event_picture: '',
    Location: '',
    Max_Participants: '',
    Phone_Number: '',
    User_ID: user?.User_ID || '',
  };
  
  const [eventData, setEventData] = useState<EventData>(initialEventData);

  const resetForm = () => {
    setEventData(initialEventData);
  };

  const handleCreateEvent = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Validate required fields
      const requiredFields = ['Event_Title', 'Date', 'Location', 'Max_Participants'];
      const missingFields = requiredFields.filter(field => !eventData[field as keyof EventData]);
      
      if (missingFields.length > 0) {
        Alert.alert('Error', `Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      // Add the event to Firestore
      const eventRef = await addDoc(collection(db, "Event"), {
        ...eventData,
        User_ID: user?.User_ID,
        Created_At: new Date().toISOString(),
      });

      console.log("Event created with ID: ", eventRef.id);
      Alert.alert('Success', 'Event created successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            resetForm();  // Reset the form
            router.replace('/(app)/home');  // Navigate home
          }
        }
      ]);
    } catch (error) {
      console.error("Error creating event: ", error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
       <Header title="Agenda" />
      <ScrollView style={styles.scrollContainer}>
        <TextInput
          style={styles.input}
          placeholder="Event Title *"
          placeholderTextColor={Colors.placeholder}
          value={eventData.Event_Title}
          onChangeText={(text) => setEventData({...eventData, Event_Title: text})}
        />

        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD) *"
          placeholderTextColor={Colors.placeholder}
          value={eventData.Date}
          onChangeText={(text) => setEventData({...eventData, Date: text})}
        />

        {/* Photo Section */}
        <View style={styles.photoContainer}>
          <TouchableOpacity style={styles.photoBox} onPress={pickImage}>
            {eventData.Event_picture ? (
              <Image source={{ uri: eventData.Event_picture }} style={styles.image} />
            ) : (
              <Text style={styles.photoText}>Add photo here</Text>
            )}
          </TouchableOpacity>
        </View>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          placeholderTextColor={Colors.placeholder}
          value={eventData.Description}
          onChangeText={(text) => setEventData({...eventData, Description: text})}
          multiline
          numberOfLines={4}
        />

        <TextInput
          style={styles.input}
          placeholder="Maximum Participants *"
          placeholderTextColor={Colors.placeholder}
          value={eventData.Max_Participants}
          onChangeText={(text) => setEventData({...eventData, Max_Participants: text})}
          keyboardType="numeric"
        />

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={eventData.Category_id as EventCategory}
            onValueChange={(value: EventCategory) => 
              setEventData({...eventData, Category_id: value})
            }
            style={styles.picker}
          >
            <Picker.Item label="Select Category *" value="" />
            <Picker.Item label="Games" value="games" />
            <Picker.Item label="Sport" value="sport" />
            <Picker.Item label="EHB Events" value="ehb-events" />
            <Picker.Item label="Creativity" value="creativity" />
          </Picker>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor={Colors.placeholder}
          value={eventData.Phone_Number}
          onChangeText={(text) => setEventData({...eventData, Phone_Number: text})}
          keyboardType="phone-pad"
        />

        <TouchableOpacity 
          style={[styles.button, isSubmitting && styles.buttonDisabled]} 
          onPress={handleCreateEvent}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <UserFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#white',  },
  scrollContainer: { padding: 20 , marginTop: 150},
  titleInput: { fontSize: 20, borderBottomWidth: 1, borderColor: Colors.inputBorder, marginBottom: 10 },
  photoContainer: { alignItems: 'center', marginVertical: 10 },
  photoBox: { width: 150, height: 150, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center' },
  photoText: { color: Colors.placeholder },
  image: { width: '100%', height: '100%', borderRadius: 8 },
  description: { height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: Colors.inputBorder, marginBottom: 10, padding: 10 },
  detailsContainer: { marginBottom: 10 },
  detailsInput: { borderWidth: 1, borderColor: Colors.inputBorder, padding: 10, marginBottom: 10, borderRadius: 5 },
  categoryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryBox: { alignItems: 'center', flex: 1 },
  categoryText: { marginTop: 5, color: Colors.text },
  button: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
