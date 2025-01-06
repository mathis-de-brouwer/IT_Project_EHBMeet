import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, updateDoc, arrayUnion, getDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase_backup';
import { EventData } from '../../types/event';
import { AuthContext } from '../../_layout';
import UserFooter from '../../../components/footer';
import Colors from '../../../constants/Colors';
import { useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getUserById } from '../../../utils/userUtils';

interface ParticipantData {
  User_ID: string;
  First_Name: string;
  Second_name: string;
  email: string;
}

export default function EventDetailsScreen() {
  const { eventId, returnTo, isCreator } = useLocalSearchParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [participantCount, setParticipantCount] = useState(0);
  const [hasJoined, setHasJoined] = useState(false);
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!event?.participants || !user) return;
      
      setIsLoading(true);
      try {
        const participantPromises = event.participants.map(id => getUserById(id));
        const participantData = await Promise.all(participantPromises);
        setParticipants(participantData.filter(p => p !== null) as ParticipantData[]);
      } catch (error) {
        console.error('Error fetching participants:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchParticipants();
  }, [event?.participants]);

  const handleJoinEvent = async () => {
    if (!event || !user || isJoining) return;
    setIsJoining(true);

    try {
      const eventRef = doc(db, 'Event', eventId as string);
      const eventDoc = await getDoc(eventRef);
      const currentEvent = eventDoc.data();

      if (currentEvent?.participants?.includes(user.User_ID)) {
        Alert.alert('Error', 'You have already joined this event');
        return;
      }

      if (currentEvent?.participants?.length >= parseInt(event.Max_Participants)) {
        Alert.alert('Error', 'This event is already full');
        return;
      }

      await updateDoc(eventRef, {
        participants: arrayUnion(user.User_ID)
      });

      setEvent(prev => ({
        ...prev!,
        participants: [...(prev?.participants || []), user.User_ID]
      }));
      setParticipantCount(prev => prev + 1);
      setHasJoined(true);

      Alert.alert('Success', 'You have successfully joined the event!', [
        { 
          text: 'OK', 
          onPress: () => returnTo === 'agenda' ? router.push('/(app)/agenda') : router.push('/(app)/home')
        }
      ]);

      // Add notification
      const notificationData = {
        type: 'join_event',
        userId: event.User_ID, // Event creator's ID
        userName: user.email,
        eventId: eventId.toString(),
        eventTitle: event.Event_Title,
        createdAt: new Date().toISOString(),
        read: false
      };

      await addDoc(collection(db, 'Notifications'), notificationData);
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

      const newParticipants = currentEvent.participants.filter((id: string) => id !== user.User_ID);
      await updateDoc(eventRef, {
        participants: newParticipants
      });

      setEvent(prev => ({
        ...prev!,
        participants: newParticipants
      }));
      setParticipantCount(prev => prev - 1);
      setHasJoined(false);

      Alert.alert('Success', 'You have left the event', [
        {
          text: 'OK',
          onPress: () => returnTo === 'agenda' ? router.push('/(app)/agenda') : router.push('/(app)/home')
        }
      ]);

      // Add notification
      const notificationData = {
        type: 'leave_event',
        userId: event.User_ID,
        userName: user.email,
        eventId: eventId.toString(),
        eventTitle: event.Event_Title,
        createdAt: new Date().toISOString(),
        read: false
      };

      await addDoc(collection(db, 'Notifications'), notificationData);
    } catch (error) {
      console.error('Error leaving event:', error);
      Alert.alert('Error', 'Failed to leave event. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleBack = () => {
    if (returnTo === 'agenda') {
      router.push('/(app)/agenda');
    } else if (returnTo === 'admin') {
      router.push('/(app)/(admin)/events');
    } else {
      router.push('/(app)/home');
    }
  };

  const handleDeleteEvent = async () => {
    if (!event || !user) {
      console.log("Missing event or user data");
      return;
    }

    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        {
          text: 'Cancel',
          style: 'cancel' as const
        },
        {
          text: 'Delete',
          style: 'destructive' as const,
          onPress: async () => {
            try {
              console.log("Starting delete process...");
              
              // Store event details before deletion
              const eventDetails = {
                title: event.Event_Title,
                id: eventId as string
              };

              // Create notification for owner
              console.log("Creating owner notification...");
              const ownerNotification = {
                type: 'event_cancelled' as const,
                userId: user.User_ID,
                userName: 'You',
                eventId: eventDetails.id,
                eventTitle: eventDetails.title,
                createdAt: new Date().toISOString(),
                read: false
              };
              
              const ownerNotifRef = await addDoc(collection(db, 'Notifications'), ownerNotification);
              console.log("Owner notification created:", ownerNotifRef.id);

              // Send notifications to all participants
              const participants = [...(event.participants || [])];
              console.log("Participants to notify:", participants);

              if (participants.length > 0) {
                const notificationPromises = participants.map(participantId => {
                  if (participantId === user.User_ID) return null;
                  
                  console.log("Creating notification for participant:", participantId);
                  const notificationData = {
                    type: 'event_cancelled' as const,
                    userId: participantId,
                    userName: user.First_Name,
                    eventId: eventDetails.id,
                    eventTitle: eventDetails.title,
                    createdAt: new Date().toISOString(),
                    read: false
                  };
                  return addDoc(collection(db, 'Notifications'), notificationData);
                });

                const results = await Promise.all(notificationPromises.filter(Boolean));
                console.log("Participant notifications created:", results.length);
              }

              // Small delay to ensure notifications are processed
              await new Promise(resolve => setTimeout(resolve, 500));

              // Delete the event
              console.log("Deleting event...");
              await deleteDoc(doc(db, 'Event', eventId as string));
              console.log("Event deleted successfully");

              Alert.alert('Success', 'Event deleted successfully', [
                {
                  text: 'OK',
                  onPress: () => returnTo === 'agenda' ? router.push('/(app)/agenda') : router.push('/(app)/home')
                }
              ]);
            } catch (error) {
              console.error('Error in delete process:', error);
              Alert.alert('Error', 'Failed to delete event');
            }
          }
        }
      ]
    );
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
      <TouchableOpacity onPress={handleBack}>
        <Ionicons name="arrow-back" size={24} color="black" />
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

        {event.User_ID === user?.User_ID && (
          <View style={styles.participantsSection}>
            <Text style={styles.label}>Participants List</Text>
            {isLoading ? (
              <ActivityIndicator color={Colors.primary} />
            ) : participants.length > 0 ? (
              <View style={styles.participantsList}>
                {participants.map((participant) => (
                  <TouchableOpacity
                    key={participant.User_ID}
                    style={styles.participantCard}
                    onPress={() => router.push({
                      pathname: '/profile/MyProfile' as any,
                      params: { userId: participant.User_ID }
                    })}
                  >
                    <View style={styles.participantInfo}>
                      <Text style={styles.participantName}>
                        {participant.First_Name} {participant.Second_name}
                      </Text>
                      <Text style={styles.participantEmail}>{participant.email}</Text>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={24} 
                      color={Colors.secondary} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <Text style={styles.noParticipants}>No participants yet</Text>
            )}
          </View>
        )}

        {returnTo === 'admin' ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push({
                pathname: '/events/activity_add',
                params: { 
                  eventId: eventId,
                  isEditing: '1'
                }
              })}
            >
              <Text style={styles.buttonText}>Edit Event</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={handleDeleteEvent}
            >
              <Text style={styles.buttonText}>Delete Event</Text>
            </TouchableOpacity>
          </View>
        ) : (
          isCreator === '1' ? (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => router.push({
                  pathname: '/events/activity_add',
                  params: { 
                    eventId: eventId,
                    isEditing: '1'
                  }
                })}
              >
                <Text style={styles.buttonText}>Edit Event</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeleteEvent}
              >
                <Text style={styles.buttonText}>Delete Event</Text>
              </TouchableOpacity>
            </View>
          ) : (
            hasJoined ? (
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
            )
          )
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 20,
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.secondary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: Colors.error,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  participantsSection: {
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  participantsList: {
    marginTop: 10,
  },
  participantCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  participantEmail: {
    fontSize: 14,
    color: Colors.secondary,
    marginTop: 2,
  },
  noParticipants: {
    textAlign: 'center',
    color: Colors.placeholder,
    marginTop: 10,
  },
});
