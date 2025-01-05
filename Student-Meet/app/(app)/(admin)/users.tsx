import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase_backup';
import Colors from '../../../constants/Colors';
import { UserData } from '../../../app/types/user';
import UserFooter from '../../../components/footer';
import AdminHeader from '../../../components/AdminHeader';

export default function UsersScreen() {
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'Users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => ({
        ...doc.data(),
        User_ID: doc.id
      } as UserData));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <AdminHeader title="Manage Users" />
      <ScrollView style={styles.scrollView}>
        <Text style={styles.totalCount}>Total Users: {users.length}</Text>
        {users.map((user) => (
          <View key={user.User_ID} style={styles.userCard}>
            <Text style={styles.userName}>{user.First_Name} {user.Second_name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={[styles.userRole, 
              { color: user.role === 'admin' ? Colors.primary : Colors.secondary }
            ]}>
              Role: {user.role}
            </Text>
            <Text style={styles.userStatus}>
              Status: {user.Blacklisted ? 'Blacklisted' : 'Active'}
            </Text>
          </View>
        ))}
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
  scrollView: {
    flex: 1,
    padding: 20,
  },
  totalCount: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.text,
  },
  userRole: {
    fontSize: 14,
    marginTop: 4,
  },
  userStatus: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 4,
  },
});