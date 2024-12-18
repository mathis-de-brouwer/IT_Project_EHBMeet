import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EventData } from '../app/types/event';
import Colors from '../constants/Colors';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface EventCardProps {
  event: EventData;
}

const EventCard = ({ event }: EventCardProps) => {
  const router = useRouter();
  const participantCount = event.participants?.length || 0;
  const isFull = participantCount >= parseInt(event.Max_Participants);

  const handlePress = () => {
    router.push({
      pathname: '/events/activity',
      params: { eventId: event.id }
    });
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <View style={styles.card}>
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
            <View style={styles.statusContainer}>
              <Text style={[styles.status, styles[event.status || (isFull ? 'full' : 'open')]]}>
                {isFull ? 'FULL' : 'OPEN'}
              </Text>
            </View>
          </View>
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
});

export default EventCard; 