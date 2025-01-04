import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EventData } from '../app/types/event';
import Colors from '../constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

interface EventCardProps {
  event: EventData;
}

const EventCard = ({ event }: EventCardProps) => {
  return (
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
            <FontAwesome name="users" size={16} color="#666" /> {event.Max_Participants}
          </Text>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>Join</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
});

export default EventCard; 