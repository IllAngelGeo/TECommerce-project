import React, { useContext } from "react";

import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import NavegacionCliente from "../../components/navegacioncliente";
import { auth } from "../../../firebase/firebase";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { CartContext } from "../../../context/CartContext";

export default function Carrito() {
const {
  carrito,
  eliminarCarrito,
  actualizarCantidad,
  obtenerCarrito,
} = useContext(CartContext);


  const usuario = auth.currentUser;

  useEffect(() => {
    if (usuario) {
      obtenerCarrito(usuario.uid);
    }
  }, []);

  const total = carrito.reduce(
    (suma, p) => suma + p.precio * p.cantidad,
    0
  );

  const cantidadTotal = carrito.reduce(
    (suma, p) => suma + p.cantidad,
    0
  );

  const formatearPrecio = (precio: number) => {
    return `$${precio.toLocaleString("es-MX")}`;
  };

const irAComprar = () => {

  if (!usuario) {
    Alert.alert(
      "Iniciar sesión",
      "Debes iniciar sesión para realizar una compra."
    );
    return;
  }

  if (carrito.length === 0) {
    Alert.alert(
      "Carrito vacío",
      "Agrega productos antes de comprar."
    );
    return;
  }

  router.push(
    "/cap-presentation/Views/cliente/DireccionEntrega"
  );
};

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.titulo}>Mi carrito</Text>
            {carrito.length > 0 && (
              <Text style={styles.subtitulo}>
                {cantidadTotal} productos
              </Text>
            )}
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* SCROLL PRINCIPAL CON ESPACIO INFERIOR */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {carrito.length === 0 ? (
            <View style={styles.vacio}>
              <View style={styles.vacioIcon}>
                <Ionicons name="cart-outline" size={80} color="#666" />
              </View>
              <Text style={styles.vacioTitulo}>
                Tu carrito está vacío
              </Text>
              <Text style={styles.vacioTexto}>
                Agrega productos para comenzar tu compra
              </Text>
              <Pressable
                style={styles.explorar}
                onPress={() => router.back()}
              >
                <Text style={styles.explorarTexto}>
                  Explorar productos
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {/* PRODUCTOS */}
              {carrito.map((producto) => (
                <View key={producto.id_carrito} style={styles.card}>
                  <View style={styles.imagenContainer}>
                    {producto.imagen ? (
                      <Image
                        source={{ uri: producto.imagen }}
                        style={styles.imagen}
                        resizeMode="contain"
                      />
                    ) : (
                      <Ionicons name="image-outline" size={50} color="#555" />
                    )}
                  </View>

                  <View style={styles.info}>
                    <Text style={styles.nombre} numberOfLines={2}>
                      {producto.nombre}
                    </Text>
                    <Text style={styles.precio}>
                      {formatearPrecio(producto.precio)}
                    </Text>
                    <Text style={styles.subtotal}>
                      Subtotal:{" "}
                      {formatearPrecio(producto.precio * producto.cantidad)}
                    </Text>

   <View style={styles.controles}>

  {/* DISMINUIR */}
  <Pressable
    style={[
      styles.control,
      producto.cantidad <= 1 && styles.controlDisabled,
    ]}
    disabled={producto.cantidad <= 1}
    onPress={() => {
      if (usuario && producto.cantidad > 1) {
        actualizarCantidad(
          producto.id_carrito,
          producto.cantidad - 1,
          usuario.uid
        );
      }
    }}
  >
    <Ionicons
      name="remove"
      size={20}
      color={
        producto.cantidad <= 1
          ? "#444"
          : "#FFF"
      }
    />
  </Pressable>

  {/* CANTIDAD */}
  <Text style={styles.cantidad}>
    {producto.cantidad}
  </Text>

  {/* AUMENTAR */}
  <Pressable
    style={[
      styles.control,
      producto.cantidad >= producto.stock &&
        styles.controlDisabled,
    ]}
    disabled={producto.cantidad >= producto.stock}
    onPress={() => {
      if (
        usuario &&
        producto.cantidad < producto.stock
      ) {
        actualizarCantidad(
          producto.id_carrito,
          producto.cantidad + 1,
          usuario.uid
        );
      }
    }}
  >
    <Ionicons
      name="add"
      size={20}
      color={
        producto.cantidad >= producto.stock
          ? "#444"
          : "#FFF"
      }
    />
  </Pressable>

  {/* ELIMINAR */}
  <Pressable
    style={styles.eliminar}
    onPress={() => {
      if (usuario) {
        eliminarCarrito(
          producto.id_carrito,
          usuario.uid
        );
      }
    }}
  >
    <Ionicons
      name="trash-outline"
      size={22}
      color="#FFF"
    />
  </Pressable>

</View>
               </View>
                </View>
              ))}

              {/* FOOTER CON TOTAL - DENTRO DEL SCROLL */}
              <View style={styles.footerContainer}>
                <View style={styles.footerContent}>
                  <View>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.total}>
                      {formatearPrecio(total)}
                    </Text>
                  </View>

 <Pressable
  style={styles.comprar}
  onPress={irAComprar}
>
  
  <Ionicons
    name="card-outline"
    size={22}
    color="#000"
  />

  <Text style={styles.comprarTexto}>
    Comprar
  </Text>
</Pressable>
                </View>
              </View>

              {/* ESPACIO EXTRA PARA LA NAVEGACIÓN */}
              <View style={styles.bottomSpacer} />
            </>
          )}
        </ScrollView>
      </View>

      {/* NAVEGACIÓN - SIEMPRE FIJA EN EL BOTÓN */}
      <NavegacionCliente seccionActual="carrito" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000",
  },

  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
    backgroundColor: "#000",
    zIndex: 10,
  },

  titulo: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  subtitulo: {
    color: "#777",
    fontSize: 12,
    marginTop: 3,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 18,
    paddingBottom: 120, // Espacio para la navegación
  },

  card: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#0A0A0A",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    flexDirection: "row",
  },

  imagenContainer: {
    width: 95,
    height: 95,
    backgroundColor: "#FFF",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  imagen: {
    width: "90%",
    height: "90%",
  },

  info: {
    flex: 1,
    marginLeft: 15,
  },

  nombre: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  precio: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 6,
  },

  subtotal: {
    color: "#888",
    fontSize: 12,
    marginTop: 3,
  },

  controles: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 10,
  },

  control: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  cantidad: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "bold",
    width: 25,
    textAlign: "center",
  },

  eliminar: {
    marginLeft: "auto",
  },

  // FOOTER DENTRO DEL SCROLL
  footerContainer: {
    marginTop: 20,
    marginBottom: 10,
    backgroundColor: "#0A0A0A",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    padding: 18,
  },

  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    color: "#777",
    fontSize: 13,
  },

  total: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  comprar: {
    backgroundColor: "#FFF",
    height: 50,
    paddingHorizontal: 25,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  comprarTexto: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 15,
  },

  // VACÍO
  vacio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
    minHeight: 400,
  },

  vacioIcon: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
  },

  vacioTitulo: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },

  vacioTexto: {
    color: "#777",
    marginTop: 8,
    textAlign: "center",
  },

  explorar: {
    marginTop: 25,
    backgroundColor: "#FFF",
    paddingHorizontal: 25,
    paddingVertical: 14,
    borderRadius: 12,
  },

  explorarTexto: {
    color: "#000",
    fontWeight: "bold",
  },

  // ESPACIO INFERIOR PARA NAVEGACIÓN
  bottomSpacer: {
    height: 80, // Espacio para la navegación flotante
  },

controlDisabled: {
  opacity: 0.5,
},

});