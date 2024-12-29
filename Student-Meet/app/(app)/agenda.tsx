import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { db } from '../../firebase_backup'; 
import { collection, query, where, getDocs, doc, deleteDoc, getDoc, updateDoc } from 'firebase/firestore';
import { AuthContext } from '../_layout';
import Header from '../../components/header';
import UserFooter from '../../components/footer'; 
import Colors from '../../constants/Colors';
import { EventData } from '../types/event';
import { useRouter } from 'expo-router';

const Agenda = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [eventsCreated, setEventsCreated] = useState<EventData[]>([]);
  const [eventsParticipating, setEventsParticipating] = useState<EventData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!user?.User_ID) return;
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      // Fetch created events
      const createdEventsQuery = query(
        collection(db, 'Event'),
        where('User_ID', '==', user?.User_ID)
      );
      const createdEventsSnapshot = await getDocs(createdEventsQuery);
      const createdEvents = createdEventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EventData));

      // Fetch participating events
      const participatingEventsQuery = query(
        collection(db, 'Event'),
        where('participants', 'array-contains', user?.User_ID)
      );
      const participatingEventsSnapshot = await getDocs(participatingEventsQuery);
      const participatingEvents = participatingEventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EventData));

      setEventsCreated(createdEvents);
      setEventsParticipating(participatingEvents);

    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert('Error', 'Unable to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventPress = (event: EventData) => {
    router.push({
      pathname: '/events/activity',
      params: { 
        eventId: event.id,
        isCreator: event.User_ID === user?.User_ID ? '1' : '0',
        returnTo: 'agenda'
      }
    });
  };

  const handleDeleteEvent = async (eventId: string | undefined, e?: any) => {
    if (!eventId) return;
    if (e) {
      e.stopPropagation();
    }
    
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteDoc(doc(db, 'Event', eventId));
              Alert.alert('Success', 'Event deleted successfully');
              fetchEvents();
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleLeaveEvent = async (eventId: string | undefined) => {
    if (!eventId) return;
    try {
      const eventRef = doc(db, 'Event', eventId);
      const eventDoc = await getDoc(eventRef);
      const currentEvent = eventDoc.data();

      if (!currentEvent?.participants?.includes(user?.User_ID)) {
        Alert.alert('Error', 'You are not part of this event');
        return;
      }

      const newParticipants = currentEvent.participants.filter((id: string) => id !== user?.User_ID);
      await updateDoc(eventRef, {
        participants: newParticipants
      });

      Alert.alert('Success', 'You have left the event');
      fetchEvents(); // Refresh the list
    } catch (error) {
      console.error('Error leaving event:', error);
      Alert.alert('Error', 'Failed to leave event. Please try again.');
    }
  };

  const handleEditEvent = (event: EventData) => {
    router.push({
      pathname: '/events/activity_add',
      params: { 
        eventId: event.id,
        isEditing: '1'
      }
    });
  };

  const renderEventCard = (event: EventData, isCreated: boolean) => (
    <TouchableOpacity 
      key={event.id} 
      style={styles.eventCard}
      onPress={() => handleEventPress(event)}
      activeOpacity={0.7}
    >
      <View>
        <Text style={styles.eventTitle}>{event.Event_Title}</Text>
        <Text style={styles.eventDate}>📅 {event.Date}</Text>
        <Text style={styles.eventLocation}>📍 {event.Location}</Text>
        <View style={styles.cardFooter}>
          <Text style={styles.participants}>
            👥 {event.participants?.length || 0}/{event.Max_Participants}
          </Text>
          {isCreated ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                onPress={() => handleEditEvent(event)}
                style={styles.editButton}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={(e) => handleDeleteEvent(event.id, e)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => handleLeaveEvent(event.id)}
              style={styles.leaveButton}
            >
              <Text style={styles.buttonText}>Leave</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Header title="My Events" />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : (
          <View style={styles.content}>
            {eventsCreated.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Events I Created</Text>
                {eventsCreated.map(event => renderEventCard(event, true))}
              </View>
            )}

            {eventsParticipating.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Events I'm Joining</Text>
                {eventsParticipating.map(event => renderEventCard(event, false))}
              </View>
            )}

            {eventsCreated.length === 0 && eventsParticipating.length === 0 && (
              <Text style={styles.noEventsText}>
                You haven't created or joined any events yet
              </Text>
            )}
          </View>
        )}
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
  headerContainer: {
    height: 150, // Match header height
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20, // Reduced from 120
    paddingBottom: 100,
    paddingHorizontal: 16,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  eventCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
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
  participantsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  participants: {
    fontSize: 14,
    color: '#666',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noEventsText: {
    textAlign: 'center',
    color: Colors.placeholder,
    fontSize: 16,
    marginTop: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
});

export default Agenda;
