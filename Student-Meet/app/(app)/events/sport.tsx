import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase_backup';
import { EventData } from '../../types/event';
import UserFooter from '../../../components/footer';
import EventCard from '../../../components/EventCard';

export default function SportEventsScreen() {
  const [events, setEvents] = useState<EventData[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const q = query(
        collection(db, "Event"), 
        where("Category_id", "==", "sport")
      );
      
      const querySnapshot = await getDocs(q);
      const eventsList = querySnapshot.docs.map(doc => doc.data() as EventData);
      setEvents(eventsList);
    };

    fetchEvents();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sport Events</Text>
      <FlatList
        data={events}
        renderItem={({ item }) => <EventCard event={item} />}
        keyExtractor={(item) => item.Created_At}
      />
      <UserFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    color: '#333',
  },
});
