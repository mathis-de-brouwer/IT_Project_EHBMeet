import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import UserFooter from '../../components/footer';
import Colors from '../../constants/Colors';
import { db } from '@/firebase';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { AuthContext } from '../../app/_layout';
import EventCard from '../../components/EventCard';
import { EventData } from '../types/event';
import { LinearGradient } from 'expo-linear-gradient';

const filterAndSortEvents = (eventsData: EventData[], userId: string, selectedFilter: string) => {
  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  return eventsData
    .filter(event => {
      const eventDate = new Date(event.Date);
      const isOwnEvent = event.User_ID === userId;
      const isAttending = event.participants?.includes(userId);

      if (selectedFilter === 'myEvent') {
        return isOwnEvent;
      }
      if (selectedFilter === 'attendEvent') {
        return isAttending;
      }
      // "All" includes both created and attending events
      return eventDate >= twentyFourHoursAgo && (isOwnEvent || isAttending);
    })
    .sort((a, b) => {
      const dateA = new Date(a.Date);
      const dateB = new Date(b.Date);
      return dateA.getTime() - dateB.getTime();
    });
};

const Agenda = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const { user } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useEffect(() => {
    if (!user) return;
    const eventsRef = collection(db, "Event");
    const unsubscribe = onSnapshot(eventsRef, (snapshot) => {
      const eventsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        participants: doc.data().participants || []
      } as EventData));

      const filteredAndSortedEvents = filterAndSortEvents(eventsData, user.User_ID, selectedFilter);
      setEvents(filteredAndSortedEvents);
    }, (error) => {
      console.error("Error listening to events: ", error);
    });

    return () => unsubscribe();
  }, [user, selectedFilter]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    if (!user) return;

    const fetchEvents = async () => {
      const eventsRef = collection(db, "Event");
      const snapshot = await getDocs(eventsRef);
      const eventsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        participants: doc.data().participants || []
      } as EventData));

      const filteredAndSortedEvents = filterAndSortEvents(eventsData, user.User_ID, selectedFilter);
      setEvents(filteredAndSortedEvents);
      setRefreshing(false);
    };

    fetchEvents();
  }, [user, selectedFilter]);

  const renderEventCard = (event: EventData) => {
    const eventDate = new Date(event.Date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastEvent = eventDate < today;

    return (
      <EventCard 
        key={event.id} 
        event={event} 
        style={isPastEvent ? styles.pastEvent : undefined}
      />
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#44c9ea', 'white']} 
        style={styles.header}
      >
        <Text style={styles.title}>Agenda</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => alert('No new notifications')}
        >
          <FontAwesome name="bell" size={30} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[
            styles.filterButton, 
            selectedFilter === 'all' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.filterButton, 
            selectedFilter === 'myEvent' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('myEvent')}
        >
          <Text style={styles.filterText}>My Event</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.filterButton, 
            selectedFilter === 'attendEvent' && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter('attendEvent')}
        >
          <Text style={styles.filterText}>Attend Event</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
            progressViewOffset={100}
          />
        }
      >
        {events.map((event) => renderEventCard(event))}
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
    height: 130,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
  },
  body: {
    paddingTop: 200,
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  notificationButton: {
    position: 'absolute',
    top: 20,
    right: 10,
    padding: 10,
  },
  pastEvent: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 140,
    paddingHorizontal: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default Agenda;
