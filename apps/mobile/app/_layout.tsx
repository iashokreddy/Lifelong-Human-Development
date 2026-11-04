import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/theme/colors';

/** Root stack navigator with accessible, titled screens. */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.primaryContrast,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Lifelong Human Development' }} />
        <Stack.Screen name="phases/index" options={{ title: 'Phases' }} />
        <Stack.Screen name="phases/[idOrSlug]" options={{ title: 'Phase' }} />
        <Stack.Screen name="assistant" options={{ title: 'Assistant' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
