import { Stack } from 'expo-router';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Verberg de standaard header voor alle pagina's
      }}
    />
  );
}
