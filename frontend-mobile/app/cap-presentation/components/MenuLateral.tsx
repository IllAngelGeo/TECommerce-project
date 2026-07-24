import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

interface MenuLateralProps {
  visible: boolean;
  onClose: () => void;
  seccionActual: "inicio" | "productos" | "categorias";
}


export default function MenuLateral({
  visible,
  onClose,
  seccionActual,
}: MenuLateralProps) {

  if (!visible) {
    return null;
  }

  const navegar = (ruta: string) => {
    onClose();
    router.push(ruta as any);
  };

  return (
    <View style={estilos.menuOverlay}>

      {/* FONDO OSCURO */}
      <Pressable
        style={estilos.menuFondo}
        onPress={onClose}
      />

      {/* PANEL DEL MENÚ */}
      <View style={estilos.menuPanel}>

        {/* HEADER */}
        <View style={estilos.menuHeader}>

          <View style={estilos.menuLogoContainer}>

            <View style={estilos.menuLogo}>
              <Text style={estilos.menuLogoText}>
                T
              </Text>
            </View>

            <View>
              <Text style={estilos.menuTitulo}>
                TeCommerce
              </Text>

              <Text style={estilos.menuSubtitulo}>
                Tu tienda tecnológica
              </Text>
            </View>

          </View>

          <Pressable
            style={estilos.menuCerrar}
            onPress={onClose}
          >
            <Ionicons
              name="close"
              size={24}
              color="#FFFFFF"
            />
          </Pressable>

        </View>

        {/* SEPARADOR */}
        <View style={estilos.menuSeparador} />

        {/* OPCIONES */}
        <View style={estilos.menuOpciones}>

          {/* INICIO */}
       <Pressable
  style={[
    estilos.menuItem,
    seccionActual === "inicio" &&
      estilos.menuItemActivo,
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

  <Text
    style={[
      estilos.menuItemText,
      seccionActual === "inicio" &&
        estilos.menuItemTextActivo,
    ]}
  >
    Inicio
  </Text>

  <Ionicons
    name="chevron-forward"
    size={18}
    color={
      seccionActual === "inicio"
        ? "#000000"
        : "#555555"
    }
  />
</Pressable>

          {/* PRODUCTOS */}
  <Pressable
  style={[
    estilos.menuItem,
    seccionActual === "productos" &&
      estilos.menuItemActivo,
  ]}
  onPress={() =>
    navegar("/cap-presentation/Views/Productos")
  }
>
  <Ionicons
    name="cube-outline"
    size={23}
    color={
      seccionActual === "productos"
        ? "#000000"
        : "#FFFFFF"
    }
  />

  <Text
    style={[
      estilos.menuItemText,
      seccionActual === "productos" &&
        estilos.menuItemTextActivo,
    ]}
  >
    Productos
  </Text>

  <Ionicons
    name="chevron-forward"
    size={18}
    color={
      seccionActual === "productos"
        ? "#000000"
        : "#555555"
    }
  />
</Pressable>


<Pressable
  style={[
    estilos.menuItem,
    seccionActual === "categorias" &&
      estilos.menuItemActivo,
  ]}
  onPress={() =>
    navegar("/cap-presentation/Views/Categorias")
  }
>
  <Ionicons
    name="grid-outline"
    size={23}
    color={
      seccionActual === "categorias"
        ? "#000000"
        : "#FFFFFF"
    }
  />

  <Text
    style={[
      estilos.menuItemText,
      seccionActual === "categorias" &&
        estilos.menuItemTextActivo,
    ]}
  >
    Categorías
  </Text>

  <Ionicons
    name="chevron-forward"
    size={18}
    color={
      seccionActual === "categorias"
        ? "#000000"
        : "#555555"
    }
  />
</Pressable>


        </View>

        {/* PARTE INFERIOR */}
        <View style={estilos.menuBottom}>

          <Pressable
            style={estilos.logoutButton}
            onPress={() => {
              onClose();
              console.log("Cerrar sesión");
            }}
          >
            <Ionicons
              name="log-out-outline"
              size={23}
              color="#FFFFFF"
            />

            <Text style={estilos.logoutText}>
              Cerrar sesión
            </Text>
          </Pressable>

          <Text style={estilos.versionText}>
            TeCommerce v1.0.0
          </Text>

        </View>

      </View>

    </View>
  );
}

const estilos = StyleSheet.create({

  menuOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    flexDirection: "row",
  },

  menuFondo: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },

  menuPanel: {
    width: 300,
    height: "100%",
    backgroundColor: "#111111",
    borderLeftWidth: 1,
    borderLeftColor: "#2D2D2D",
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 25,
    justifyContent: "space-between",
  },

  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  menuLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  menuLogo: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  menuLogoText: {
    color: "#000000",
    fontSize: 22,
    fontWeight: "bold",
  },

  menuTitulo: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },

  menuSubtitulo: {
    color: "#777777",
    fontSize: 11,
    marginTop: 2,
  },

  menuCerrar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  menuSeparador: {
    height: 1,
    backgroundColor: "#2D2D2D",
    marginTop: 20,
    marginBottom: 15,
  },

  menuOpciones: {
    flex: 1,
  },

  menuItem: {
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 5,
  },

  menuItemActivo: {
  backgroundColor: "#FFFFFF",
},

menuItemTextActivo: {
  color: "#000000",
  fontWeight: "bold",
},

  menuItemText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    marginLeft: 15,
  },

  menuBottom: {
    borderTopWidth: 1,
    borderTopColor: "#2D2D2D",
    paddingTop: 15,
  },

  logoutButton: {
    height: 52,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  logoutText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 12,
  },

  versionText: {
    color: "#555555",
    fontSize: 11,
    textAlign: "center",
    marginTop: 15,
  },

});