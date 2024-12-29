import React, { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { db } from '../../../firebase_backup';
import { collection, addDoc, updateDoc, doc, getDoc } from 'firebase/firestore';
import Colors from '../../../constants/Colors';
import { AuthContext } from '../../_layout';
import UserFooter from '../../../components/footer';
import { Picker } from '@react-native-picker/picker';
import { EventCategory } from '../../types/event';
import DateTimePicker from '@react-native-community/datetimepicker';

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
  participants?: string[];
}

export default function ActivityAddScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);
  const { eventId, isEditing } = useLocalSearchParams();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  
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

  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;
      
      try {
        const eventDoc = await getDoc(doc(db, 'Event', eventId as string));
        if (eventDoc.exists()) {
          const eventData = eventDoc.data() as EventData;
          setEvent(eventData);
          setEventData(eventData); // Pre-fill form with existing data
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        Alert.alert('Error', 'Failed to load event data');
      }
    };

    fetchEvent();
  }, [eventId]);

  const resetForm = () => {
    setEventData(initialEventData);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      // Format date for database
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setEventData({ ...eventData, Date: formattedDate });
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Validate required fields first
      const requiredFields = ['Event_Title', 'Date', 'Location', 'Max_Participants'];
      const missingFields = requiredFields.filter(field => !eventData[field as keyof EventData]);
      
      if (missingFields.length > 0) {
        Alert.alert('Error', `Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      if (isEditing === '1' && eventId) {
        // Update existing event
        const eventRef = doc(db, 'Event', eventId as string);
        await updateDoc(eventRef, eventData as any);

        // Send notifications to all participants
        if (event?.participants?.length) {
          const notificationPromises = event.participants.map(participantId => {
            if (participantId === user?.User_ID) return null; // Skip owner
            
            const notificationData = {
              type: 'event_edited',
              userId: participantId,
              userName: user?.First_Name || 'Event Creator',
              eventId: eventId as string,
              eventTitle: eventData.Event_Title,
              createdAt: new Date().toISOString(),
              read: false
            };
            return addDoc(collection(db, 'Notifications'), notificationData);
          });

          await Promise.all(notificationPromises.filter(Boolean));
        }

        Alert.alert('Success', 'Event updated successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        // Create new event
        const eventRef = await addDoc(collection(db, "Event"), {
          ...eventData,
          User_ID: user?.User_ID,
          Created_At: new Date().toISOString(),
        });

        Alert.alert('Success', 'Event created successfully!', [
          { 
            text: 'OK', 
            onPress: () => {
              resetForm();
              router.replace('/(app)/home');
            }
          }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = eventId ? 'Edit Event' : 'Create New Event';

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Event Title *"
          placeholderTextColor={Colors.placeholder}
          value={eventData.Event_Title}
          onChangeText={(text) => setEventData({...eventData, Event_Title: text})}
        />

        <TouchableOpacity 
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.inputText, !eventData.Date && styles.placeholder]}>
            {eventData.Date || 'Select Date *'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Location *"
          placeholderTextColor={Colors.placeholder}
          value={eventData.Location}
          onChangeText={(text) => setEventData({...eventData, Location: text})}
        />

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
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>
            {isSubmitting 
              ? (isEditing === '1' ? 'Updating...' : 'Creating...') 
              : (isEditing === '1' ? 'Update Event' : 'Create Event')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <UserFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.text,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: Colors.inputBorder,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: Colors.inputBackground,
    fontSize: 16,
    color: Colors.text,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: Colors.inputBackground,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  inputText: {
    fontSize: 16,
    color: Colors.text,
  },
  placeholder: {
    color: Colors.placeholder,
  },
}); 