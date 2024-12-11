import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, FlatList } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase_backup';

// Define the type for a user
interface User {
  id: string;
  First_Name: string;
  Second_name: string;
  Description: string;
  Profile_Picture?: string; // Optional field
}

export default function TabTwoScreen() {
  const [users, setUsers] = useState<User[]>([]); // Explicitly define the state type

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'Users'));
        const userData: User[] = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as User[]; // Use type assertion
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users: ', error);
      }
    };

    fetchUsers();
  }, []);
  
  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <Image source={{ uri: item.Profile_Picture || 'https://via.placeholder.com/100' }} style={styles.image} />
      <View>
        <Text style={styles.name}>{item.First_Name} {item.Second_name}</Text>
        <Text style={styles.description}>{item.Description}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User List</Text>
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  list: {
    width: '90%',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#555',
  },
});
