import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, RefreshControl, Modal, TextInput, GestureResponderEvent } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import UserFooter from '../../components/footer';
import Colors from '../../constants/Colors';
import { db } from '@/firebase';
import { collection, getDocs, doc, updateDoc, onSnapshot, deleteDoc, query, where } from 'firebase/firestore';
import { AuthContext } from '../../app/_layout';
import EventCard from '../../components/EventCard';
import { EventData } from '../types/event';

const filterAndSortEvents = (eventsData: EventData[]) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Delete old events and their notifications from database
  eventsData.forEach(async event => {
    const eventDate = new Date(event.Date);
    if (eventDate < twentyFourHoursAgo && event.id) {
      try {
        // First, delete all notifications related to this event
        const notificationsRef = collection(db, 'Notifications');
        const notificationsQuery = query(notificationsRef, where('eventId', '==', event.id));
        const notificationsSnapshot = await getDocs(notificationsQuery);
        
        const deleteNotificationPromises = notificationsSnapshot.docs.map(doc => 
          deleteDoc(doc.ref)
        );
        await Promise.all(deleteNotificationPromises);

        // Then delete the event
        const eventRef = doc(db, 'Event', event.id);
        await deleteDoc(eventRef);

        console.log(`Deleted event ${event.id} and its notifications`);
      } catch (error) {
        console.error('Error deleting event and notifications:', error);
      }
    }
  });

  return eventsData
    .filter(event => {
      const eventDate = new Date(event.Date);
      return eventDate >= twentyFourHoursAgo;
    })
    .sort((a, b) => {
      const dateA = new Date(a.Date);
      const dateB = new Date(b.Date);
      return dateA.getTime() - dateB.getTime();
    });
};

const Home = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<EventData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Set up real-time listener for events
    const eventsRef = collection(db, "Event");
    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        participants: doc.data().participants || []
      } as EventData));

      const filteredAndSortedEvents = filterAndSortEvents(eventsData);
      setEvents(filteredAndSortedEvents);
    }, (error) => {
      console.error("Error listening to events: ", error);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Fetch fresh data
    const fetchEvents = async () => {
      const eventsRef = collection(db, "Event");
      const snapshot = await getDocs(eventsRef);
      const eventsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        participants: doc.data().participants || []
      } as EventData));

      // Sort events by date
      const sortedEvents = eventsData.sort((a, b) => {
        const dateA = new Date(a.Date);
        const dateB = new Date(b.Date);
        return dateA.getTime() - dateB.getTime();
      });

      setEvents(sortedEvents);
      setRefreshing(false);
    };

    fetchEvents();
  }, []);

  const filteredEvents = React.useMemo(() => {
    if (!selectedCategory) return events;
    return events.filter(event => event.Category_id === selectedCategory);
  }, [events, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const queryLower = query.toLowerCase();
    const filtered = events.filter(event => 
      event.Event_Title.toLowerCase().includes(queryLower) || 
      event.User_ID.toLowerCase().includes(queryLower)
    );
    setSearchResults(filtered);
  };

  const renderEventCard = (event: EventData) => {
    const eventDate = new Date(event.Date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day
    const isPastEvent = eventDate < today; // Only true for events before today

    return (
      <EventCard 
        key={event.id} 
        event={event} 
        style={isPastEvent ? styles.pastEvent : undefined}
      />
    );
  };

  const handleJoinEvent = async (e: GestureResponderEvent) => {
    // ... rest of the code
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            progressViewOffset={120}
          />
        }
      >
        <View style={styles.headerSpacer} />
        <View style={styles.categoryFilters}>
          <TouchableOpacity 
            style={[
              styles.filterButton,
              selectedCategory === 'games' && styles.filterButtonActive
            ]}
            onPress={() => setSelectedCategory(selectedCategory === 'games' ? null : 'games')}
          >
            <Text style={[
              styles.filterText,
              selectedCategory === 'games' && styles.filterTextActive
            ]}>Games</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.filterButton,
              selectedCategory === 'sport' && styles.filterButtonActive
            ]}
            onPress={() => setSelectedCategory(selectedCategory === 'sport' ? null : 'sport')}
          >
            <Text style={[
              styles.filterText,
              selectedCategory === 'sport' && styles.filterTextActive
            ]}>Sport</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.filterButton,
              selectedCategory === 'ehb-events' && styles.filterButtonActive
            ]}
            onPress={() => setSelectedCategory(selectedCategory === 'ehb-events' ? null : 'ehb-events')}
          >
            <Text style={[
              styles.filterText,
              selectedCategory === 'ehb-events' && styles.filterTextActive
            ]}>EhB</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.filterButton,
              selectedCategory === 'creativity' && styles.filterButtonActive
            ]}
            onPress={() => setSelectedCategory(selectedCategory === 'creativity' ? null : 'creativity')}
          >
            <Text style={[
              styles.filterText,
              selectedCategory === 'creativity' && styles.filterTextActive
            ]}>Creative</Text>
          </TouchableOpacity>
        </View>

        {searchResults.length > 0 ? 
          searchResults.map((event) => renderEventCard(event))
          :
          filteredEvents.map((event) => renderEventCard(event))
        }
      </ScrollView>

      <LinearGradient 
        colors={['#44c9ea', 'white']} 
        style={styles.header}
        pointerEvents="box-none"
      >
        <Text style={styles.title}>Student Meet</Text>
        <TouchableOpacity onPress={() => setShowSearch(true)}>
          <FontAwesome name="search" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <Modal
        visible={showSearch}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSearch(false)}
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
                  setShowSearch(false);
                  setSearchQuery('');
                  setSearchResults([]);
                }}
              >
                <FontAwesome name="times" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>
            
            {searchQuery.length > 0 && (
              <Text style={styles.resultsText}>
                {searchResults.length} results found
              </Text>
            )}
          </View>
        </View>
      </Modal>

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
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  noEventsText: {
    fontSize: 18,
    color: Colors.text,
    textAlign: 'center',
    marginTop: 20,
  },
  categoryFilters: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  headerSpacer: {
    height: 140,
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
  resultsText: {
    color: Colors.placeholder,
    marginBottom: 10,
    fontSize: 14,
  },
  pastEvent: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
  },
});

export default Home;

