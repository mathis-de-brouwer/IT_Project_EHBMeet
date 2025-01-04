import React from 'react';
import { Stack } from 'expo-router';
import { useContext } from 'react';
import { AuthContext } from '../../_layout';
import { Redirect } from 'expo-router';

export default function AdminLayout() {
  const { user } = useContext(AuthContext);

  // Protect admin routes
  if (!user || user.role !== 'admin') {
    return <Redirect href="/(app)/home" />;
  }

  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right',
      }} 
    />
  );
} 