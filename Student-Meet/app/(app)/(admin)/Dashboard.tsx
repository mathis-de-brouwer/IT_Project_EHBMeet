import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '../../../constants/Colors';
import UserFooter from '../../../components/footer';
import AdminHeader from '../../../components/AdminHeader';

export default function AdminDashboard() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AdminHeader title="Admin Dashboard" showSearch={false} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/(app)/(admin)/users')}
        >
          <Text style={styles.cardTitle}>Manage Users</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/(app)/(admin)/events')}
        >
          <Text style={styles.cardTitle}>Manage Events</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    paddingTop: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: Colors.text,
  },
  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
}); 