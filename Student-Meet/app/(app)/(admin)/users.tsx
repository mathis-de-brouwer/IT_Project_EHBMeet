import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput} from 'react-native';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import Colors from '../../../constants/Colors';
import { UserData, UserRole } from '../../../app/types/user';
import AdminHeader from '../../../components/AdminHeader';
import UserFooter from '../../../components/footer';
import { FontAwesome } from '@expo/vector-icons';

export default function UsersScreen() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Restrict available roles - remove 'admin' from general selection
  const standardRoles: UserRole[] = ['student', 'ehb', 'enigma'];

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      // If trying to set admin role, show confirmation dialog with warning
      if (newRole === 'admin') {
        Alert.alert(
          'Warning - Security Sensitive Action',
          'Are you sure you want to grant ADMIN privileges to this user? This is a security-sensitive action that cannot be easily undone.',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Confirm',
              style: 'destructive',
              onPress: async () => {
                // Second confirmation for admin role
                Alert.alert(
                  'Final Confirmation Required',
                  'This will grant full administrative access to this user. Please confirm this is intended.',
                  [
                    {
                      text: 'Cancel',
                      style: 'cancel'
                    },
                    {
                      text: 'Grant Admin Access',
                      style: 'destructive',
                      onPress: async () => {
                        await updateUserRole(userId, newRole);
                      }
                    }
                  ]
                );
              }
            }
          ]
        );
      } else {
        // For non-admin roles, show a simple confirmation
        Alert.alert(
          'Confirm Role Change',
          `Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Confirm',
              onPress: async () => {
                await updateUserRole(userId, newRole);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error in role change handler:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const userRef = doc(db, 'Users', userId);
      await updateDoc(userRef, { role: newRole });
      
      // Update local state
      setUsers(currentUsers => 
        currentUsers.map(user => 
          user.User_ID === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role');
    }
  };

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

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredUsers = users.filter(user =>
    user.First_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.Second_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <View style={styles.container}>
      <AdminHeader 
        title="Manage Users" 
        showSearch={false} 
        onSearch={handleSearch}
      />
      <ScrollView style={styles.scrollView}>
        <View style={styles.headerSpacer} />
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor={Colors.placeholder}
          />
          <TouchableOpacity style={styles.searchButton}>
            <FontAwesome name="search" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.totalCount}>Total Users: {users.length}</Text>
        {filteredUsers.map((user) => (
          <View key={user.User_ID} style={styles.userCard}>
            <Text style={styles.userName}>{user.First_Name} {user.Second_name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.roleContainer}>
              {standardRoles.map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleButton,
                    user.role === role && styles.roleButtonActive
                  ]}
                  onPress={() => handleRoleChange(user.User_ID, role)}
                >
                  <Text style={[
                    styles.roleButtonText,
                    user.role === role && styles.roleButtonTextActive
                  ]}>
                    {role.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {/* Admin role handling */}
              {user.role === 'admin' ? (
                <TouchableOpacity
                  style={[styles.roleButton, styles.roleButtonActive, styles.adminButton]}
                  onPress={() => Alert.alert('Admin Role', 'This user has administrative privileges.')}
                >
                  <Text style={[styles.roleButtonText, styles.roleButtonTextActive]}>
                    ADMIN
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.roleButton, styles.promoteToAdminButton]}
                  onPress={() => handleRoleChange(user.User_ID, 'admin')}
                >
                  <Text style={styles.promoteToAdminText}>
                    PROMOTE TO ADMIN
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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
    marginTop: -20,
  },
  scrollViewContent: {
    padding: 20,
    paddingTop: 0,
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
  roleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  roleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  roleButtonActive: {
    backgroundColor: Colors.secondary,
  },
  roleButtonText: {
    fontSize: 12,
    color: Colors.secondary,
  },
  roleButtonTextActive: {
    color: 'white',
  },
  adminButton: {
    backgroundColor: Colors.error,
  },
  promoteToAdminButton: {
    backgroundColor: 'white',
    borderColor: Colors.error,
    borderWidth: 1,
  },
  promoteToAdminText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerSpacer: {
    height: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    marginHorizontal: 10,
    marginBottom: 20,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 15,
    fontSize: 16,
    color: Colors.text,
  },
  searchButton: {
    padding: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
});