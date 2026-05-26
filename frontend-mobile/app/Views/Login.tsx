import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import { Imagen } from "../../components/Imagen";

export default function DevolverLogin() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState("");

  const colorScheme = useColorScheme();

  const gradientColors: [string, string] =
    colorScheme === "dark"
      ? ["#0F172A", "#1E3A8A"]
      : ["#111827", "#374151"];

  const Login = async () => {
    setMensaje("");

    if (!usuario || !password) {
      setMensaje("Completa todos los campos");
      return;
    }

    setCargando(true);

    setTimeout(() => {
      setCargando(false);
      router.push("/Views/Home");
    }, 1800);
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <View style={styles.card}>
        <Imagen
          width={100}
          height={100}
          source={require("../../assets/images/favicon.png")}
        />

        <Text style={styles.titulo}>Bienvenido</Text>
        <Text style={styles.subtitulo}>Inicia sesión para continuar</Text>

        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor="#94A3B8"
          value={usuario}
          onChangeText={setUsuario}
        />

        <View style={styles.passwordBox}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Contraseña"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!verPassword}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable onPress={() => setVerPassword(!verPassword)}>
            <Text style={styles.toggle}>
              {verPassword ? "Ocultar" : "Mostrar"}
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.boton}
          onPress={Login}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.textoBoton}>Iniciar sesión</Text>
          )}
        </Pressable>

        <Pressable style={styles.google}>
          <Text style={styles.googleText}>Continuar con Google</Text>
        </Pressable>

        {!!mensaje && (
          <Text style={styles.error}>{mensaje}</Text>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 25,
  },

  card: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 25,
    padding: 30,
    alignItems: "center",
    backdropFilter: "blur(20px)",
  },

  titulo: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    marginTop: 15,
  },

  subtitulo: {
    color: "#CBD5E1",
    marginBottom: 30,
  },

  input: {
    width: "100%",
    height: 55,
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  passwordBox: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  passwordInput: {
    flex: 1,
    height: 55,
    fontSize: 16,
  },

  toggle: {
    color: "#2563EB",
    fontWeight: "600",
  },

  boton: {
    width: "100%",
    height: 55,
    backgroundColor: "#2563EB",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  textoBoton: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  google: {
    width: "100%",
    height: 55,
    backgroundColor: "white",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  googleText: {
    fontWeight: "600",
    color: "#111827",
  },

  error: {
    marginTop: 15,
    color: "#FCA5A5",
    fontWeight: "600",
  },
});