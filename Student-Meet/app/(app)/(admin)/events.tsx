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
import { FontAwesome } from '@expo/vector-icons';
import { Modal, TextInput, TouchableOpacity } from 'react-native';

export default function EventsScreen() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Filter events based on search query
  const filteredEvents = events.filter(event =>
    event.Event_Title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <View style={styles.container}>
      <AdminHeader 
        title="Manage Events" 
        showSearch={false} 
        onSearch={handleSearch}
      />
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
        <View style={styles.headerSpacer} />
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search events..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={Colors.placeholder}
          />
          <TouchableOpacity style={styles.searchButton}>
            <FontAwesome name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Total Events: {filteredEvents.length}</Text>
        {filteredEvents.map((event) => (
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
    marginTop: -20,
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
  },
  headerSpacer: {
    height: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 10,
    marginBottom: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 15,
    fontSize: 16,
    color: Colors.text,
  },
  searchButton: {
    padding: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
});