import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase_backup';
import { AuthContext } from '../../_layout'; 
import UserFooter from '../../../components/footer';

const MyProfileScreen: React.FC = () => {
  const { user, signOut } = useContext(AuthContext); 
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(); 
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
      console.error('Logout failed:', error.message);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.email) {
          const userRef = doc(db, 'Users', user.email); 
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            Alert.alert('Error', 'No user data found.');
          }
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch user data.');
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>User data not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          {userData.Profile_Picture ? (
            <Image
              source={{ uri: userData.Profile_Picture }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                {userData.First_Name?.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.nameText}>
          {userData.First_Name} {userData.Second_Name}
        </Text>
        <Text style={styles.emailText}>{userData.email}</Text>
        <Text style={styles.descriptionText}>
          {userData.Description || 'No description provided.'}
        </Text>
      </View>

      
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        {Object.entries(userData).map(([key, value]) => {
          if (
            ['First_Name', 'Second_Name', 'email', 'Profile_Picture', 'Description'].includes(
              key
            )
          ) {
            return null;
          }

          return (
            <View style={styles.infoRow} key={key}>
              <Text style={styles.infoKey}>{key.replace(/_/g, ' ')}:</Text>
              <Text style={styles.infoValue}>
                {typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value)}
              </Text>
            </View>
          );
        })}
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.redactionButton} onPress={handleLogout}>
          <Text style={styles.actionButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <UserFooter />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  profileImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#03A9F4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#777',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
  },
  infoContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoKey: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#555',
    flex: 2,
  },
  actionsContainer: {
    marginTop: 30,
  },
  redactionButton: {
    backgroundColor: 'red',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
  },
});

export default MyProfileScreen;
