import React from "react";
import {
  View,
  Pressable,
  StyleSheet,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface NavegacionClienteProps {
  seccionActual: "inicio" | "productos" | "carrito" | "perfil";
}

export default function NavegacionCliente({
  seccionActual,
}: NavegacionClienteProps) {

  const navegar = (ruta: string) => {
    router.replace(ruta as any);
  };

  return (
    <View style={styles.contenedor}>

      {/* INICIO */}
      <Pressable
        style={[
          styles.boton,
          seccionActual === "inicio" && styles.botonActivo,
        ]}
        onPress={() =>
          navegar("/cap-presentation/Views/Home")
        }
      >
        <Ionicons
          name="home-outline"
          size={23}
          color={
            seccionActual === "inicio"
              ? "#000000"
              : "#FFFFFF"
          }
        />

        {seccionActual === "inicio" && (
          <Text style={styles.textoActivo}>
            Inicio
          </Text>
        )}
      </Pressable>

      {/* PRODUCTOS */}
      <Pressable
        style={[
          styles.boton,
          seccionActual === "productos" && styles.botonActivo,
        ]}
        onPress={() =>
          navegar("/cap-presentation/Views/Productos")
        }
      >
        <Ionicons
          name="grid-outline"
          size={23}
          color={
            seccionActual === "productos"
              ? "#000000"
              : "#FFFFFF"
          }
        />

        {seccionActual === "productos" && (
          <Text style={styles.textoActivo}>
            Productos
          </Text>
        )}
      </Pressable>

      {/* CARRITO */}
      <Pressable
        style={[
          styles.boton,
          seccionActual === "carrito" && styles.botonActivo,
        ]}
        onPress={() =>
          navegar("/cap-presentation/Views/Carrito")
        }
      >
        <Ionicons
          name="cart-outline"
          size={23}
          color={
            seccionActual === "carrito"
              ? "#000000"
              : "#FFFFFF"
          }
        />

        {seccionActual === "carrito" && (
          <Text style={styles.textoActivo}>
            Carrito
          </Text>
        )}
      </Pressable>

      {/* PERFIL */}
      <Pressable style={[ styles.boton,
          seccionActual === "perfil" && styles.botonActivo,
        ]}
        onPress={() =>
          navegar("/cap-presentation/Views/Perfil")
        }
      >
        <Ionicons
          name="person-outline"
          size={23}
          color={
            seccionActual === "perfil"
              ? "#000000"
              : "#FFFFFF"
          }
        />

        {seccionActual === "perfil" && (
          <Text style={styles.textoActivo}>
            Perfil
          </Text>
        )}
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({

  contenedor: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,

    height: 65,

    backgroundColor: "#111111",

    borderRadius: 25,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",

    paddingHorizontal: 8,

    borderWidth: 1,
    borderColor: "#2D2D2D",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 10,

    elevation: 10,

    zIndex: 999,
  },

  boton: {
    height: 48,

    minWidth: 48,

    borderRadius: 20,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 12,

    gap: 6,
  },

  botonActivo: {
    backgroundColor: "#FFFFFF",
  },

  textoActivo: {
    color: "#000000",
    fontSize: 9,
    fontWeight: "bold",
  },

});