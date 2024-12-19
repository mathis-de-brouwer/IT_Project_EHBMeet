import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { UserData } from './types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple auth context to track authentication state
export const AuthContext = React.createContext({
  signIn: (userData: UserData) => {},
  signOut: () => {},
  user: null as UserData | null,
});

// Auth provider component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const rootSegment = useSegments()[0];
  const router = useRouter();

  useEffect(() => {
    // Check for stored user data when app loads
    const loadStoredUser = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem('userData');
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error reading stored user data:", error);
      }
    };

    loadStoredUser();
  }, []);

  useEffect(() => {
    if (!user && rootSegment !== "(auth)") {
      router.replace("/login");
    } else if (user && rootSegment === "(auth)") {
      router.replace("/home");
    }
  }, [user, rootSegment]);

  const signIn = async (userData: UserData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error storing user data:", error);
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error("Error clearing stored user data:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
} 