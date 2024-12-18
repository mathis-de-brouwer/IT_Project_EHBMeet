import React, { useEffect, useState, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { collection, query, where, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase_backup';
import { Notification } from '../../types/notification';
import { AuthContext } from '../../_layout';
import UserFooter from '../../../components/footer';
import Colors from '../../../constants/Colors';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!user?.User_ID) {
      console.log("No user ID found", user);
      return;
    }
    
    const notificationsRef = collection(db, 'Notifications');
    const q = query(
      notificationsRef, 
      where('userId', '==', user.User_ID)
    );
    
    console.log("Setting up notifications listener for user:", user.User_ID);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      
      notificationsList.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      console.log("Received notifications:", notificationsList);
      setNotifications(notificationsList);
    });

    return () => unsubscribe();
  }, [user]);

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, !item.read && styles.unreadCard]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationType}>
            {item.type === 'join_event' ? '👋 Joined' : '👋 Left'}
          </Text>
          {!item.read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationText}>
          <Text style={styles.userName}>{item.userName}</Text>
          {item.type === 'join_event' ? ' joined ' : ' left '}
          <Text style={styles.eventTitle}>"{item.eventTitle}"</Text>
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const handleNotificationPress = async (notification: Notification) => {
    try {
      await updateDoc(doc(db, 'Notifications', notification.id), {
        read: true
      });
      router.push(`/events/activity?eventId=${notification.eventId}&fromNotifications=true`);
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#44c9ea', 'white']} style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
      </LinearGradient>

      <View style={styles.content}>
        {notifications.length > 0 ? (
          <FlatList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        )}
      </View>

      <UserFooter />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 120,
    justifyContent: 'flex-end',
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  content: {
    flex: 1,
    marginTop: 10,
    marginBottom: 60, // Space for footer
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins',
  },
  listContainer: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  unreadCard: {
    backgroundColor: '#e3f2fd',
  },
  notificationContent: {
    gap: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  notificationText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 22,
  },
  userName: {
    fontWeight: 'bold',
  },
  eventTitle: {
    fontWeight: '500',
    fontStyle: 'italic',
  },
  timestamp: {
    fontSize: 12,
    color: Colors.placeholder,
    marginTop: 4,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: Colors.placeholder,
    textAlign: 'center',
  },
}); 