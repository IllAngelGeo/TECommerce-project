import React from "react";
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View, Dimensions, } from "react-native";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import NavegacionCliente from "../components/navegacioncliente";
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function Perfil() {
  const [usuario, setUsuario] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });

    return unsubscribe;
  }, []);

  return (
    <SafeAreaView style={estilos.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <ScrollView
        style={estilos.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.scrollContent}
      >        {/* HEADER CON GRADIENTE */}
        <LinearGradient
          colors={['#1a1a1a', '#000000']}
          style={estilos.headerGradient}
        >
          <View style={estilos.header}>
            <Text style={estilos.headerTitle}>Mi perfil</Text>
          </View>
        </LinearGradient>

        {/* PERFIL CON TARJETA ELEVADA */}
        <View style={estilos.profileCard}>
          <View style={estilos.profileSection}>
            <View style={estilos.avatarContainer}>
              <LinearGradient
                colors={['#c0c0c1', '#fafafb']}
                style={estilos.avatarGradient}
              >
                <Ionicons name="person" size={50} color="#00000" />
              </LinearGradient>
            </View>

                <Text style={estilos.userName}> {usuario?.displayName || "Usuario"} </Text>
            <Text style={estilos.userEmail}> {usuario?.email || "Sin correo electrónico"} </Text>
            
             <Pressable onPress={() => router.push( "/cap-presentation/Views/EditarPerfil" ) } >
              <LinearGradient
                colors={['#ededed', '#c2bfbf']}
                style={estilos.editGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="create-outline" size={18} color="#000000" />
                <Text style={estilos.editButtonText}>Editar perfil</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>



        {/* OPCIONES CON DISEÑO MEJORADO */}
        <View style={estilos.optionsContainer}>
          <Text style={estilos.optionsTitle}>Opciones</Text>

          <Pressable
            style={({ pressed }) => [
              estilos.option,
              pressed && estilos.optionPressed,
            ]}
          >
            <View style={[estilos.optionIcon, { backgroundColor: '#6366f120' }]}>
              <Ionicons name="cart-outline" size={22} color="#6366f1" />
            </View>
            <View style={estilos.optionInfo}>
              <Text style={estilos.optionTitle}>Mis pedidos</Text>
              <Text style={estilos.optionDescription}>Consulta tus compras y pedidos</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#555555" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              estilos.option,
              pressed && estilos.optionPressed,
            ]}
          >
            <View style={[estilos.optionIcon, { backgroundColor: '#ec489920' }]}>
              <Ionicons name="heart-outline" size={22} color="#ec4899" />
            </View>
            <View style={estilos.optionInfo}>
              <Text style={estilos.optionTitle}>Mis favoritos</Text>
              <Text style={estilos.optionDescription}>Productos que guardaste</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#555555" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              estilos.option,
              pressed && estilos.optionPressed,
            ]}
          >
            <View style={[estilos.optionIcon, { backgroundColor: '#14b8a620' }]}>
              <Ionicons name="location-outline" size={22} color="#14b8a6" />
            </View>
            <View style={estilos.optionInfo}>
              <Text style={estilos.optionTitle}>Mis direcciones</Text>
              <Text style={estilos.optionDescription}>Administra tus direcciones de envío</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#555555" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              estilos.option,
              pressed && estilos.optionPressed,
            ]}
          >
            <View style={[estilos.optionIcon, { backgroundColor: '#f59e0b20' }]}>
              <Ionicons name="settings-outline" size={22} color="#f59e0b" />
            </View>
            <View style={estilos.optionInfo}>
              <Text style={estilos.optionTitle}>Configuración</Text>
              <Text style={estilos.optionDescription}>Preferencias y configuración de cuenta</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#555555" />
          </Pressable>
        </View>

        {/* CERRAR SESIÓN CON DISEÑO MEJORADO */}
        <Pressable
          style={({ pressed }) => [
            estilos.logoutButton,
            pressed && estilos.buttonPressed,
          ]}
        >
          <View style={estilos.logoutIconContainer}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          </View>
          <Text style={estilos.logoutText}>Cerrar sesión</Text>
          <View style={estilos.logoutSpacer} />
        </Pressable>

        <Text style={estilos.version}>TeCommerce v1.0.0</Text>
        <View style={estilos.footerSpace} />
      </ScrollView>

      {/* NAVEGACIÓN */}
      <NavegacionCliente seccionActual="perfil" />
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scroll: {
    flex: 1,
    backgroundColor: "#000000",
  },
  scrollContent: {
    paddingBottom: 140,
  },

  // HEADER
  headerGradient: {
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  header: {
    height: 90,
    top: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  // PERFIL
  profileCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: '#0a0a0a',
    borderWidth: 1,
    borderColor: '#1a1a1a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: '#000000',
  },
 

  userName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    letterSpacing: 0.3,
  },
  userEmail: {
    color: "#888888",
    fontSize: 14,
    marginTop: 4,
  },
  
  editButton: {
    marginTop: 20,
    overflow: 'hidden',
    borderRadius: 25,
  },
  editGradient: {
    top: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  editButtonText: {
    color: "#00000",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  // ESTADÍSTICAS
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1a1a1a',
    paddingVertical: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888888',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#1a1a1a',
  },

  // OPCIONES
  optionsContainer: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  optionsTitle: {
    color: '#888888',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0a0a0a",
    borderWidth: 1,
    borderColor: "#1a1a1a",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  optionPressed: {
    backgroundColor: "#151515",
    transform: [{ scale: 0.98 }],
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  optionDescription: {
    color: "#777777",
    fontSize: 12,
    marginTop: 2,
  },

  // CERRAR SESIÓN
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 20,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2a1a1a',
    backgroundColor: '#0a0a0a',
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  logoutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#ef444420',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  logoutSpacer: {
    width: 40,
  },

  // FOOTER
  version: {
    color: "#444444",
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
  },
  footerSpace: {
    height: 30,
  },
});