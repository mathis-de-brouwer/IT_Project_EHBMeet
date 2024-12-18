import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase_backup';
import { Notification } from '../../types/notification';
import { AuthContext } from '../../_layout';
import UserFooter from '../../../components/footer';
import Colors from '../../../constants/Colors';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    const notificationsRef = collection(db, 'Notifications');
    const q = query(notificationsRef, where('userId', '==', user.User_ID));
    const querySnapshot = await getDocs(q);
    const notificationsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Notification));
    
    setNotifications(notificationsList.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  };

  const handleNotificationPress = async (notification: Notification) => {
    // Mark as read
    await updateDoc(doc(db, 'Notifications', notification.id), {
      read: true
    });

    // Navigate to event details
    router.push(`/events/activity?eventId=${notification.eventId}`);
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.unread]}
      onPress={() => handleNotificationPress(item)}
    >
      <Text style={styles.notificationText}>
        {item.type === 'leave_event' && `${item.userName} left your event "${item.eventTitle}"`}
        {item.type === 'join_event' && `${item.userName} joined your event "${item.eventTitle}"`}
        {item.type === 'event_cancelled' && `Event "${item.eventTitle}" has been cancelled`}
      </Text>
      <Text style={styles.notificationDate}>
        {new Date(item.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <UserFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 20,
    color: Colors.text,
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
  },
  unread: {
    backgroundColor: '#e3f2fd',
  },
  notificationText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: Colors.placeholder,
  },
}); 