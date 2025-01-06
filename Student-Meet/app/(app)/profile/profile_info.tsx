import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getUserById } from '../../../utils/userUtils';
import Colors from '../../../constants/Colors';
import { UserData } from '../../types/user';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function ProfileInfoScreen() {
  const { userId } = useLocalSearchParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        if (!userId) return;
        setLoading(true);
        const userData = await getUserById(userId as string);
        if (userData) {
          setUser(userData as UserData);
        }
        setLoading(false);
      };

      fetchUser();
    }, [userId])
  );

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.primary} />;
  }

  if (!user) {
    return <Text style={styles.errorText}>User not found</Text>;
  }

  return (
    <View style={styles.container}>
      <Image
        source={user.Profile_Picture ? { uri: user.Profile_Picture } : require('../../../assets/images/default-avatar.png')}
        style={styles.profileImage}
      />
      <Text style={styles.name}>{user.First_Name} {user.Second_name}</Text>
      <Text style={styles.email}>{user.email}</Text>
      <Text style={styles.description}>{user.Description || 'No description available'}</Text>
      {/* Add more user details as needed */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
});
