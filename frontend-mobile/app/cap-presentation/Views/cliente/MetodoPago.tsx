import React, { useEffect, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { auth } from "../../../firebase/firebase";
import { API_URL } from "../../constants/api_url";

interface Direccion {
  id_direccion: string;
  id_usuario: string;
  calle: string;
  numero_exterior: string;
  numero_interior: string | null;
  colonia: string;
  codigo_postal: string;
  ciudad: string;
  estado: string;
  referencias: string | null;
  principal: boolean;
}

type MetodoPago = "efectivo" | "mercado_pago";

export default function MetodoPago() {
  const usuario = auth.currentUser;
  const { id_direccion } = useLocalSearchParams<{ id_direccion: string }>();

  const [direccion, setDireccion] = useState<Direccion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [metodoPago, setMetodoPago] = useState<MetodoPago | null>(null);
  const [procesando, setProcesando] = useState(false);

  const obtenerDireccion = async () => {
    if (!usuario || !id_direccion) {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      const response = await fetch(`${API_URL}/direcciones/firebase/${usuario.uid}`);
      const texto = await response.text();

      if (!response.ok) throw new Error(texto);

      const data = JSON.parse(texto);
      if (Array.isArray(data)) {
        const direccionSeleccionada = data.find(
          (item: Direccion) => item.id_direccion === id_direccion
        );
        if (direccionSeleccionada) setDireccion(direccionSeleccionada);
        else setDireccion(null);
      }
    } catch (error) {
      setDireccion(null);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerDireccion();
  }, [id_direccion]);

  useEffect(() => {
    const manejarMercadoPago = (url: string) => {
      if (url.includes("payment-success")) {
        Alert.alert("Pago exitoso 🎉", "Mercado Pago confirmó el pago");
      }
      if (url.includes("payment-failure")) {
        Alert.alert("Pago rechazado", "El pago fue cancelado");
      }
      if (url.includes("payment-pending")) {
        Alert.alert("Pago pendiente", "Esperando confirmación");
      }
    };

    const listener = Linking.addEventListener("url", (event) => {
      manejarMercadoPago(event.url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) manejarMercadoPago(url);
    });

    return () => listener.remove();
  }, []);

  const formatearDireccion = () => {
    if (!direccion) return "";
    return `${direccion.calle} #${direccion.numero_exterior}${
      direccion.numero_interior ? ` Int. ${direccion.numero_interior}` : ""
    }`;
  };

  const continuar = async () => {
    if (!usuario) {
      Alert.alert("Sesión requerida", "Debes iniciar sesión para realizar la compra.");
      return;
    }
    if (!direccion) {
      Alert.alert("Dirección requerida", "No se encontró la dirección seleccionada.");
      return;
    }
    if (!metodoPago) {
      Alert.alert("Método de pago", "Selecciona un método de pago para continuar.");
      return;
    }

    if (metodoPago === "mercado_pago") {
      iniciarPagoMercadoPago();
      return;
    }

    try {
      setProcesando(true);
      const response = await fetch(`${API_URL}/pedidos/firebase/${usuario.uid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_direccion: direccion.id_direccion,
          metodo_pago: metodoPago,
        }),
      });

      const texto = await response.text();
      if (!response.ok) {
        let mensaje = "No se pudo crear el pedido.";
        try {
          const errorData = JSON.parse(texto);
          mensaje = errorData.error || mensaje;
          if (errorData.detalle) mensaje += `\n\n${errorData.detalle}`;
        } catch {}
        throw new Error(mensaje);
      }

      const data = JSON.parse(texto);
      Alert.alert("¡Pedido realizado! 🎉", "Tu pedido se creó correctamente.", [
        {
          text: "Ver pedido",
          onPress: () => {
            router.replace({
              pathname: "/cap-presentation/Views/cliente/DetallePedido" as any,
              params: { id_pedido: data.pedido.id_pedido },
            });
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "No se pudo realizar el pedido.");
    } finally {
      setProcesando(false);
    }
  };

  const iniciarPagoMercadoPago = async () => {
    if (!usuario) {
      Alert.alert("Sesión requerida", "Debes iniciar sesión para pagar.");
      return;
    }

    try {
      setProcesando(true);
      const response = await fetch(`${API_URL}/mercadopago/create-preference`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_firebase: usuario.uid }),
      });

      const data = await response.json();
      if (data.success) {
        await WebBrowser.openBrowserAsync(data.init_point);
      } else {
        Alert.alert("Error", "No se pudo iniciar el pago");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo abrir Mercado Pago");
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Cargando información...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!direccion) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorContainer}>
          <Ionicons name="location-outline" size={70} color="#555" />
          <Text style={styles.errorTitulo}>Dirección no encontrada</Text>
          <Text style={styles.errorTexto}>
            No pudimos encontrar la dirección seleccionada.
          </Text>
          <Pressable style={styles.volver} onPress={() => router.back()}>
            <Text style={styles.volverTexto}>Volver</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.back} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </Pressable>
          <Text style={styles.titulo}>Método de pago</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
        >
          <Text style={styles.seccionTitulo}>Entregar en</Text>
          <View style={styles.direccionCard}>
            <View style={styles.direccionIcon}>
              <Ionicons name="location" size={25} color="#FFF" />
            </View>
            <View style={styles.direccionInfo}>
              <Text style={styles.direccionPrincipal}>
                {direccion.principal ? "Dirección principal" : "Dirección seleccionada"}
              </Text>
              <Text style={styles.direccionTexto}>{formatearDireccion()}</Text>
              <Text style={styles.direccionTexto}>{direccion.colonia}</Text>
              <Text style={styles.direccionTexto}>
                {direccion.codigo_postal} · {direccion.ciudad}
              </Text>
              <Text style={styles.direccionTexto}>{direccion.estado}</Text>
              {direccion.referencias && (
                <Text style={styles.referencia}>Referencia: {direccion.referencias}</Text>
              )}
            </View>
            <Pressable onPress={() => router.back()} style={styles.cambiar}>
              <Ionicons name="create-outline" size={20} color="#FFF" />
            </Pressable>
          </View>

          <Text style={styles.seccionTitulo}>¿Cómo quieres pagar?</Text>

          <Pressable
            style={[
              styles.metodoCard,
              metodoPago === "efectivo" && styles.metodoSeleccionado,
            ]}
            onPress={() => setMetodoPago("efectivo")}
          >
            <View style={styles.metodoIcon}>
              <Ionicons name="cash-outline" size={27} color="#FFF" />
            </View>
            <View style={styles.metodoInfo}>
              <Text style={styles.metodoTitulo}>Efectivo</Text>
              <Text style={styles.metodoDescripcion}>Paga al recibir tu pedido</Text>
            </View>
            <Ionicons
              name={metodoPago === "efectivo" ? "radio-button-on" : "radio-button-off"}
              size={23}
              color={metodoPago === "efectivo" ? "#FFF" : "#555"}
            />
          </Pressable>

          <Pressable
            style={[
              styles.metodoCard,
              metodoPago === "mercado_pago" && styles.metodoSeleccionado,
            ]}
            onPress={() => setMetodoPago("mercado_pago")}
          >
            <View style={styles.metodoIcon}>
              <Ionicons name="card-outline" size={27} color="#FFF" />
            </View>
            <View style={styles.metodoInfo}>
              <Text style={styles.metodoTitulo}>Elige como pagar</Text>
              <Text style={styles.metodoDescripcion}>
                Elige un método de pago
              </Text>
            </View>
            <Ionicons
              name={metodoPago === "mercado_pago" ? "radio-button-on" : "radio-button-off"}
              size={23}
              color={metodoPago === "mercado_pago" ? "#FFF" : "#555"}
            />
          </Pressable>

          <Pressable
            style={[styles.continuar, !metodoPago && styles.continuarDisabled]}
            disabled={!metodoPago || procesando}
            onPress={continuar}
          >
            {procesando ? (
              <ActivityIndicator color="#000" />
            ) : (
              <>
                <Text style={styles.continuarTexto}>Continuar</Text>
                <Ionicons name="arrow-forward" size={20} color="#000" />
              </>
            )}
          </Pressable>
        </ScrollView>
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
    height: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
    backgroundColor: "#000",
  },
  back: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  scroll: {
    padding: 20,
    paddingBottom: 50,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#777",
    marginTop: 12,
  },
  seccionTitulo: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
  },
  direccionCard: {
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#1A1A1A",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
  },
  direccionIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  direccionInfo: {
    flex: 1,
  },
  direccionPrincipal: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  direccionTexto: {
    color: "#CCC",
    fontSize: 13,
    marginTop: 3,
  },
  referencia: {
    color: "#777",
    fontSize: 11,
    marginTop: 10,
    lineHeight: 17,
  },
  cambiar: {
    width: 35,
    height: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  metodoCard: {
    minHeight: 75,
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#1A1A1A",
    borderRadius: 16,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  metodoSeleccionado: {
    borderColor: "#FFF",
    backgroundColor: "#111",
  },
  metodoIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  metodoInfo: {
    flex: 1,
  },
  metodoTitulo: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  metodoDescripcion: {
    color: "#777",
    fontSize: 12,
    marginTop: 4,
  },
  continuar: {
    height: 52,
    backgroundColor: "#FFF",
    borderRadius: 15,
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  continuarDisabled: {
    opacity: 0.4,
  },
  continuarTexto: {
    color: "#000",
    fontSize: 15,
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#000",
  },
  errorTitulo: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  errorTexto: {
    color: "#777",
    textAlign: "center",
    marginTop: 10,
  },
  volver: {
    marginTop: 25,
    backgroundColor: "#FFF",
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
  },
  volverTexto: {
    color: "#000",
    fontWeight: "bold",
  },
});