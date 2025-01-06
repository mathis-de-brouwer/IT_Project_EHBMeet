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
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase';

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
            setUserData(userSnap.data());
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
      if (user?.email) {
        const userRef = doc(db, 'Users', user.email);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        }
      }
    };
    fetchUserData();
  }, [user]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.profileHeader}>
        <TouchableOpacity
    style={styles.goBackButton}
    onPress={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
  >
    <Ionicons name="arrow-back" size={28} color="white" />
  </TouchableOpacity>

  <Text style={styles.headerTitle}>Profile</Text>

  <TouchableOpacity
    style={styles.editButton}
    onPress={() => router.push('/profile/MyProfile_edit')}
  >
    <Ionicons name="create-outline" size={28} color="white" />
  </TouchableOpacity>
</LinearGradient>



        {/* Body Section */}
        <View style={styles.body}>
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

          {/* User Information Section */}
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
      </ScrollView>
      <UserFooter />
    </View>
  );}

// Component for Rows
interface ProfileRowProps {
  icon: string;
  label: string;
  value: string;
}

const ProfileRow = ({ icon, label, value }: ProfileRowProps) => (
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
    paddingBottom: 30,
  },
  header: {
    height: 160,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    position: 'relative',
  },
  
  headerTitle: {
    fontSize: 35,
    fontWeight: 'bold',
    color: 'white',
    position: 'absolute',  // Allow full control of positioning
    top: '50%',  // Center vertically
    left: 0,
    right: 0,
    textAlign: 'center',  // Center text horizontally
   
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
  profileName: {
    fontSize: 25,
    fontWeight: 'light',
    color: '#333',
    marginTop: 10,
  },
  editButton: {
    position: 'absolute',
    top: 60,
    right: 30,
  },
  goBackButton: {
    position: 'absolute',
    top: 60,
    left: 30,
  },
  body: {
    marginHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    marginTop: 20,
    elevation: 3,
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
});
