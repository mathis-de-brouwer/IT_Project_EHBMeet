import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AuthContext } from '../../_layout';
import UserFooter from '../../../components/footer';
import Colors from '../../../constants/Colors';
import { useRouter } from 'expo-router';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { UserData } from '../../types/user';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase_backup';

export default function MyProfileScreen() {
  const { user, signOut } = useContext(AuthContext);
  const router = useRouter();
  const [profileData, setProfileData] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user?.User_ID) return;
      
      try {
        const userDoc = await getDoc(doc(db, "Users", user.User_ID));
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          console.log("Profile Data:", data);
          setProfileData(data);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Sign Out',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/(auth)/login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
          <Image
            source={
              profileData?.Profile_Picture
                ? { uri: profileData.Profile_Picture }
                : require('../../../assets/images/default-avatar.png')
            }
            style={styles.profileImage}
          />
          
          <View style={styles.userInfoContainer}>
            <FontAwesome name="envelope" size={16} color={Colors.secondary} />
            <Text style={styles.userInfoText}>{profileData?.email}</Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <FontAwesome name="user" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Description</Text>
            <Text style={styles.infoText}>
              {profileData?.Description || 'No description added'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <FontAwesome name="gamepad" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Steam Username</Text>
            <Text style={styles.infoText}>
              {profileData?.Steam_name || 'Not provided'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <FontAwesome5 name="discord" size={20} color={Colors.primary} />
            <Text style={styles.infoLabel}>Discord Username</Text>
            <Text style={styles.infoText}>
              {profileData?.Discord_name || 'Not provided'}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => router.push('/profile/MyProfile_edit')}
        >
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.notificationsButton}
          onPress={() => router.push('/profile/notifications')}
        >
          <Text style={styles.editButtonText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
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
  content: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  infoItem: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 5,
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    color: Colors.text,
  },
  editButton: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
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
  signOutButton: {
    backgroundColor: Colors.error,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  signOutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 10,
  },
  userInfoText: {
    fontSize: 16,
    color: Colors.secondary,
    marginLeft: 8,
  },
});
