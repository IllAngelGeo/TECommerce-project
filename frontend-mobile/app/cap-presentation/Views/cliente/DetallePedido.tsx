import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Pressable,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { API_URL } from "../../constants/api_url";

interface PedidoDetalle {
  id_detalle: string;
  id_pedido: string;
  id_producto: string;
  cantidad: number;
  precio: number;
  subtotal: number;
  nombre: string;
  imagen: string;
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function DetallePedido() {
  const { id_pedido } = useLocalSearchParams<{
    id_pedido: string;
  }>();

  const [detalles, setDetalles] = useState<PedidoDetalle[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [animacion] = useState(new Animated.Value(0));

  useEffect(() => {
    if (id_pedido) {
      obtenerDetalles();
      animarEntrada();
    }
  }, [id_pedido]);

  const animarEntrada = () => {
    Animated.spring(animacion, {
      toValue: 1,
      tension: 20,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const obtenerDetalles = async (refrescar = false) => {
    try {
      if (!refrescar) setCargando(true);
      
      const url = `${API_URL}/pedidos/${id_pedido}/detalles`;
      console.log("URL DETALLES PEDIDO:", url);

      const response = await fetch(url);
      const texto = await response.text();
      console.log("RESPUESTA DETALLES:", texto);

      if (!response.ok) {
        throw new Error(texto);
      }

      const data = JSON.parse(texto);
      setDetalles(data);
    } catch (error) {
      console.log("Error obteniendo detalles:", error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    obtenerDetalles(true);
  }, []);

  const formatearPrecio = (precio: number) => {
    return `$${precio.toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const total = detalles.reduce(
    (suma, producto) => suma + producto.subtotal,
    0
  );

  const totalProductos = detalles.reduce(
    (suma, producto) => suma + producto.cantidad,
    0
  );

  if (cargando) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.cargandoContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.textoCargando}>Cargando detalles del pedido...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* HEADER MEJORADO */}
        <LinearGradient
          colors={["#1a1a1a", "#000"]}
          style={styles.header}
        >
          <Pressable
            style={styles.botonRegresar}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </Pressable>

          <View style={styles.headerCentro}>
            <Ionicons name="receipt-outline" size={22} color="#FFF" />
            <Text style={styles.titulo}>Detalle del Pedido</Text>
          </View>

          <View style={styles.headerDerecha}>
            <Ionicons name="pricetag-outline" size={20} color="#FFF" />
          </View>
        </LinearGradient>

        {/* CONTENIDO */}
        {detalles.length === 0 ? (
          <View style={styles.vacio}>
            <View style={styles.iconoVacio}>
              <Ionicons name="receipt-outline" size={70} color="#555" />
            </View>
            <Text style={styles.vacioTitulo}>No hay detalles</Text>
            <Text style={styles.vacioTexto}>
              No se encontraron productos en este pedido.
            </Text>
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refrescando}
                onRefresh={onRefresh}
                tintColor="#FFF"
                colors={["#FFF"]}
              />
            }
          >
            {/* ID DEL PEDIDO */}
            <Animated.View style={[styles.infoPedido, { opacity: animacion }]}>
              <View>
                <Text style={styles.infoLabel}>Número de pedido</Text>
                <Text style={styles.idPedido}>#{id_pedido?.slice(0, 8)}</Text>
              </View>
              <View style={styles.estadoContainer}>
                <View style={[styles.estadoPunto, { backgroundColor: "#4CAF50" }]} />
                <Text style={styles.estado}>Activo</Text>
              </View>
            </Animated.View>

            {/* PRODUCTOS */}
            <Text style={styles.seccionTitulo}>
              <Ionicons name="cube-outline" size={20} color="#FFF" /> Productos
            </Text>

            {detalles.map((producto, index) => {
              const entradaAnimada = {
                transform: [
                  {
                    translateX: animacion.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50 * (index + 1), 0],
                    }),
                  },
                ],
                opacity: animacion,
              };

              return (
                <Animated.View key={producto.id_detalle} style={entradaAnimada}>
                  <View style={styles.card}>
                    {/* IMAGEN */}
                    <View style={styles.imagenContainer}>
                      {producto.imagen ? (
                        <Image
                          source={{ uri: producto.imagen }}
                          style={styles.imagen}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.imagenPlaceholder}>
                          <Ionicons name="image-outline" size={45} color="#555" />
                        </View>
                      )}
                    </View>

                    {/* INFORMACIÓN */}
                    <View style={styles.productoInfo}>
                      <Text style={styles.nombre} numberOfLines={2}>
                        {producto.nombre}
                      </Text>
                      
                      <Text style={styles.precioUnitario}>
                        {formatearPrecio(producto.precio)} c/u
                      </Text>

                      <View style={styles.cantidadRow}>
                        <Ionicons name="cart-outline" size={14} color="#777" />
                        <Text style={styles.cantidadLabel}>Cantidad:</Text>
                        <Text style={styles.cantidad}>{producto.cantidad}</Text>
                      </View>

                      <View style={styles.subtotalRow}>
                        <Text style={styles.subtotalLabel}>Subtotal</Text>
                        <Text style={styles.subtotal}>
                          {formatearPrecio(producto.subtotal)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              );
            })}

            {/* RESUMEN DE PRODUCTOS */}
            <Animated.View style={[styles.resumenContainer, { opacity: animacion }]}>
              <View style={styles.resumenRow}>
                <Text style={styles.resumenLabel}>Total de productos</Text>
                <Text style={styles.resumenValor}>{totalProductos}</Text>
              </View>
              <View style={styles.resumenDivider} />
              <View style={styles.resumenRow}>
                <Text style={styles.resumenLabel}>Artículos únicos</Text>
                <Text style={styles.resumenValor}>{detalles.length}</Text>
              </View>
            </Animated.View>

            {/* TOTAL */}
            <Animated.View style={[styles.totalContainer, { opacity: animacion }]}>
              <View>
                <Text style={styles.totalLabel}>Total del pedido</Text>
                <Text style={styles.productosTotal}>
                  {totalProductos} productos
                </Text>
              </View>
              <Text style={styles.total}>{formatearPrecio(total)}</Text>
            </Animated.View>

            {/* BOTÓN DE ACCIÓN */}
            <Pressable
              style={styles.botonAccion}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back-circle-outline" size={20} color="#000" />
              <Text style={styles.botonAccionTexto}>Volver a mis pedidos</Text>
            </Pressable>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        )}
      </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  botonRegresar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerCentro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  titulo: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerDerecha: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  cargandoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  textoCargando: {
    color: "#777",
    marginTop: 12,
    fontSize: 14,
  },
  scrollContent: {
    padding: 15,
  },
  infoPedido: {
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  infoLabel: {
    color: "#666",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  idPedido: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "600",
  },
  estadoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  estadoPunto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  estado: {
    color: "#4CAF50",
    fontSize: 12,
    fontWeight: "bold",
  },
  seccionTitulo: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    padding: 14,
    flexDirection: "row",
    marginBottom: 10,
  },
  imagenContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#FFF",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  imagen: {
    width: "90%",
    height: "90%",
  },
  imagenPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#151515",
  },
  productoInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "space-between",
  },
  nombre: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 4,
  },
  precioUnitario: {
    color: "#AAA",
    fontSize: 12,
  },
  cantidadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  cantidadLabel: {
    color: "#777",
    fontSize: 12,
  },
  cantidad: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  subtotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
  },
  subtotalLabel: {
    color: "#777",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  subtotal: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  resumenContainer: {
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    padding: 16,
    marginTop: 10,
  },
  resumenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resumenDivider: {
    height: 1,
    backgroundColor: "#1A1A1A",
    marginVertical: 10,
  },
  resumenLabel: {
    color: "#777",
    fontSize: 13,
  },
  resumenValor: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  totalContainer: {
    marginTop: 12,
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "bold",
  },
  productosTotal: {
    color: "#777",
    fontSize: 12,
    marginTop: 4,
  },
  total: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  botonAccion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FFF",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 15,
  },
  botonAccionTexto: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
  },
  vacio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  iconoVacio: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },
  vacioTitulo: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 18,
  },
  vacioTexto: {
    color: "#777",
    textAlign: "center",
    marginTop: 8,
    fontSize: 14,
  },
  bottomSpacer: {
    height: 30,
  },
});