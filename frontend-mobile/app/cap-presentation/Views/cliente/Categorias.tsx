import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, View, ActivityIndicator, RefreshControl, StatusBar, Platform, ScrollView, } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { API_URL } from "../../constants/api_url";

interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoriasPorPagina = 9; // 3 columnas x 3 filas

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const obtenerCategorias = async () => {
    try {
      setCargando(true);
      setError(null);

      const response = await fetch(`${API_URL}/categorias`);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error obteniendo categorías:", error);
      setError("No pudimos cargar las categorías. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  const onRefresh = async () => {
    setRefrescando(true);
    try {
      await obtenerCategorias();
      setPagina(1);
    } finally {
      setRefrescando(false);
    }
  };

  const totalPaginas = useMemo(() => {
    return Math.ceil(categorias.length / categoriasPorPagina);
  }, [categorias]);

  const categoriasPagina = useMemo(() => {
    const indiceInicial = (pagina - 1) * categoriasPorPagina;
    return categorias.slice(indiceInicial, indiceInicial + categoriasPorPagina);
  }, [categorias, pagina]);

  const cambiarPagina = useCallback(
    (direccion: "anterior" | "siguiente") => {
      setPagina((paginaActual) => {
        if (direccion === "anterior") {
          return Math.max(paginaActual - 1, 1);
        }
        return Math.min(paginaActual + 1, totalPaginas);
      });
    },
    [totalPaginas]
  );

  const obtenerIconoCategoria = useCallback((nombre: string) => {
    const nombreLower = nombre.toLowerCase();

    if (nombreLower.includes("laptop")) return "laptop-outline";
    if (nombreLower.includes("computadora")) return "desktop-outline";
    if (nombreLower.includes("celular")) return "phone-portrait-outline";
    if (nombreLower.includes("tablet")) return "tablet-portrait-outline";
    if (nombreLower.includes("monitor")) return "desktop-outline";
    if (nombreLower.includes("ram")) return "hardware-chip-outline";
    if (nombreLower.includes("almacenamiento") || nombreLower.includes("usb")) return "save-outline";
    if (nombreLower.includes("gráfica") || nombreLower.includes("grafica")) return "game-controller-outline";
    if (nombreLower.includes("procesador")) return "hardware-chip-outline";
    if (nombreLower.includes("teclado") || nombreLower.includes("mouse")) return "keypad-outline";
    if (nombreLower.includes("audífono") || nombreLower.includes("audio")) return "headset-outline";
    if (nombreLower.includes("bocina")) return "volume-high-outline";
    if (nombreLower.includes("cámara")) return "camera-outline";
    if (nombreLower.includes("micrófono")) return "mic-outline";
    if (nombreLower.includes("cable") || nombreLower.includes("adaptador")) return "git-compare-outline";
    if (nombreLower.includes("cargador")) return "flash-outline";
    if (nombreLower.includes("redes")) return "wifi-outline";
    if (nombreLower.includes("impresora")) return "print-outline";

    return "cube-outline";
  }, []);

  const renderCategoria = useCallback(
    ({ item }: { item: Categoria }) => {
      return (
        <Pressable
          style={({ pressed }) => [
            estilos.categoriaCard,
            pressed && estilos.categoriaCardPressed,
          ]}
          onPress={() => {
            router.replace({
              pathname: "/cap-presentation/Views/cliente/Home",
              params: {
                categoria: item.id_categoria.toString(),
              },
            });
          }}
        >
          <View style={estilos.iconContainer}>
            <Ionicons name={obtenerIconoCategoria(item.nombre) as any} size={40} color="#FFFFFF" />
          </View>

          <Text style={estilos.categoriaNombre} numberOfLines={2}>
            {item.nombre}
          </Text>
        </Pressable>
      );
    },
    [obtenerIconoCategoria]
  );

  if (cargando) {
    return (
      <SafeAreaView style={estilos.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={estilos.centerContainer}>
          <View style={estilos.loadingIcon}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
          <Text style={estilos.cargandoText}>Cargando categorías</Text>
          <Text style={estilos.cargandoSubtext}>Un momento, por favor...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={estilos.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={estilos.centerContainer}>
          <View style={estilos.errorIcon}>
            <Ionicons name="alert-outline" size={38} color="#FFFFFF" />
          </View>
          <Text style={estilos.errorTitle}>Algo salió mal</Text>
          <Text style={estilos.errorText}>{error}</Text>
          <Pressable
            style={({ pressed }) => [
              estilos.reintentarButton,
              pressed && estilos.reintentarButtonPressed,
            ]}
            onPress={obtenerCategorias}
          >
            <Ionicons name="refresh-outline" size={18} color="#000000" />
            <Text style={estilos.reintentarText}>Intentar nuevamente</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* HEADER */}
      <View style={estilos.header}>
        <Pressable
          style={({ pressed }) => [
            estilos.backButton,
            pressed && estilos.headerButtonPressed,
          ]}
          onPress={() => router.replace("/cap-presentation/Views/cliente/Home")}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={estilos.headerTitleContainer}>
          <Text style={estilos.headerTitle}>Categorías</Text>
        </View>

      </View>

      {/* CONTENIDO PRINCIPAL */}
      <ScrollView 
        style={estilos.scrollContainer}
        contentContainerStyle={estilos.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={onRefresh}
            tintColor="#FFFFFF"
            colors={["#FFFFFF"]}
          />
        }
      >
        {/* CONTADOR DE CATEGORÍAS */}
        <View style={estilos.contadorContainer}>
          <View style={estilos.contadorInfo}>
            <Text style={estilos.contadorTitulo}>Todas las categorías</Text>
            <Text style={estilos.contadorSubtitulo}>
              {categorias.length} categorías disponibles
            </Text>
          </View>
          <View style={estilos.badgeCantidad}>
            <Text style={estilos.badgeTexto}>{categorias.length}</Text>
          </View>
        </View>

        {/* GRID DE CATEGORÍAS - 3 COLUMNAS */}
        <View style={estilos.gridWrapper}>
          <View style={estilos.gridContainer}>
            {categoriasPagina.map((item) => (
              <View key={item.id_categoria} style={estilos.gridItem}>
                {renderCategoria({ item })}
              </View>
            ))}
          </View>
        </View>

        {/* PAGINACIÓN CENTRADA - SOLO BOTONES */}
        {totalPaginas > 1 && (
          <View style={estilos.paginacionCentrada}>
            <View style={estilos.paginacionContainer}>
              <Pressable
                disabled={pagina === 1}
                onPress={() => cambiarPagina("anterior")}
                style={({ pressed }) => [
                  estilos.botonPagina,
                  pagina === 1 && estilos.botonDesactivado,
                  pressed && pagina !== 1 && estilos.botonPressed,
                ]}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={pagina === 1 ? "#555555" : "#000000"}
                />
                <Text
                  style={[
                    estilos.textoBoton,
                    pagina === 1 && estilos.textoDesactivado,
                  ]}
                >
                  Anterior
                </Text>
              </Pressable>

              <Pressable
                disabled={pagina === totalPaginas}
                onPress={() => cambiarPagina("siguiente")}
                style={({ pressed }) => [
                  estilos.botonPagina,
                  pagina === totalPaginas && estilos.botonDesactivado,
                  pressed && pagina !== totalPaginas && estilos.botonPressed,
                ]}
              >
                <Text
                  style={[
                    estilos.textoBoton,
                    pagina === totalPaginas && estilos.textoDesactivado,
                  ]}
                >
                  Siguiente
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={pagina === totalPaginas ? "#555555" : "#000000"}
                />
              </Pressable>
            </View>
          </View>
        )}

        <View style={estilos.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000000",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  // =========================
  // HEADER
  // =========================

  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  headerButtonPressed: {
    opacity: 0.7,
  },

  // =========================
  // CONTADOR
  // =========================

  contadorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 12,
    backgroundColor: "#000000",
  },

  contadorInfo: {
    flex: 1,
  },

  contadorTitulo: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  contadorSubtitulo: {
    color: "#777777",
    fontSize: 13,
    marginTop: 2,
  },

  badgeCantidad: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },

  badgeTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // =========================
  // SCROLL CONTAINER
  // =========================

  scrollContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 20,
  },

  // =========================
  // GRID - 3 COLUMNAS
  // =========================

  gridWrapper: {
    alignItems: "center",
    marginTop: 4,
  },

  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
  },

  gridItem: {
    width: "31%", // 3 columnas con espacio
    aspectRatio: 1,
    marginBottom: 10,
  },

  categoriaCard: {
    flex: 1,
    backgroundColor: "#151515",
    borderWidth: 1,
    borderColor: "#2D2D2D",
    borderRadius: 18,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  categoriaCardPressed: {
    backgroundColor: "#FFFFFF",
    transform: [{ scale: 0.95 }],
  },

  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#333333",
  },

  categoriaNombre: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 15,
    paddingHorizontal: 2,
  },

  // =========================
  // CARGANDO
  // =========================

  loadingIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  cargandoText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
  },

  cargandoSubtext: {
    color: "#777777",
    fontSize: 13,
    marginTop: 4,
  },

  // =========================
  // ERROR
  // =========================

  errorIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  errorTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },

  errorText: {
    color: "#FF4444",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 30,
  },

  reintentarButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  reintentarButtonPressed: {
    opacity: 0.8,
  },

  reintentarText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
  },

  // =========================
  // SIN CATEGORÍAS
  // =========================

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },

  emptyText: {
    color: "#888888",
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },

  // =========================
  // PAGINACIÓN CENTRADA - SOLO BOTONES
  // =========================

  paginacionCentrada: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#000000",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
    marginTop: 5,
  },

  paginacionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    width: "100%",
  },

  botonPagina: {
    height: 48,
    paddingHorizontal: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minWidth: 130,
  },

  botonDesactivado: {
    backgroundColor: "#1A1A1A",
  },

  botonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },

  textoBoton: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "600",
  },

  textoDesactivado: {
    color: "#555555",
  },

  footerSpace: {
    height: 10,
  },
});