import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import UserFooter from '../../components/footer';
import Colors from '../../constants/Colors';
import { db } from '../../firebase_backup.js';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { AuthContext } from '../../app/_layout';

interface EventData {
  Event_Title: string;
  Description: string;
  Date: string;
  Location: string;
  Max_Participants: string;
  Event_picture?: string;
  Start_Time?: string;
  End_Time?: string;
  Category?: string;
  Organizer?: string;
  participants?: string[];
  id?: string;
}

const Home = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchEvents();
    testEventData();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, "Event");
      const querySnapshot = await getDocs(eventsRef);
      const eventsData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        participants: doc.data().participants || []
      } as EventData));
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events: ", error);
    }
  };

  const testEventData = async () => {
    try {
      const eventsRef = collection(db, "Event");
      const querySnapshot = await getDocs(eventsRef);
      
      querySnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n--- Event ${index + 1} Data Check ---`);
        console.log('Document ID:', doc.id);
        console.log('Title:', data.Event_Title || 'MISSING');
        console.log('Description:', data.Description || 'MISSING');
        console.log('Date:', data.Date || 'MISSING');
        console.log('Location:', data.Location || 'MISSING');
        console.log('Max Participants:', data.Max_Participants || 'MISSING');
        console.log('Event Picture:', data.Event_picture || 'MISSING');
        console.log('Start Time:', data.Start_Time || 'MISSING');
        console.log('End Time:', data.End_Time || 'MISSING');
        console.log('Category:', data.Category || 'MISSING');
        console.log('Organizer:', data.Organizer || 'MISSING');
      });
    } catch (error) {
      console.error("Error testing event data: ", error);
    }
  };

  const handleEventParticipation = async (event: EventData) => {
    if (!user?.email || !event.id) return;

    const isParticipant = event.participants?.includes(user.email);

    if (isParticipant) {
      // Handle leaving the event
      try {
        const eventRef = doc(db, "Event", event.id);
        const newParticipants = event.participants?.filter(email => email !== user.email) || [];
        
        await updateDoc(eventRef, {
          participants: newParticipants
        });

        setEvents(prevEvents => prevEvents.map(e => 
          e.id === event.id 
            ? { ...e, participants: newParticipants }
            : e
        ));

        Alert.alert('Success', 'You have left the event');
      } catch (error) {
        console.error("Error leaving event: ", error);
        Alert.alert('Error', 'Failed to leave event. Please try again.');
      }
    } else {
      // Handle joining the event
      if ((event.participants?.length || 0) >= parseInt(event.Max_Participants)) {
        Alert.alert('Event Full', 'This event has reached its maximum participants');
        return;
      }

      try {
        const eventRef = doc(db, "Event", event.id);
        const newParticipants = [...(event.participants || []), user.email];
        
        await updateDoc(eventRef, {
          participants: newParticipants
        });

        setEvents(prevEvents => prevEvents.map(e => 
          e.id === event.id 
            ? { ...e, participants: newParticipants }
            : e
        ));

        Alert.alert('Success', 'You have successfully joined the event!');
      } catch (error) {
        console.error("Error joining event: ", error);
        Alert.alert('Error', 'Failed to join event. Please try again.');
      }
    }
  };

  const EventCard = ({ event }: { event: EventData }) => (
    <View style={styles.card}>
      {event.Event_picture ? (
        <Image 
          source={{ uri: event.Event_picture }} 
          style={styles.eventImage}
          defaultSource={require('../../assets/images/placeholder.png')}
        />
      ) : (
        <View style={styles.placeholderImage}>
          <FontAwesome name="image" size={40} color="#ccc" />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.eventTitle}>{event.Event_Title}</Text>
        <Text style={styles.eventDate}>📅 {event.Date}</Text>
        {event.Start_Time && event.End_Time && (
          <Text style={styles.eventTime}>⏰ {event.Start_Time} - {event.End_Time}</Text>
        )}
        <Text style={styles.eventLocation}>📍 {event.Location}</Text>
        {event.Category && (
          <Text style={styles.eventCategory}>🏷️ {event.Category}</Text>
        )}
        {event.Organizer && (
          <Text style={styles.eventOrganizer}>👤 Organized by: {event.Organizer}</Text>
        )}
        <Text style={styles.eventDescription}>
          {event.Description || 'No description available'}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.participants}>
            👥 Participants: {event.participants?.length || 0}/{event.Max_Participants}
          </Text>
          <TouchableOpacity 
            style={[
              styles.joinButton,
              event.participants?.includes(user?.email || '') && styles.joinedButton,
              (event.participants?.length || 0) >= parseInt(event.Max_Participants) && 
              !event.participants?.includes(user?.email || '') && styles.disabledButton
            ]}
            onPress={() => handleEventParticipation(event)}
            disabled={(event.participants?.length || 0) >= parseInt(event.Max_Participants) && 
                     !event.participants?.includes(user?.email || '')}
          >
            <Text style={styles.joinButtonText}>
              {event.participants?.includes(user?.email || '') ? 'Leave' : 'Join'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#44c9ea', 'white']} style={styles.header}>
        <Text style={styles.title}>Student Meet</Text>
        <TouchableOpacity>
          <FontAwesome name="search" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView 
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {events.length > 0 ? (
          events.map((event, index) => (
            <EventCard key={index} event={event} />
          ))
        ) : (
          <Text style={styles.placeholderText}>No events found</Text>
        )}
      </ScrollView>

      <UserFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 120,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins',
  },
  body: {
    paddingTop: 140,
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  placeholderImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  eventDate: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  eventTime: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 4,
  },
  eventCategory: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  eventOrganizer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  participants: {
    fontSize: 14,
    color: '#666',
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  placeholderText: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
  joinedButton: {
    backgroundColor: Colors.secondary,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});

export default Home;

