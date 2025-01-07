import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../../_layout';
import UserFooter from '../../../components/footer';
import Colors from '../../../constants/Colors';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { UserData } from '../../types/user';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Header from '../../../components/header';

export default function MyProfileScreen() {
  const { user, signOut } = useContext(AuthContext);
  const router = useRouter();
  const [userData, setUserData] = useState(user);

  useFocusEffect(
    useCallback(() => {
      const refreshUserData = async () => {
        if (user?.User_ID) {
          const userRef = doc(db, 'Users', user.User_ID);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserData(userSnap.data() as UserData);
          }
        }
      };
      refreshUserData();
    }, [user?.User_ID])
  );

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/login');
          } catch (error) {
            Alert.alert('Error', 'Failed to sign out.');
          }
        },
      },
    ]);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.User_ID) {
        const userRef = doc(db, 'Users', user.User_ID);
        try {
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as UserData;
            setUserData(data);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          Alert.alert('Error', 'Failed to load profile data');
        }
      }
    };
    
    fetchUserData();
  }, [user]);

  return (
    <View style={styles.container}>
      <Header title="Profile"  />
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => router.push('/profile/MyProfile_edit')}
      >
        <Ionicons name="create-outline" size={35} color="white" />
      </TouchableOpacity>
      
      <ScrollView style={[styles.scrollViewContent, { marginTop: 150 }]}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                user?.Profile_Picture
                  ? { uri: user.Profile_Picture }
                  : require('../../../assets/images/default-avatar.png')
              }
              style={styles.profileImage}
            />
            
            <Text style={styles.name}>
              {user?.First_Name} {user?.Second_name}
            </Text>
            
            <View style={styles.userInfoContainer}>
              <FontAwesome name="envelope" size={16} color={Colors.secondary} />
              <Text style={styles.userInfoText}>
                {user?.email}
              </Text>
            </View>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <FontAwesome name="user" size={20} color={Colors.primary} />
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={styles.infoText}>
                {user?.Description || 'No description added'}
              </Text>
              
              {(userData?.Discord_name || userData?.Steam_name) && (
                <View style={styles.gamingProfiles}>
                  {userData?.Discord_name && (
                    <View style={styles.profileRow}>
                      <Text style={styles.profileLabel}>Discord:</Text>
                      <Text style={styles.profileValue}>{userData.Discord_name}</Text>
                    </View>
                  )}
                  {userData?.Steam_name && (
                    <View style={styles.profileRow}>
                      <Text style={styles.profileLabel}>Steam:</Text>
                      <Text style={styles.profileValue}>{userData.Steam_name}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            <View style={styles.infoSection}>
              <ProfileRow icon="business-outline" label="Department" value={userData?.Department} /> 
              <ProfileRow icon="sparkles-outline" label="Date of Birth" value={userData?.Date_Of_Birth} />
              <ProfileRow icon="mail-outline" label="E-Mail" value={user?.email || ''} />
              <ProfileRow icon="female-outline" label="Gender" value={userData?.Gender} />
              <ProfileRow icon="map-outline" label="Region" value={userData?.Region} />
            </View>
          </View>

          {userData?.role === 'admin' && (
            <TouchableOpacity 
              style={styles.adminButton}
              onPress={() => router.push('/(app)/(admin)/Dashboard')}
            >
              <Text style={styles.editButtonText}>Admin Dashboard</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </ScrollView>
      <UserFooter />
    </View>
  );
}

interface ProfileRowProps {
  icon: string;
  label: string;
  value?: string;
}

const ProfileRow = ({ icon, label, value = '' }: ProfileRowProps) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon as any} size={24} color="#00bfa5" />
    <View style={styles.infoTextContainer}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  profileHeader: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: Colors.text,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  userInfoText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.text,
  },
  infoItem: {
    marginBottom: 10,
    alignItems: 'center',
  },
  infoSection: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginTop: 0,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoTextContainer: {
    marginLeft: 20,
  },
  infoLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 5,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 18,
    color: '#666',
  },
  signOutButton: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
  },
  adminButton: {
    backgroundColor: '#4a5568',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginTop: -35,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: 'white',
    marginTop: 20,
  },
  editButton: {
    position: 'absolute',
    right: 20,
    top: 45,
    padding: 8,
    zIndex: 2000,
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
