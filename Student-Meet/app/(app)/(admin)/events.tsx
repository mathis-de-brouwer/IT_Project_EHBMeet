import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';
import Colors from '../../../constants/Colors';
import { EventData } from '../../../app/types/event';
import EventCard from '../../../components/EventCard';
import UserFooter from '../../../components/footer';
import AdminHeader from '../../../components/AdminHeader';

export default function EventsScreen() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Set up real-time listener
    const eventsCollection = collection(db, 'Event');
    const unsubscribe = onSnapshot(eventsCollection, (snapshot) => {
      const eventsList = snapshot.docs.map(doc => ({ 
        ...doc.data(),
        id: doc.id 
      } as EventData));
      setEvents(eventsList);
    }, (error) => {
      console.error("Error listening to events:", error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    const fetchEvents = async () => {
      const eventsCollection = collection(db, 'Event');
      const eventsSnapshot = await getDocs(eventsCollection);
      const eventsList = eventsSnapshot.docs.map(doc => ({ 
        ...doc.data(),
        id: doc.id 
      } as EventData));
      setEvents(eventsList);
      setRefreshing(false);
    };
    fetchEvents();
  }, []);

  return (
    <View style={styles.container}>
      <AdminHeader title="Manage Events" />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <Text style={styles.subtitle}>Total Events: {events.length}</Text>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isAdmin={true}
            onEventUpdate={(updatedEvent) => {
              setEvents(currentEvents => 
                currentEvents.map(e => e.id === updatedEvent.id ? updatedEvent : e)
              );
            }}
          />
        ))}
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.text,
  }
});