import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase_backup';
import { EventData } from '../types/event';
import UserFooter from '../../components/footer';
import { AuthContext } from '../_layout';
import Colors from '../../constants/Colors';

export default function Agenda() {
  const [myEvents, setMyEvents] = useState<EventData[]>([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchMyEvents();
  }, [user]);

  const fetchMyEvents = async () => {
    if (!user) return;

    try {
      const eventsRef = collection(db, "Event");
      const q = query(eventsRef, where("participants", "array-contains", user.User_ID));
      const querySnapshot = await getDocs(q);
      const eventsList = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as EventData));
      setMyEvents(eventsList);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Events</Text>
      <ScrollView style={styles.scrollView}>
        {myEvents.length > 0 ? (
          myEvents.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <Text style={styles.eventTitle}>{event.Event_Title}</Text>
              <Text style={styles.eventDate}>{event.Date}</Text>
              <Text style={styles.eventLocation}>📍 {event.Location}</Text>
              <Text style={styles.eventDescription}>{event.Description}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noEventsText}>You haven't joined any events yet</Text>
        )}
      </ScrollView>
      <UserFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.text,
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
  },
  noEventsText: {
    textAlign: 'center',
    color: Colors.placeholder,
    fontSize: 16,
    marginTop: 20,
  },
});
