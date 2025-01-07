import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getUserById } from '../../../utils/userUtils';
import Colors from '../../../constants/Colors';
import { UserData } from '../../types/user';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import Header from '@/components/header';
import { db } from '@/firebase';

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
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Profile" showSearch={false} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.profileContainer}>
          <Image
            source={require('../../../assets/images/default-avatar.png')}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user.First_Name} {user.Second_name}</Text>
          <Text style={styles.email}>{user.email}</Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Department</Text>
              <Text style={styles.value}>{user.Department || 'Not specified'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Date of Birth</Text>
              <Text style={styles.value}>{user.Date_Of_Birth || 'Not specified'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Gender</Text>
              <Text style={styles.value}>{user.Gender || 'Not specified'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Region</Text>
              <Text style={styles.value}>{user.Region || 'Not specified'}</Text>
            </View>

            <View style={styles.descriptionRow}>
              <Text style={styles.label}>Description</Text>
              <Text style={styles.description}>{user.Description || 'No description added'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  avatar: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: Colors.text,
  },
  infoRow: {
    marginBottom: 15,
  },
  infoSection: {
    width: '100%',
    padding: 20,
  },
  descriptionRow: {
    marginTop: 20,
  },
  scrollView: {
    width: '100%',
    marginTop: 150,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
});
