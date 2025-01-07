import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '../constants/Colors';
import { useRouter } from 'expo-router';

interface AdminHeaderProps {
  title: string;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, showSearch = false, onSearch }) => {
  const router = useRouter();
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <>
      <LinearGradient 
        colors={['#44c9ea', 'white']} 
        style={styles.header}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome name="chevron-left" size={24} color="#333" />
          </TouchableOpacity>
          
          <Text style={styles.title}>{title}</Text>
          
          {showSearch && (
            <View style={styles.searchContainer}>
              {showSearchBar && (
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  value={searchQuery}
                  onChangeText={handleSearch}
                  autoFocus
                />
              )}
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={() => setShowSearchBar(!showSearchBar)}
              >
                <FontAwesome name={showSearchBar ? "times" : "search"} size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </LinearGradient>
      <View style={styles.contentSpacer} />
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 150,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    flexDirection: 'row',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Poppins',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 20,
    top: 20,
  },
  searchButton: {
    marginLeft: 10,
  },
  searchInput: {
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  contentSpacer: {
    height: 150,
  },
});

export default AdminHeader;