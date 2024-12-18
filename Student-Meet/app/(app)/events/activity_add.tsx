import React, { useState, useContext } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../../../firebase_backup';
import { collection, addDoc } from 'firebase/firestore';
import Colors from '../../../constants/Colors';
import UserFooter from '../../../components/footer';
import { AuthContext } from '../../_layout';
import Header from '../../../components/header';

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
  const { user } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventData, setEventData] = useState<EventData>({
    Category_id: '',
    Date: '',
    Description: '',
    Event_Title: '',
    Event_picture: '',
    Location: '',
    Max_Participants: '',
    Phone_Number: '',
    User_ID: user?.User_ID || '',
  });

  // Functie om een afbeelding te kiezen
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setEventData({ ...eventData, Event_picture: result.assets[0].uri });
    }
  };

  const handleCreateEvent = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const requiredFields = ['Event_Title', 'Date', 'Location', 'Max_Participants', 'Category_id'];
      const missingFields = requiredFields.filter(field => !eventData[field as keyof EventData]);

      if (missingFields.length > 0) {
        Alert.alert('Error', `Please fill in all required fields: ${missingFields.join(', ')}`);
        setIsSubmitting(false);
        return;
      }

      await addDoc(collection(db, "Event"), {
        ...eventData,
        Created_At: new Date().toISOString(),
      });

      Alert.alert('Success', 'Event created successfully!');
    } catch (error) {
      console.error("Error creating event: ", error);
      Alert.alert('Error', 'Failed to create event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
       <Header title="Add Event" />
      <ScrollView style={styles.scrollContainer}>
        <TextInput
          style={styles.titleInput}
          placeholder="Add title here"
          placeholderTextColor={Colors.placeholder}
          value={eventData.Event_Title}
          onChangeText={(text) => setEventData({ ...eventData, Event_Title: text })}
        />

       
     

        <TextInput
          style={styles.description}
          placeholder="Description..."
          placeholderTextColor={Colors.placeholder}
          value={eventData.Description}
          onChangeText={(text) => setEventData({ ...eventData, Description: text })}
          multiline
        />

        <View style={styles.detailsContainer}>
          <TextInput
            style={styles.detailsInput}
            placeholder="Location"
            placeholderTextColor={Colors.placeholder}
            value={eventData.Location}
            onChangeText={(text) => setEventData({ ...eventData, Location: text })}
          />
          <TextInput
            style={styles.detailsInput}
            placeholder="Date (YYYY-MM-DD)"
            placeholderTextColor={Colors.placeholder}
            value={eventData.Date}
            onChangeText={(text) => setEventData({ ...eventData, Date: text })}
          />
        </View>

        <Text style={styles.categoryTitle}>Categories:</Text>
        <View style={styles.categoryContainer}>
          <TouchableOpacity onPress={() => setEventData({ ...eventData, Category_id: 'sport' })} style={styles.categoryBox}>
            <Ionicons name="football-outline" size={50} color={eventData.Category_id === 'sport' ? Colors.primary : 'gray'} />
            <Text style={styles.categoryText}>Sport</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEventData({ ...eventData, Category_id: 'games' })} style={styles.categoryBox}>
            <Ionicons name="game-controller-outline" size={50} color={eventData.Category_id === 'games' ? Colors.primary : 'gray'} />
            <Text style={styles.categoryText}>Games</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEventData({ ...eventData, Category_id: 'creativity' })} style={styles.categoryBox}>
            <Ionicons name="color-palette-outline" size={50} color={eventData.Category_id === 'creativity' ? Colors.primary : 'gray'} />
            <Text style={styles.categoryText}>Creativity</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.detailsInput}
          placeholder="Max Participants"
          placeholderTextColor={Colors.placeholder}
          value={eventData.Max_Participants}
          onChangeText={(text) => setEventData({ ...eventData, Max_Participants: text })}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleCreateEvent}>
          <Text style={styles.buttonText}>{isSubmitting ? 'Creating...' : 'Create Event'}</Text>
        </TouchableOpacity>
      </ScrollView>
      <UserFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#white' },
  scrollContainer: { padding: 20 , marginTop: 150},
  titleInput: { fontSize: 20, borderBottomWidth: 1, borderColor: Colors.inputBorder, marginBottom: 25, height: 45 },
 
  description: { height: 100, textAlignVertical: 'top', borderWidth: 1, borderColor: Colors.inputBorder, marginBottom: 10, padding: 10 },
  detailsContainer: { marginBottom: 10 },
  detailsInput: { borderWidth: 1, borderColor: Colors.inputBorder, padding: 10, marginBottom: 10, borderRadius: 5 },
  categoryTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  categoryBox: { alignItems: 'center', flex: 1 },
  categoryText: { marginTop: 5, color: Colors.text },
  button: { backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
