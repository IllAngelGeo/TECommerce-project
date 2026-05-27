import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#000000' }}>
        <StatusBar style="light" backgroundColor="#000000" />
        <Slot />
      </View>
    </SafeAreaProvider>
  );
}