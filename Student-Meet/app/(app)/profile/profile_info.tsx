import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getUserById } from '../../../utils/userUtils';
import Colors from '../../../constants/Colors';
import { UserData } from '../../types/user';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/header';
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfileInfoScreen() {
  const { userId } = useLocalSearchParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'Users', userId as string);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data() as UserData;
        console.log('Fetched user data:', userData);
        setUser({ ...userData, User_ID: userSnap.id });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
    setLoading(false);
  };

  // Use useFocusEffect to refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
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
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={Colors.text} />
      </TouchableOpacity>

        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../../assets/images/default-avatar.png')}
              style={styles.avatar}
            />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.name}>{user.First_Name} {user.Second_name}</Text>
            <Text style={styles.email}>{user.email}</Text>
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {user.Description || 'No description added'}
            </Text>
            
            {(user.Discord_name || user.Steam_name) && (
              <View style={styles.gamingProfiles}>
                {user.Discord_name && (
                  <View style={styles.profileRow}>
                    <Text style={styles.profileLabel}>Discord:</Text>
                    <Text style={styles.profileValue}>{user.Discord_name}</Text>
                  </View>
                )}
                {user.Steam_name && (
                  <View style={styles.profileRow}>
                    <Text style={styles.profileLabel}>Steam:</Text>
                    <Text style={styles.profileValue}>{user.Steam_name}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>📚</Text>
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Department</Text>
                <Text style={styles.detailValue}>{user.Department || 'Not specified'}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🎂</Text>
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Date of Birth</Text>
                <Text style={styles.detailValue}>{user.Date_Of_Birth || 'Not specified'}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>📧</Text>
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>E-Mail</Text>
                <Text style={styles.detailValue}>{user.email}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>👤</Text>
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Gender</Text>
                <Text style={styles.detailValue}>{user.Gender || 'Not specified'}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>📍</Text>
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Region</Text>
                <Text style={styles.detailValue}>{user.Region || 'Not specified'}</Text>
              </View>
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
    backgroundColor: Colors.background,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
   
  },
  scrollView: {
    flex: 1,
    marginTop: 150,
    width: '100%',
    maxWidth: 600,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  nameContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: Colors.secondary,
  },
  descriptionContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  detailsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 20,
    marginRight: 15,
  },
  icon: {
    fontSize: 20,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.text,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 20,
  },
  gamingProfiles: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  profileLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginRight: 8,
  },
  profileValue: {
    fontSize: 16,
    color: Colors.text,
  },
});
