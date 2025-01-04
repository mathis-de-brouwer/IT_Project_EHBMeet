import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase_backup';
import { Notification } from '../../types/notification';
import { AuthContext } from '../../_layout';
import UserFooter from '../../../components/footer';
import Colors from '../../../constants/Colors';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user?.User_ID) return;

    const notificationsRef = collection(db, 'Notifications');
    const q = query(notificationsRef, where('userId', '==', user.User_ID));

    console.log('Setting up notifications listener for user:', user.User_ID);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Notifications update received:', snapshot.docs.length, 'notifications');
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));

      console.log('Processed notifications:', notificationsList);

      setNotifications(notificationsList.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }, (error) => {
      console.error('Error listening to notifications:', error);
    });

    return () => unsubscribe();
  }, [user?.User_ID]);

  const handleNotificationPress = async (notification: Notification) => {
    try {
      // First update the read status
      await updateDoc(doc(db, 'Notifications', notification.id), {
        read: true
      });

      // Check if the event still exists before navigating
      const eventRef = doc(db, 'Event', notification.eventId);
      const eventDoc = await getDoc(eventRef);

      if (!eventDoc.exists()) {
        Alert.alert('Event Not Found', 'This event may have been deleted.');
        return;
      }

      // If event exists, navigate to it
      router.push(`/events/activity?eventId=${notification.eventId}&fromNotifications=true`);
      
    } catch (error) {
      console.error('Error handling notification:', error);
      Alert.alert('Error', 'Unable to open event details. Please try again.');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return format(date, 'MMM d, yyyy');
  };

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case 'join_event':
        return `${notification.userName} joined your event "${notification.eventTitle}"`;
      case 'leave_event':
        return `${notification.userName} left your event "${notification.eventTitle}"`;
      case 'event_cancelled':
        return `Event "${notification.eventTitle}" has been cancelled`;
      case 'event_edited':
        return `Event "${notification.eventTitle}" has been updated`;
      default:
        return 'New notification';
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.header}>Notifications</Text>
      </View>
      <ScrollView style={styles.scrollView}>
        {notifications.length === 0 ? (
          <Text style={styles.noNotifications}>No notifications yet</Text>
        ) : (
          notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[
                styles.notificationCard,
                !notification.read && styles.unreadCard
              ]}
              onPress={() => handleNotificationPress(notification)}
            >
              <View style={styles.notificationContent}>
                <Text style={styles.notificationText}>
                  {getNotificationMessage(notification)}
                </Text>
                <Text style={styles.timestamp}>
                  {formatTimeAgo(notification.createdAt)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    padding: 10,
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  unreadCard: {
    backgroundColor: '#e3f2fd', 
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 12,
    color: Colors.placeholder,
  },
  noNotifications: {
    textAlign: 'center',
    color: Colors.placeholder,
    marginTop: 40,
    fontSize: 16,
  },
}); 