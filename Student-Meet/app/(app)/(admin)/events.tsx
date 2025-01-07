import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
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
  const [showSearchModal, setShowSearchModal] = useState(false);

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
        showSearch={true} 
        onSearchPress={() => setShowSearchModal(true)}
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

      <Modal
        visible={showSearchModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSearchModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.searchContainer}>
            <View style={styles.searchHeader}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search events..."
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                }}
              >
                <FontAwesome name="times" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  searchContainer: {
    backgroundColor: Colors.background,
    paddingTop: 50,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
    fontSize: 16,
  },
  closeButton: {
    padding: 5,
  },
});