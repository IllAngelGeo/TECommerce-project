import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {ActivityIndicator,Pressable,StyleSheet,Text,TextInput,useColorScheme,View,KeyboardAvoidingView,Platform,TouchableWithoutFeedback,Keyboard,Alert,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Imagen } from "../components/Imagen";

export default function DevolverLogin() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [mensaje, setMensaje] = useState("");


  
  const handleLogin = async () => {
    setMensaje("");

    if (!usuario || !password) {
      setMensaje("Completa todos los campos");
      return;
    }

    if (password.length < 6) {
      setMensaje("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setCargando(true);

    setTimeout(() => {
      setCargando(false);
      router.push("./");
    }, 1800);
  };

  const handleGoogleLogin = () => {
    setCargandoGoogle(true);
    setMensaje("");

    setTimeout(() => {
      setCargandoGoogle(false);
      Alert.alert("Google Sign In", "Funcionalidad en desarrollo");
    }, 1500);
  };


  const handleForgotPassword = () => {
    Alert.alert(
      "Recuperar contraseña",
      "Se enviará un enlace a tu correo electrónico",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient
          colors={["#000000", "#1A1A1A", "#2D2D2D"]}
          style={styles.container}
        >
          <View style={styles.content}>
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
                <Imagen
                  width={80}
                  height={80}
                  source={require("../../../assets/images/logo_ecommerce.png")}
                />
              </View>
            </View>

            <Text style={styles.titulo}>TeCommerce</Text>
            <Text style={styles.subtitulo}>
              Iniciar sesión
            </Text>

            {/* Campos de entrada */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Usuario o correo electrónico"
                placeholderTextColor="#6B7280"
                value={usuario}
                onChangeText={setUsuario}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                placeholderTextColor="#6B7280"
                secureTextEntry={!verPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setVerPassword(!verPassword)}>
                <Ionicons
                  name={verPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color="#9CA3AF"
                />
              </Pressable>
            </View>

            {/* Olvidé contraseña */}
            <Pressable onPress={handleForgotPassword} style={styles.forgotButton}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            {/* Botón Iniciar Sesión */}
            <Pressable
              style={[styles.boton, cargando && styles.botonDisabled]}
              onPress={handleLogin}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.textoBoton}>Iniciar sesión</Text>
                </>
              )}
            </Pressable>

            {/* Separador */}
            <View style={styles.separator}>
              <View style={styles.line} />
              <Text style={styles.separatorText}>O continúa con</Text>
              <View style={styles.line} />
            </View>

            {/* Botón Google */}
           
           <Pressable style={styles.googleButton} onPress={handleGoogleLogin} disabled={cargandoGoogle}>
  {cargandoGoogle ? (
    <ActivityIndicator color="#4285F4" />
  ) : (
    <>
      <Imagen source={require('../../../assets/images/icono_google.png')} style={{ width: 20, height: 20 }} />
      <Text style={styles.googleText}>Continuar con Google</Text>
    </>
  )}
</Pressable>

{/* Registro */}
<View style={styles.registerContainer}>
  <Text style={styles.registerText}>¿No tienes cuenta? </Text>
  <Pressable onPress={() => router.replace("/cap-presentation/Views/Registrate")}>
    <Text style={styles.registerLink}>Regístrate ahora</Text>
  </Pressable>
</View>

            {/* Mensaje de error */}
            {!!mensaje && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.error}>{mensaje}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    paddingVertical: 20,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },

  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  titulo: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },

  subtitulo: {
    fontSize: 14,
    color: "#FFFFFF",
    marginBottom: 40,
    textAlign: "center",
    fontWeight: "bold",

  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: "#FFFFFF",
    marginLeft: 10,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },

  forgotText: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "500",
  },

  boton: {
    width: "100%",
    height: 55,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    gap: 10,
  },

  botonDisabled: {
    opacity: 0.7,
  },

  textoBoton: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },

  separator: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },

  separatorText: {
    color: "#6B7280",
    paddingHorizontal: 10,
    fontSize: 12,
  },

  googleButton: {
    width: "100%",
    height: 55,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },

  googleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },

  registerText: {
    color: "#9CA3AF",
    fontSize: 14,
  },

  registerLink: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
  },

  error: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "500",
  },
});