import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { useEffect, useState } from 'react';

import { CartProvider } from './context/CartContext';
import Splash from './Splash';
import * as SplashScreen from 'expo-splash-screen';

export default function RootLayout() {


  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);


    return () => clearTimeout(timer);

  }, []);



  if (loading) {
    return <Splash />;
  }



  return (
    <SafeAreaProvider>

      <CartProvider>

        <View style={{ flex: 1, backgroundColor: '#000000' }}>

          <StatusBar
            style="light"
            backgroundColor="#000000"
          />

          <Slot />

        </View>

      </CartProvider>

    </SafeAreaProvider>
  );
}