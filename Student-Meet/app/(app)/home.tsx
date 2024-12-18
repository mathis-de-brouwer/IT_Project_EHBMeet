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

<<<<<<< HEAD
=======
  const testEventData = async () => {
    try {
      const eventsRef = collection(db, "Event");
      const querySnapshot = await getDocs(eventsRef);
      
      querySnapshot.docs.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\n--- Event ${index + 1} Data Check ---`);
        console.log('Document ID:', doc.id);
        console.log('Title:', data.Event_Title || 'MISSING');
        console.log('Description:', data.Description || 'MISSING');
        console.log('Date:', data.Date || 'MISSING');
        console.log('Location:', data.Location || 'MISSING');
        console.log('Max Participants:', data.Max_Participants || 'MISSING');
        console.log('Event Picture:', data.Event_picture || 'MISSING');
        console.log('Start Time:', data.Start_Time || 'MISSING');
        console.log('End Time:', data.End_Time || 'MISSING');
        console.log('Category:', data.Category || 'MISSING');
        console.log('Organizer:', data.Organizer || 'MISSING');
      });
    } catch (error) {
      console.error("Error testing event data: ", error);
    }
  };

  const handleEventParticipation = async (event: EventData) => {
    if (!user?.email || !event.id) return;

    const isParticipant = event.participants?.includes(user.email);

    if (isParticipant) {
      // Handle leaving the event
      try {
        const eventRef = doc(db, "Event", event.id);
        const newParticipants = event.participants?.filter(email => email !== user.email) || [];
        
        await updateDoc(eventRef, {
          participants: newParticipants
        });

        setEvents(prevEvents => prevEvents.map(e => 
          e.id === event.id 
            ? { ...e, participants: newParticipants }
            : e
        ));

        Alert.alert('Success', 'You have left the event');
      } catch (error) {
        console.error("Error leaving event: ", error);
        Alert.alert('Error', 'Failed to leave event. Please try again.');
      }
    } else {
      // Handle joining the event
      if ((event.participants?.length || 0) >= parseInt(event.Max_Participants)) {
        Alert.alert('Event Full', 'This event has reached its maximum participants');
        return;
      }

      try {
        const eventRef = doc(db, "Event", event.id);
        const newParticipants = [...(event.participants || []), user.email];
        
        await updateDoc(eventRef, {
          participants: newParticipants
        });

        setEvents(prevEvents => prevEvents.map(e => 
          e.id === event.id 
            ? { ...e, participants: newParticipants }
            : e
        ));

        Alert.alert('Success', 'You have successfully joined the event!');
      } catch (error) {
        console.error("Error joining event: ", error);
        Alert.alert('Error', 'Failed to join event. Please try again.');
      }
    }
  };

>>>>>>> parent of f03421f7 (Merge branch 'backend' of https://github.com/mathis-de-brouwer/IT_Project_EHBMeet into backend)
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

