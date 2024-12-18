import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert, RefreshControl } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import UserFooter from '../../components/footer';
import Colors from '../../constants/Colors';
import { db } from '../../firebase_backup.js';
import { collection, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../../app/_layout';
import EventCard from '../../components/EventCard';
import { EventData } from '../types/event';

const Home = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Set up real-time listener for events
    const eventsRef = collection(db, "Event");
    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        participants: doc.data().participants || []
      } as EventData));
      setEvents(eventsData);
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
      setEvents(eventsData);
      setRefreshing(false);
    };

    fetchEvents();
  }, []);

  const filteredEvents = React.useMemo(() => {
    if (!selectedCategory) return events;
    return events.filter(event => event.Category_id === selectedCategory);
  }, [events, selectedCategory]);

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

        {filteredEvents.length > 0 ? (
          filteredEvents.map((event, index) => (
            <EventCard key={event.id || index} event={event} />
          ))
        ) : (
          <Text style={styles.placeholderText}>No events found</Text>
        )}
      </ScrollView>

      <LinearGradient 
        colors={['#44c9ea', 'white']} 
        style={styles.header}
        pointerEvents="box-none"
      >
        <Text style={styles.title}>Student Meet</Text>
        <TouchableOpacity>
          <FontAwesome name="search" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>

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
  placeholderText: {
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
});

export default Home;

