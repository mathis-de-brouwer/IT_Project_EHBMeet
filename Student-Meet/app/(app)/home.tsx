import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import UserFooter from '../../components/footer';
import Colors from '../../constants/Colors';
import { db } from '../../firebase_backup.js';
import { collection, getDocs } from 'firebase/firestore';

interface EventData {
  Event_Title: string;
  Description: string;
  Date: string;
  Location: string;
  Max_Participants: string;
  Event_picture?: string;
}

const Home = () => {
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const eventsRef = collection(db, "Event");
      const querySnapshot = await getDocs(eventsRef);
      const eventsData = querySnapshot.docs.map(doc => doc.data() as EventData);
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events: ", error);
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
        <Text style={styles.eventDate}>{event.Date}</Text>
        <Text style={styles.eventLocation}>📍 {event.Location}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.Description || 'No description available'}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.participants}>
            👥 Max participants: {event.Max_Participants}
          </Text>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join</Text>
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
});

export default Home;

