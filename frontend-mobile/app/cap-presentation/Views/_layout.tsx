import { Slot, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  ActivityIndicator,
  View,
} from "react-native";
import {
  useEffect,
  useState,
} from "react";
import {
  auth,
} from "../../firebase/firebase";
import {
  onAuthStateChanged,
} from "firebase/auth";

export default function ViewsLayout() {
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/");
      }

      setCargando(false);
    });

    return unsubscribe;
  }, []);

  if (cargando) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
        />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View
        style={{
          flex: 1,
          backgroundColor: "#000000",
        }}
      >
        <StatusBar
          style="light"
          backgroundColor="#000000"
        />
        <Slot />
      </View>
    </SafeAreaProvider>
  );
}