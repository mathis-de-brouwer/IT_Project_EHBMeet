import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import your screens
import Home from '../app/home';
import Agenda from '../app/agenda';
import ActivityAdd from '../app/activity_add';
import MyProfile from '../app/(app)/profile/MyProfile';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          // Define icons for each route
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Agenda':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Add Activity':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'My Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help'; // Fallback icon
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00bfa5',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Hides the header for tab screens
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Agenda" component={Agenda} />
      <Tab.Screen name="Add Activity" component={ActivityAdd} />
      <Tab.Screen name="My Profile" component={MyProfile} />
    </Tab.Navigator>
  );
};

export default MainTabs;