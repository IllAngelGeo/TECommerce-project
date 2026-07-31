import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { auth } from "../../../firebase/firebase";
import { API_URL } from "../../constants/api_url";

interface Pedido {
  id_pedido: string;
  id_usuario: string;
  total: number;
  estado: string;
  fecha_creacion: string;
  detalles: any[];
  metodo_pago?: string;
  direccion_envio?: string;
}

// Definir tipos para los nombres de iconos
type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [animacion] = useState(new Animated.Value(0));

  const usuario = auth.currentUser;

  useEffect(() => {
    cargarPedidos();
    animarEntrada();
  }, []);

  const animarEntrada = () => {
    Animated.spring(animacion, {
      toValue: 1,
      tension: 20,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const cargarPedidos = async (refrescar = false) => {
    if (!usuario) {
      setCargando(false);
      return;
    }

    try {
      if (!refrescar) setCargando(true);
      
      const url = `${API_URL}/pedidos/firebase/${usuario.uid}`;
      console.log("URL PEDIDOS:", url);

      const response = await fetch(url);
      const texto = await response.text();
      console.log("RESPUESTA PEDIDOS:", texto);

      if (!response.ok) {
        throw new Error(texto);
      }

      const data = JSON.parse(texto);
      
      // Ordenar pedidos por fecha (más reciente primero)
      const pedidosOrdenados = data.sort((a: Pedido, b: Pedido) => 
        new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime()
      );
      
      setPedidos(pedidosOrdenados);
    } catch (error) {
      console.log("Error obteniendo pedidos:", error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    cargarPedidos(true);
  }, []);

  const formatearPrecio = (precio: number) => {
    return `$${precio.toLocaleString("es-MX")}`;
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) return "Fecha no disponible";
    
    const fechaObj = new Date(fecha);
    if (isNaN(fechaObj.getTime())) return "Fecha no disponible";
    
    return fechaObj.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const obtenerColorEstado = (estado: string) => {
    const estados: Record<string, string> = {
      "pendiente": "#FFA500",
      "pagado": "#00C853",
      "enviado": "#2196F3",
      "entregado": "#4CAF50",
      "cancelado": "#FF4444",
      "reembolsado": "#9C27B0",
    };
    return estados[estado.toLowerCase()] || "#888";
  };

  const obtenerIconoEstado = (estado: string): IconName => {
    const estadoLower = estado.toLowerCase();
    switch (estadoLower) {
      case "pendiente":
        return "time-outline";
      case "pagado":
        return "checkmark-circle-outline";
      case "enviado":
        return "car-outline";
      case "entregado":
        return "home-outline";
      case "cancelado":
        return "close-circle-outline";
      case "reembolsado":
        return "refresh-outline";
      default:
        return "ellipse-outline";
    }
  };

  const verDetalles = (idPedido: string) => {
    router.push({
      pathname: "/cap-presentation/Views/cliente/DetallePedido",
      params: { id_pedido: idPedido },
    });
  };

  const contarProductos = (detalles: any[]) => {
    return detalles.reduce((total, item) => total + (item.cantidad || 1), 0);
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.cargandoContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.textoCargando}>Cargando tus pedidos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        {/* HEADER MEJORADO */}
        <View style={styles.header}>
          <Pressable
            style={styles.botonRegresar}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </Pressable>
          
          <View style={styles.headerCentro}>
            <Ionicons name="bag-outline" size={22} color="#FFF" />
            <Text style={styles.titulo}>Mis Pedidos</Text>
          </View>
          
          <View style={styles.headerDerecha}>
            <Text style={styles.contadorPedidos}>{pedidos.length}</Text>
          </View>
        </View>

        {/* CONTENIDO */}
        {pedidos.length === 0 ? (
          <View style={styles.vacio}>
            <View style={styles.iconoVacio}>
              <Ionicons name="receipt-outline" size={70} color="#555" />
            </View>
            <Text style={styles.vacioTitulo}>No tienes pedidos</Text>
            <Text style={styles.vacioTexto}>
              Cuando realices tu primera compra, tus pedidos aparecerán aquí.
            </Text>
            <Pressable style={styles.explorar} onPress={() => router.back()}>
              <Text style={styles.explorarTexto}>Explorar productos</Text>
            </Pressable>
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
            {pedidos.map((pedido, index) => {
              const entradaAnimada = {
                transform: [
                  {
                    translateY: animacion.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50 * (index + 1), 0],
                    }),
                  },
                ],
                opacity: animacion,
              };

              return (
                <Animated.View key={pedido.id_pedido} style={entradaAnimada}>
                  <Pressable
                    style={styles.card}
                    onPress={() => verDetalles(pedido.id_pedido)}
                  >
                    {/* CABECERA DE CARD */}
                    <View style={styles.cardHeader}>
                      <View style={styles.idContainer}>
                        <Text style={styles.label}>Pedido</Text>
                        <Text style={styles.idPedido} numberOfLines={1}>
                          #{pedido.id_pedido.slice(0, 8)}
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.estado,
                          { borderColor: obtenerColorEstado(pedido.estado) },
                        ]}
                      >
                        <Ionicons
                          name={obtenerIconoEstado(pedido.estado)}
                          size={14}
                          color={obtenerColorEstado(pedido.estado)}
                          style={styles.estadoIcono}
                        />
                        <Text
                          style={[
                            styles.estadoTexto,
                            { color: obtenerColorEstado(pedido.estado) },
                          ]}
                        >
                          {pedido.estado}
                        </Text>
                      </View>
                    </View>

                    {/* INFORMACIÓN DETALLADA */}
                    <View style={styles.infoContainer}>
                      <View style={styles.infoItem}>
                        <Ionicons name="calendar-outline" size={16} color="#777" />
                        <Text style={styles.fecha}>
                          {formatearFecha(pedido.fecha_creacion)}
                        </Text>
                      </View>

                      <View style={styles.infoItem}>
                        <Ionicons name="cube-outline" size={16} color="#777" />
                        <Text style={styles.infoTexto}>
                          {contarProductos(pedido.detalles)} productos
                        </Text>
                      </View>

                      {pedido.metodo_pago && (
                        <View style={styles.infoItem}>
                          <Ionicons name="card-outline" size={16} color="#777" />
                          <Text style={styles.infoTexto}>
                            {pedido.metodo_pago}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* PIE DE CARD */}
                    <View style={styles.cardFooter}>
                      <View>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.total}>
                          {formatearPrecio(pedido.total)}
                        </Text>
                      </View>

                      <View style={styles.verPedido}>
                        <Text style={styles.verPedidoTexto}>Ver detalles</Text>
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#FFF"
                        />
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
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
    backgroundColor: "#0A0A0A",
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
    fontSize: 20,
    fontWeight: "bold",
  },
  headerDerecha: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  contadorPedidos: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
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
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  idContainer: {
    flex: 1,
  },
  label: {
    color: "#666",
    fontSize: 11,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  idPedido: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  estado: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  estadoIcono: {
    marginRight: 2,
  },
  estadoTexto: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "capitalize",
    letterSpacing: 0.5,
  },
  infoContainer: {
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#1A1A1A",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 3,
  },
  fecha: {
    color: "#777",
    fontSize: 12,
  },
  infoTexto: {
    color: "#777",
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  totalLabel: {
    color: "#666",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  total: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 2,
  },
  verPedido: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  verPedidoTexto: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
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
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
  },
  vacioTexto: {
    color: "#777",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  explorar: {
    marginTop: 25,
    backgroundColor: "#FFF",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  explorarTexto: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
});