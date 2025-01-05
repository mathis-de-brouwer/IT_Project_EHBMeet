import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase_backup';
import Colors from '../../../constants/Colors';
import { EventData } from '../../../app/types/event';
import EventCard from '../../../components/EventCard';

export default function EventsScreen() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    const eventsCollection = collection(db, 'Event');
    const eventsSnapshot = await getDocs(eventsCollection);
    const eventsList = eventsSnapshot.docs.map(doc => ({ 
      ...doc.data(),
      id: doc.id 
    } as EventData));
    setEvents(eventsList);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchEvents().then(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
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
        <Text style={styles.title}>All Events</Text>
        <Text style={styles.subtitle}>Total Events: {events.length}</Text>
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isAdmin={true}
          />
        ))}
      </ScrollView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 20,
  }
});