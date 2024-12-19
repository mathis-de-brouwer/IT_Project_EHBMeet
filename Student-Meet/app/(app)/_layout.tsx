import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
<<<<<<< HEAD
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
=======
    <Stack
      screenOptions={{
        headerShown: false, // Verberg de standaard header voor alle pagina's
      }}
    />
  );
}
>>>>>>> parent of 7aecca93 (Merge branch 'main' into Frond_end)
