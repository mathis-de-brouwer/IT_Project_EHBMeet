import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, StyleProp, ViewStyle, GestureResponderEvent, Platform } from 'react-native';
import { EventData } from '../app/types/event';
import Colors from '../constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, updateDoc, arrayUnion, getDoc, addDoc, collection, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { useContext } from 'react';
import { AuthContext } from '../app/_layout';

interface EventCardProps {
  event: EventData;
  style?: StyleProp<ViewStyle>;
  isAdmin?: boolean;
  onEventUpdate?: (event: EventData) => void;
}

const EventCard = ({ event, style, isAdmin, onEventUpdate }: EventCardProps) => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(event.participants?.includes(user?.User_ID || '') || false);
  const [participantCount, setParticipantCount] = useState(event.participants?.length || 0);
  const isFull = participantCount >= parseInt(event.Max_Participants);
  const isCreator = event.User_ID === user?.User_ID;

  const handleJoinEvent = async (e: GestureResponderEvent) => {
    if (!event || !user || isJoining || !event.id) return;
    setIsJoining(true);

    try {
      const eventRef = doc(db, 'Event', event.id);
      await updateDoc(eventRef, {
        participants: arrayUnion(user.User_ID)
      });

      const notificationData = {
        type: 'join_event',
        userId: event.User_ID,
        userName: user.email,
        eventId: event.id,
        eventTitle: event.Event_Title,
        createdAt: new Date().toISOString(),
        read: false
      };

      await addDoc(collection(db, 'Notifications'), notificationData);

      setHasJoined(true);
      setParticipantCount(prev => prev + 1);
    } catch (error) {
      console.error('Error joining event:', error);
      Alert.alert('Error', 'Failed to join event');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeaveEvent = async (e: any) => {
    e.stopPropagation();
    if (!event || !user || isJoining || !event.id) return;
    setIsJoining(true);

    try {
      const eventRef = doc(db, 'Event', event.id);
      const eventDoc = await getDoc(eventRef);
      const currentEvent = eventDoc.data();
      const newParticipants = currentEvent?.participants.filter((id: string) => id !== user.User_ID) || [];
      
      await updateDoc(eventRef, {
        participants: newParticipants
      });

      const notificationData = {
        type: 'leave_event',
        userId: event.User_ID,
        userName: user.email,
        eventId: event.id,
        eventTitle: event.Event_Title,
        createdAt: new Date().toISOString(),
        read: false
      };

      await addDoc(collection(db, 'Notifications'), notificationData);

      setHasJoined(false);
      setParticipantCount(prev => prev - 1);
    } catch (error) {
      console.error('Error leaving event:', error);
      Alert.alert('Error', 'Failed to leave event');
    } finally {
      setIsJoining(false);
    }
  };

  const handleDeleteEvent = async () => {
    const eventId = event.id;
    if (!eventId) return;
    
    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // First, delete all notifications related to this event
              const notificationsRef = collection(db, 'Notifications');
              const notificationsQuery = query(notificationsRef, where('eventId', '==', eventId));
              const notificationsSnapshot = await getDocs(notificationsQuery);
              
              await Promise.all(notificationsSnapshot.docs.map(doc => deleteDoc(doc.ref)));

              // Delete the event
              const eventRef = doc(db, 'Event', eventId);
              await deleteDoc(eventRef);
              
              // Notify parent component about deletion
              if (onEventUpdate) {
                onEventUpdate({ ...event, id: eventId });
              }
              
              // Force refresh the page on web
              if (Platform.OS === 'web') {
                router.replace('/(app)/(admin)/events' as any);
              }
              
            } catch (error) {
              console.error('Error deleting event:', error);
              Alert.alert('Error', 'Failed to delete event. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleEdit = async (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (!event || !user || !event.id) return;

    try {
      const eventRef = doc(db, 'Event', event.id);
      const eventDoc = await getDoc(eventRef);
      const currentEvent = eventDoc.data();

      if (!currentEvent) return;

      const notificationData = {
        type: 'event_edited',
        userId: currentEvent.User_ID,
        userName: user.email,
        eventId: event.id,
        eventTitle: event.Event_Title,
        createdAt: new Date().toISOString(),
        read: false
      };

      // Notify the creator
      await addDoc(collection(db, 'Notifications'), notificationData);

      // Notify participants
      if (currentEvent.participants) {
        await Promise.all(currentEvent.participants.map(async (participantId: string) => {
          await addDoc(collection(db, 'Notifications'), {
            ...notificationData,
            userId: participantId
          });
        }));
      }

      // Add a small delay before navigating to ensure notifications are sent
      setTimeout(() => {
        router.push({
          pathname: '/events/activity_add',
          params: { 
            eventId: event.id,
            isEditing: '1',
            returnTo: isAdmin ? 'admin' : 'home'
          }
        });
      }, 500); // 500ms delay
    } catch (error) {
      console.error('Error editing event:', error);
      Alert.alert('Error', 'Failed to edit event');
    }
  };

  return (
    <TouchableOpacity 
      onPress={() => router.push({
        pathname: '/events/activity' as any,
        params: { 
          eventId: event.id,
          returnTo: isAdmin ? 'admin' : undefined 
        }
      })}
      activeOpacity={0.7}
      style={[styles.card, style]}
    >
      <View style={styles.cardContent}>
        <Text style={styles.eventTitle}>{event.Event_Title}</Text>
        <Text style={styles.eventDate}>{event.Date}</Text>
        <Text style={styles.eventLocation}>📍 {event.Location}</Text>
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.Description || 'No description available'}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.participants}>
            <FontAwesome name="users" size={16} color="#666" /> 
            {participantCount}/{event.Max_Participants}
          </Text>
          
          {isAdmin ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={handleEdit}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteEvent();
                }}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {isCreator ? (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={handleEdit}
                  >
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteEvent();
                    }}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  {hasJoined ? (
                    <TouchableOpacity 
                      style={[styles.leaveButton, isJoining && styles.buttonDisabled]}
                      onPress={handleLeaveEvent}
                      disabled={isJoining}
                    >
                      <Text style={styles.buttonText}>Leave</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.joinButton, (isJoining || isFull) && styles.buttonDisabled]}
                      onPress={handleJoinEvent}
                      disabled={isJoining || isFull}
                    >
                      <Text style={styles.buttonText}>
                        {isFull ? 'Full' : 'Join'}
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
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
  eventDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  participants: {
    fontSize: 14,
    color: '#666',
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statusContainer: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
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
  leaveButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pastEvent: {
    opacity: 0.5,
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  deleteButton: {
    backgroundColor: Colors.error,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
});

export default EventCard;