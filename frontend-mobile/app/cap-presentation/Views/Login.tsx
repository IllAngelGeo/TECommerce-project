
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {ActivityIndicator,Pressable,StyleSheet,Text,TextInput,useColorScheme,View,KeyboardAvoidingView,Platform,TouchableWithoutFeedback,Keyboard,Alert,} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Imagen } from "../components/Imagen";
import {signInWithEmailAndPassword } from "firebase/auth"; 
import {auth} from "../../firebase/firebase";
import { useEffect } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider,signInWithCredential,} from "firebase/auth";
import { sendPasswordResetEmail } from "firebase/auth";

WebBrowser.maybeCompleteAuthSession();


export default function DevolverLogin() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [mensaje, setMensaje] = useState("");


  const [request, response, promptAsync] =
  Google.useAuthRequest({
    clientId:
      "477383599734-gf4e2hh44f04jda9idmhrbgbf90snl4a.apps.googleusercontent.com",

    androidClientId:
      "477383599734-ag144p058hd7jaiedium21jelha6rbk2.apps.googleusercontent.com",
  });

useEffect(() => {

  const autenticarGoogle = async () => {

    if (response?.type === "success") {

      try {

const idToken =
  response.authentication?.idToken ||
  response.params?.id_token;

        if (!idToken) {

          setMensaje(
            "No se obtuvo token de Google"
          );

          return;
        }

        const credential =
          GoogleAuthProvider.credential(
            idToken
          );

        await signInWithCredential(
          auth,
          credential
        );

        router.replace(
          "/cap-presentation/Views/Home"
        );

      } catch (error) {

        console.log(error);

        setMensaje(
          "Error al iniciar sesión con Google"
        );

      } finally {

        setCargandoGoogle(false);

      }
    }
  };

  autenticarGoogle();

}, [response]);
 const handleLogin = async () => {

  setMensaje("");

  if (!usuario || !password) {
    setMensaje("Completa todos los campos");
    return;
  }

  try {

    setCargando(true);

    await signInWithEmailAndPassword(
      auth,
      usuario,
      password
    );

    router.replace("/cap-presentation/Views/Home");

  } catch (error: any) {

    console.log(error);

    if (error.code === "auth/user-not-found") {
      setMensaje("Usuario no encontrado");
    } else if (
      error.code === "auth/wrong-password"
    ) {
      setMensaje("Contraseña incorrecta");
    } else if (
      error.code === "auth/invalid-credential"
    ) {
      setMensaje("Credenciales inválidas");
    } else {
      setMensaje("Error al iniciar sesión");
    }

  } finally {
    setCargando(false);
  }
};

const handleGoogleLogin = async () => {

  setCargandoGoogle(true);
  setMensaje("");

  try {

    await promptAsync();

  } catch (error) {

    console.log(error);

    setMensaje("Error con Google");

    setCargandoGoogle(false);
  }
};

const handleForgotPassword = async () => {
  if (!usuario) {
    setMensaje("Ingresa tu correo primero");
    return;
  }

  try {
    setMensaje("");

    await sendPasswordResetEmail(auth, usuario);

    Alert.alert(
      "Correo enviado",
      "Revisa tu bandeja para restablecer tu contraseña"
    );

  } catch (error: any) {
    console.log(error);

    if (error.code === "auth/user-not-found") {
      setMensaje("No existe una cuenta con ese correo");
    } else {
      setMensaje("Error al enviar el correo");
    }
  }
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
            <View style={styles.logoContainer}>
              <View style={styles.logoWrapper}>
              <Imagen source={{uri: "https://res.cloudinary.com/demobew9m/image/upload/v1782204337/logo_tecommerce_rzx7yp.png"}}style={{ width: 80, height: 80 }}/>
       
              </View>
            </View>
            <Text style={styles.titulo}>TeCommerce</Text>
            <Text style={styles.subtitulo}>
              Iniciar sesión
            </Text>

            {/* Campos de entrada */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" />
              <TextInput style={styles.input} placeholder="Usuario o correo electrónico" placeholderTextColor="#6B7280" value={usuario} onChangeText={setUsuario} autoCapitalize="none" autoCorrect={false} />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
              <TextInput style={styles.input} placeholder="Contraseña" placeholderTextColor="#6B7280" secureTextEntry={!verPassword} value={password} onChangeText={setPassword} />
              <Pressable onPress={() => setVerPassword(!verPassword)}>
                <Ionicons name={verPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF"/>
              </Pressable>
            </View>

            {/* Olvidé contraseña */}
            <Pressable onPress={handleForgotPassword} style={styles.forgotButton}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            {/* Botón Iniciar Sesión */}
            <Pressable style={[styles.boton, cargando && styles.botonDisabled]} onPress={handleLogin} disabled={cargando}>
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
     <Imagen source={{uri: "https://res.cloudinary.com/demobew9m/image/upload/v1782204067/icono_google_uktsac.png",}}style={{ width: 20, height: 20 }}/>
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