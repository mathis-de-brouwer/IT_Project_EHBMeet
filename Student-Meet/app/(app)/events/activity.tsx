import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase_backup';
import { EventData } from '../../types/event';
import { AuthContext } from '../../_layout';
import UserFooter from '../../../components/footer';
import Colors from '../../../constants/Colors';
import { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function EventDetailsScreen() {
  const { eventId } = useLocalSearchParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [participantCount, setParticipantCount] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!eventId) return;
      const eventDoc = await getDoc(doc(db, 'Event', eventId as string));
      if (eventDoc.exists()) {
        const eventData = eventDoc.data() as EventData;
        setEvent(eventData);
        setParticipantCount(eventData.participants?.length || 0);
        setHasJoined(eventData.participants?.includes(user?.User_ID || '') || false);
      }
    };
    fetchEventDetails();
  }, [eventId, user]);

  const handleJoinEvent = async () => {
    if (!event || !user || isJoining) return;
    setIsJoining(true);

    try {
      const eventRef = doc(db, 'Event', eventId as string);
      const eventDoc = await getDoc(eventRef);
      const currentEvent = eventDoc.data();

      // Check if user is already joined
      if (currentEvent?.participants?.includes(user.User_ID)) {
        Alert.alert('Error', 'You have already joined this event');
        return;
      }

      // Check if event is full
      if (currentEvent?.participants?.length >= parseInt(event.Max_Participants)) {
        Alert.alert('Error', 'This event is already full');
        return;
      }

      // Add user to participants
      await updateDoc(eventRef, {
        participants: arrayUnion(user.User_ID)
      });

      Alert.alert('Success', 'You have successfully joined the event!', [
        { 
          text: 'OK', 
          onPress: () => router.replace('/(app)/home')  // Go back to home instead
        }
      ]);
    } catch (error) {
      console.error('Error joining event:', error);
      Alert.alert('Error', 'Failed to join event. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveEvent = async () => {
    if (!event || !user || isJoining) return;
    setIsJoining(true);

    try {
      const eventRef = doc(db, 'Event', eventId as string);
      const eventDoc = await getDoc(eventRef);
      const currentEvent = eventDoc.data();

      if (!currentEvent?.participants?.includes(user.User_ID)) {
        Alert.alert('Error', 'You are not part of this event');
        return;
      }

      await updateDoc(eventRef, {
        participants: currentEvent.participants.filter((id: string) => id !== user.User_ID)
      });

      Alert.alert('Success', 'You have left the event');
      router.back();
    } catch (error) {
      console.error('Error leaving event:', error);
      Alert.alert('Error', 'Failed to leave event. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.replace('/(app)/home')}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>
      <ScrollView style={styles.content}>
        <Text style={styles.title}>{event.Event_Title}</Text>
        
        <View style={styles.infoSection}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{event.Date}</Text>
          
          <Text style={styles.label}>Location</Text>
          <Text style={styles.value}>{event.Location}</Text>
          
          <Text style={styles.label}>Category</Text>
          <Text style={styles.value}>{event.Category_id}</Text>
          
          <Text style={styles.label}>Maximum Participants</Text>
          <Text style={styles.value}>{event.Max_Participants}</Text>

          {event.Phone_Number && (
            <>
              <Text style={styles.label}>Contact</Text>
              <Text style={styles.value}>{event.Phone_Number}</Text>
            </>
          )}
          
          <Text style={styles.label}>Description</Text>
          <Text style={styles.description}>{event.Description}</Text>
          
          <Text style={styles.label}>Participants</Text>
          <Text style={styles.value}>
            {participantCount} / {event.Max_Participants}
          </Text>
          
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, styles[event.status || 'open']]}>
            {participantCount >= parseInt(event.Max_Participants) ? 'FULL' : 'OPEN'}
          </Text>
        </View>

        {hasJoined ? (
          <TouchableOpacity 
            style={[styles.leaveButton, isJoining && styles.buttonDisabled]}
            onPress={handleLeaveEvent}
            disabled={isJoining}
          >
            <Text style={styles.buttonText}>
              {isJoining ? 'Leaving...' : 'Leave Event'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.joinButton, isJoining && styles.buttonDisabled]}
            onPress={handleJoinEvent}
            disabled={isJoining || participantCount >= parseInt(event.Max_Participants)}
          >
            <Text style={styles.buttonText}>
              {isJoining ? 'Joining...' : 'Join Event'}
            </Text>
          </TouchableOpacity>
        )}
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
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.text,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  joinButtonDisabled: {
    opacity: 0.7,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  leaveButton: {
    backgroundColor: Colors.error,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  open: {
    color: Colors.success,
  },
  full: {
    color: Colors.error,
  },
  cancelled: {
    color: Colors.placeholder,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
});