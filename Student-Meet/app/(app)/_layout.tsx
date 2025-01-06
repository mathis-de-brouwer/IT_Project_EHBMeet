import * as React from 'react';
import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        // Prevent going back to auth screens
        gestureEnabled: false,
        // Add animation
        animation: 'slide_from_right',
      }} 
    />
  );
} 