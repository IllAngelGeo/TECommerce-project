import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { updateProfile } from "firebase/auth";
import { auth } from "../../../firebase/firebase";
import { API_URL } from "../../constants/api_url";

export default function EditarPerfil() {
  const usuario = auth.currentUser;

  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [telefono, setTelefono] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajeTipo, setMensajeTipo] = useState("error");

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        if (!usuario) {
          setMensaje("No hay un usuario autenticado");
          setMensajeTipo("error");
          return;
        }

        const response = await fetch(
          `${API_URL}/usuarios/firebase/${usuario.uid}`
        );

        const data = await response.json();

        if (!response.ok) {
          setMensaje(data.error || "No se pudieron cargar los datos");
          setMensajeTipo("error");
          return;
        }

        setNombre(data.nombre || "");
        setApellidoPaterno(data.apellido_paterno || "");
        setApellidoMaterno(data.apellido_materno || "");
        setTelefono(data.telefono || "");

      } catch (error) {
        setMensaje("No se pudo conectar con el servidor");
        setMensajeTipo("error");
      } finally {
        setCargando(false);
      }
    };

    cargarUsuario();
  }, []);

  const guardarCambios = async () => {
    if (!nombre.trim() || !apellidoPaterno.trim() || 
        !apellidoMaterno.trim() || !telefono.trim()) {
      setMensaje("Completa todos los campos");
      setMensajeTipo("error");
      return;
    }

    try {
      setGuardando(true);
      setMensaje("");

      if (!usuario) {
        setMensaje("No hay un usuario autenticado");
        setMensajeTipo("error");
        return;
      }

      const response = await fetch(
        `${API_URL}/usuarios/firebase/${usuario.uid}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: nombre.trim(),
            apellido_paterno: apellidoPaterno.trim(),
            apellido_materno: apellidoMaterno.trim(),
            telefono: telefono.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMensaje(data.error || "No se pudieron guardar los cambios");
        setMensajeTipo("error");
        return;
      }

      const nombreCompleto = 
        `${nombre.trim()} ${apellidoPaterno.trim()} ${apellidoMaterno.trim()}`;

      await updateProfile(usuario, {
        displayName: nombreCompleto,
      });

      setMensaje("¡Perfil actualizado exitosamente!");
      setMensajeTipo("success");

      setTimeout(() => {
        router.back();
      }, 1500);

    } catch (error) {
      setMensaje("No se pudo actualizar el perfil");
      setMensajeTipo("error");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex}
      >
        <ScrollView 
          style={styles.container} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.headerTitle}>Editar perfil</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* CONTENIDO */}
          <View style={styles.content}>
            {/* AVATAR */}
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={55} color="#000000" />
              </View>

            </View>


            {/* CAMPOS DEL FORMULARIO */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="person-outline" size={18} color="#888888" />
                  <Text style={styles.label}>Nombre</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Tu nombre"
                  placeholderTextColor="#555555"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="people-outline" size={18} color="#888888" />
                  <Text style={styles.label}>Apellido paterno</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={apellidoPaterno}
                  onChangeText={setApellidoPaterno}
                  placeholder="Apellido paterno"
                  placeholderTextColor="#555555"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="people-outline" size={18} color="#888888" />
                  <Text style={styles.label}>Apellido materno</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={apellidoMaterno}
                  onChangeText={setApellidoMaterno}
                  placeholder="Apellido materno"
                  placeholderTextColor="#555555"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="call-outline" size={18} color="#888888" />
                  <Text style={styles.label}>Teléfono</Text>
                </View>
                <TextInput
                  style={styles.input}
                  value={telefono}
                  onChangeText={setTelefono}
                  placeholder="Número de teléfono"
                  placeholderTextColor="#555555"
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.inputLabelContainer}>
                  <Ionicons name="mail-outline" size={18} color="#888888" />
                  <Text style={styles.label}>Correo electrónico</Text>
                </View>
                <View style={styles.inputDisabled}>
                  <Text style={styles.email}>
                    {usuario?.email || "Sin correo electrónico"}
                  </Text>
                  <Ionicons name="checkmark-circle" size={18} color="#888888" />
                </View>
              </View>
            </View>

            {/* MENSAJE */}
            {!!mensaje && (
              <View style={[
                styles.messageContainer,
                mensajeTipo === 'success' && styles.messageSuccess
              ]}>
                <Ionicons 
                  name={mensajeTipo === 'success' ? "checkmark-circle" : "alert-circle"} 
                  size={20} 
                  color={mensajeTipo === 'success' ? "#22c55e" : "#EF4444"} 
                />
                <Text style={[
                  styles.messageText,
                  mensajeTipo === 'success' && styles.messageTextSuccess
                ]}>
                  {mensaje}
                </Text>
              </View>
            )}

            {/* BOTÓN GUARDAR */}
            <Pressable
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.buttonPressed,
                guardando && styles.buttonDisabled,
              ]}
              onPress={guardarCambios}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color="#000000" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color="#000000" />
                  <Text style={styles.saveText}>Guardar cambios</Text>
                </>
              )}
            </Pressable>

            {/* BOTÓN CANCELAR */}
            <Pressable
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000000",
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    paddingBottom: 50,
  },

  // HEADER
  header: {
    top: 20,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
  },

  // CONTENIDO
  content: {
    paddingHorizontal: 20,
    paddingTop: 25,
  },

  // AVATAR
  avatarContainer: {
    alignSelf: "center",
    position: 'relative',
    marginBottom: 8,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: '#333333',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  // FORMULARIO
  formContainer: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  label: {
    color: "#AAAAAA",
    fontSize: 13,
    fontWeight: "600",
  },

  input: {
    height: 50,
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#1A1A1A",
    borderRadius: 12,
    paddingHorizontal: 15,
    color: "#FFFFFF",
    fontSize: 15,
  },

  inputDisabled: {
    height: 50,
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#1A1A1A",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  email: {
    color: "#AAAAAA",
    fontSize: 15,
  },

  // MENSAJE
  messageContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#1a0a0a',
    borderWidth: 1,
    borderColor: '#2a1a1a',
    gap: 8,
  },
  messageSuccess: {
    backgroundColor: '#0a1a0a',
    borderColor: '#1a2a1a',
  },
  messageText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "500",
  },
  messageTextSuccess: {
    color: "#22c55e",
  },

  // BOTÓN GUARDAR
  saveButton: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginTop: 25,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveText: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
  },

  // BOTÓN CANCELAR
  cancelButton: {
    height: 44,
    borderRadius: 12,
    marginTop: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelText: {
    color: "#777777",
    fontSize: 15,
    fontWeight: "500",
  },

  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },

  // LOADING
  loadingContainer: {
    flex: 1,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#888888",
    fontSize: 14,
    marginTop: 15,
  },
});