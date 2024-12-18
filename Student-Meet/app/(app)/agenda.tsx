import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { db } from '../../firebase_backup'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import { AuthContext } from '../_layout';
import Header from '../../components/header';
import UserFooter from '../../components/footer'; 

interface Event {
  id: string;
  Event_Title: string;
  Date: string;
  Location: string;
  Max_Participants: string;
}

const Agenda = () => {
  const { user } = useContext(AuthContext);
  const [eventsCreated, setEventsCreated] = useState<Event[]>([]);
  const [eventsParticipating, setEventsParticipating] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        const createdEventsQuery = query(
          collection(db, 'Event'),
          where('User_ID', '==', user?.User_ID)
        );
        const createdEventsSnapshot = await getDocs(createdEventsQuery);

        setEventsCreated(
          createdEventsSnapshot.docs.map((doc) => ({
            //id: doc.id,
            ...doc.data() as Event,
          }))
        );

        const participatingEventsQuery = query(
          collection(db, 'Event'),
          where('Participants', 'array-contains', user?.User_ID)
        );
        const participatingEventsSnapshot = await getDocs(participatingEventsQuery);

        setEventsParticipating(
          participatingEventsSnapshot.docs.map((doc) => ({
          //  id: doc.id,
            ...doc.data() as Event,
          }))
        );

      } catch (error) {
        console.error('Error fetching events: ', error);
        Alert.alert('Error', 'Unable to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  return (
    <View style={styles.container}>
      <Header title="Agenda" />

      <ScrollView contentContainerStyle={styles.body}>
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <>
            <Text style={styles.text}>Created Events:</Text>
            {/* Render created events */}
            {eventsCreated.map((event) => (
              <View key={event.id} style={styles.eventItem}>
                <Text>{event.Event_Title}</Text>
                <Text>{event.Date}</Text>
              </View>
            ))}

            <Text style={styles.text}>Participating Events:</Text>
            {/* Render participating events */}
            {eventsParticipating.map((event) => (
              <View key={event.id} style={styles.eventItem}>
                <Text>{event.Event_Title}</Text>
                <Text>{event.Date}</Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>

      <UserFooter />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f5',
  },
  body: {
    paddingTop: 150,
    paddingBottom: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: '#333',
    marginBottom: 10,
  },
  eventItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
});

export default Agenda;
