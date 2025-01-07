import React, { useContext, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../../_layout';
import UserFooter from '../../../components/footer';
import Colors from '../../../constants/Colors';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { UserData } from '../../types/user';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
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
            
            if (JSON.stringify(data) !== JSON.stringify(user)) {
              await updateDoc(userRef, data as any);
            }
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
      <Header title="Profile" showSearch={false} />
      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => router.push('/profile/MyProfile_edit')}
      >
        <Ionicons name="create-outline" size={24} color={Colors.primary} />
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

// Component for Rows
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
    marginBottom: 15,
    alignItems: 'center',
  },
  infoSection: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginTop: 20,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  notificationsButton: {
    backgroundColor: Colors.secondary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
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
    marginTop: -50,  // Overlaps header
  },
  profileImage: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    borderColor: 'white',
    marginTop: 20,
  },
  editButton: {
    position: 'absolute',
    left: 20,
    top: 45,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'white',
    zIndex: 2000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
