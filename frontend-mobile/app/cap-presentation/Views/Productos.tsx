import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { API_URL } from "../constants/api_url";
import NavegacionCliente from "../components/navegacioncliente";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

interface Producto {
  id_producto: number;
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  modelo?: string;
  precio: number;
  precio_oferta?: number | null;
  imagen?: string | null;
  activo?: boolean;
  destacado?: boolean;
  stock?: number;
}

interface Categoria {
  id_categoria: number;
  nombre: string;
}

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(0);

  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const productosPorPagina = 6;

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      const [productosResponse, categoriasResponse] = await Promise.all([
        fetch(`${API_URL}/productos`),
        fetch(`${API_URL}/categorias`),
      ]);

      if (!productosResponse.ok) throw new Error("Error al obtener productos");
      if (!categoriasResponse.ok) throw new Error("Error al obtener categorías");

      const productosData = await productosResponse.json();
      const categoriasData = await categoriasResponse.json();

      setProductos(productosData);
      setCategorias(categoriasData);
    } catch (error) {
      console.error("Error cargando datos:", error);
      setError("No pudimos cargar los productos. Intenta nuevamente.");
    } finally {
      setCargando(false);
    }
  };

  const onRefresh = async () => {
    setRefrescando(true);
    try {
      await cargarDatos();
      setPagina(1);
    } finally {
      setRefrescando(false);
    }
  };

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.toLowerCase().trim();

    return productos.filter((producto) => {
      const coincideBusqueda =
        texto === "" ||
        producto.nombre?.toLowerCase().includes(texto) ||
        producto.modelo?.toLowerCase().includes(texto) ||
        producto.descripcion?.toLowerCase().includes(texto);

      const coincideCategoria =
        categoriaSeleccionada === 0 ||
        producto.id_categoria === categoriaSeleccionada;

      return coincideBusqueda && coincideCategoria;
    });
  }, [productos, busqueda, categoriaSeleccionada]);

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);

  const productosPagina = useMemo(() => {
    const inicio = (pagina - 1) * productosPorPagina;
    return productosFiltrados.slice(inicio, inicio + productosPorPagina);
  }, [productosFiltrados, pagina]);

  useEffect(() => {
    setPagina(1);
  }, [busqueda, categoriaSeleccionada]);

  const cambiarPagina = useCallback((direccion: "anterior" | "siguiente") => {
    setPagina((paginaActual) => {
      if (direccion === "anterior") {
        return Math.max(paginaActual - 1, 1);
      }
      return Math.min(paginaActual + 1, Math.max(totalPaginas, 1));
    });
  }, [totalPaginas]);

  const formatearPrecio = useCallback((precio: number) => {
    return `$${Number(precio).toLocaleString("es-MX")}`;
  }, []);

  const obtenerNombreCategoria = useCallback((idCategoria: number) => {
    const categoria = categorias.find((item) => item.id_categoria === idCategoria);
    return categoria?.nombre || "Sin categoría";
  }, [categorias]);

 

  if (error) {
    return (
      <SafeAreaView style={estilos.safe}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={estilos.centerContainer}>
          <View style={estilos.errorIcon}>
            <Ionicons name="alert-outline" size={40} color="#FFFFFF" />
          </View>
          <Text style={estilos.errorTitle}>Algo salió mal</Text>
          <Text style={estilos.errorText}>{error}</Text>
          <Pressable style={estilos.retryButton} onPress={cargarDatos}>
            <Ionicons name="refresh-outline" size={18} color="#000000" />
            <Text style={estilos.retryText}>Intentar nuevamente</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={estilos.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* HEADER CON PADDING SUPERIOR */}
      <View style={estilos.header}>
       
        <View style={estilos.headerTitleContainer}>
          <Text style={estilos.headerTitle}>Productos</Text>
        </View>

        <Pressable style={({ pressed }) => [estilos.headerRight, pressed && estilos.buttonPressed]}>
          <Ionicons name="bag-handle-outline" size={22} color="#FFFFFF" />
          <View style={estilos.cartBadge}>
            <Text style={estilos.cartBadgeText}>0</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView
        style={estilos.scroll}
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
        {/* BUSCADOR */}
        <View style={estilos.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#888888" />
          <TextInput
            style={estilos.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor="#777777"
            value={busqueda}
            onChangeText={setBusqueda}
            returnKeyType="search"
          />
          {busqueda.length > 0 && (
            <Pressable onPress={() => setBusqueda("")}>
              <Ionicons name="close-circle" size={20} color="#777777" />
            </Pressable>
          )}
        </View>

        {/* SECCIÓN CATEGORÍAS */}
        

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.categoriasContainer}
        >
          <Pressable
            onPress={() => setCategoriaSeleccionada(0)}
            style={[
              estilos.categoriaButton,
              categoriaSeleccionada === 0 && estilos.categoriaActiva,
            ]}
          >
            <Ionicons 
              name="grid-outline" 
              size={16} 
              color={categoriaSeleccionada === 0 ? "#000000" : "#888888"} 
            />
            <Text style={[
              estilos.categoriaText,
              categoriaSeleccionada === 0 && estilos.categoriaTextActiva,
            ]}>
              Todos
            </Text>
          </Pressable>

          {categorias.map((categoria) => (
            <Pressable
              key={categoria.id_categoria}
              onPress={() => setCategoriaSeleccionada(categoria.id_categoria)}
              style={[
                estilos.categoriaButton,
                categoriaSeleccionada === categoria.id_categoria && estilos.categoriaActiva,
              ]}
            >
              <Text style={[
                estilos.categoriaText,
                categoriaSeleccionada === categoria.id_categoria && estilos.categoriaTextActiva,
              ]}>
                {categoria.nombre}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

       {/* PRODUCTOS */}
{cargando ? (
  <View style={estilos.loadingProducts}>
    <ActivityIndicator size="large" color="#FFFFFF" />
    <Text style={estilos.loadingProductsText}>
      Cargando productos...
    </Text>
  </View>
) : productosPagina.length === 0 ? (
  <View style={estilos.emptyContainer}>
            <Ionicons name="search-outline" size={60} color="#333333" />
            <Text style={estilos.emptyTitle}>No encontramos productos</Text>
            <Text style={estilos.emptyText}>
              Intenta buscar otro producto o cambiar el filtro.
            </Text>
            <Pressable style={estilos.clearButton} onPress={() => {
              setBusqueda("");
              setCategoriaSeleccionada(0);
            }}>
              <Text style={estilos.clearButtonText}>Limpiar filtros</Text>
            </Pressable>
          </View>
        ) : (
          <View style={estilos.productGrid}>
            {productosPagina.map((producto) => (
              <Pressable
                key={producto.id_producto}
                style={({ pressed }) => [
                  estilos.productCard,
                  pressed && estilos.productCardPressed,
                ]}
                onPress={() => {
                }}
              >
                <View style={estilos.imageContainer}>
                  {producto.destacado && (
                    <View style={estilos.badge}>
                      <Text style={estilos.badgeText}>Destacado</Text>
                    </View>
                  )}
                  
                  {producto.stock === 0 && (
                    <View style={estilos.stockBadge}>
                      <Text style={estilos.stockBadgeText}>Sin stock</Text>
                    </View>
                  )}

                  <Pressable style={estilos.favoriteButton}>
                    <Ionicons name="heart-outline" size={18} color="#FFFFFF" />
                  </Pressable>

                  {producto.imagen ? (
                    <Image
                      source={{ uri: producto.imagen }}
                      style={estilos.productImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons name="image-outline" size={55} color="#333333" />
                  )}
                </View>

                <Text style={estilos.productName} numberOfLines={2}>
                  {producto.nombre}
                </Text>

                <View style={estilos.productMeta}>
                  <Text style={estilos.productCategory} numberOfLines={1}>
                    {obtenerNombreCategoria(producto.id_categoria)}
                  </Text>
                  {producto.modelo && (
                    <Text style={estilos.productModel} numberOfLines={1}>
                      {producto.modelo}
                    </Text>
                  )}
                </View>

                <View style={estilos.priceContainer}>
                  <Text style={estilos.price}>
                    {formatearPrecio(producto.precio_oferta ?? producto.precio)}
                  </Text>
                  {producto.precio_oferta && (
                    <Text style={estilos.oldPrice}>
                      {formatearPrecio(producto.precio)}
                    </Text>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* PAGINACIÓN */}
        {totalPaginas > 1 && (
          <View style={estilos.pagination}>
            <Pressable
              disabled={pagina === 1}
              onPress={() => cambiarPagina("anterior")}
              style={({ pressed }) => [
                estilos.pageButton,
                pagina === 1 && estilos.pageButtonDisabled,
                pressed && pagina !== 1 && estilos.pageButtonPressed,
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={pagina === 1 ? "#444444" : "#FFFFFF"}
              />
              <Text style={[estilos.pageButtonText, pagina === 1 && estilos.pageButtonTextDisabled]}>
                Anterior
              </Text>
            </Pressable>

            <View style={estilos.pageInfo}>
              <Text style={estilos.currentPage}>{pagina}</Text>
              <Text style={estilos.pageSeparator}>/</Text>
              <Text style={estilos.totalPages}>{totalPaginas}</Text>
            </View>

            <Pressable
              disabled={pagina === totalPaginas}
              onPress={() => cambiarPagina("siguiente")}
              style={({ pressed }) => [
                estilos.pageButton,
                pagina === totalPaginas && estilos.pageButtonDisabled,
                pressed && pagina !== totalPaginas && estilos.pageButtonPressed,
              ]}
            >
              <Text style={[estilos.pageButtonText, pagina === totalPaginas && estilos.pageButtonTextDisabled]}>
                Siguiente
              </Text>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={pagina === totalPaginas ? "#444444" : "#FFFFFF"}
              />
            </Pressable>
          </View>
        )}

        <View style={estilos.footerSpace} />
      </ScrollView>
<NavegacionCliente seccionActual="productos" />


    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000000",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  scroll: {
    flex: 1,
    backgroundColor: "#000000",
  },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
    backgroundColor: "#000000",
  },

  loadingIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
  },

  loadingSubtext: {
    color: "#777777",
    fontSize: 13,
    marginTop: 4,
  },

  // =========================
  // HEADER - CON PADDING SUPERIOR
  // =========================

  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 8,
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "bold",
  },

  headerRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  cartBadgeText: {
    color: "#000000",
    fontSize: 9,
    fontWeight: "bold",
  },

  // =========================
  // BUSCADOR
  // =========================

  searchContainer: {
    height: 48,
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 18,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2D2D2D",
    flexDirection: "row",
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 10,
  },

  // =========================
  // SECCIÓN
  // =========================

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 18,
    marginBottom: 14,
  },

  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  resultadosBadge: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
  },

  resultadosText: {
    color: "#888888",
    fontSize: 11,
    fontWeight: "600",
  },

  verMas: {
    color: "#888888",
    fontSize: 13,
    fontWeight: "500",
  },

  // =========================
  // CATEGORÍAS
  // =========================

  categoriasContainer: {
    paddingHorizontal: 18,
    paddingBottom: 20,
    gap: 8,
  },

  categoriaButton: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    marginRight: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  categoriaActiva: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },

  categoriaText: {
    color: "#AAAAAA",
    fontSize: 12,
    fontWeight: "600",
  },

  categoriaTextActiva: {
    color: "#000000",
  },

  // =========================
  // GRID PRODUCTOS
  // =========================

  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },

  productCard: {
    width: CARD_WIDTH,
    marginBottom: 20,
  },

  productCardPressed: {
    transform: [{ scale: 0.97 }],
  },

  imageContainer: {
    height: 180,
    backgroundColor: "#151515",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2D2D2D",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },

  productImage: {
    width: "80%",
    height: "80%",
  },

  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 2,
  },

  badgeText: {
    color: "#000000",
    fontSize: 8,
    fontWeight: "bold",
  },

  stockBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "#FF4444",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    zIndex: 2,
  },

  stockBadgeText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "bold",
  },

  favoriteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#000000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },

  productName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    lineHeight: 18,
  },

  productMeta: {
    marginTop: 4,
  },

  productCategory: {
    color: "#888888",
    fontSize: 11,
  },

  productModel: {
    color: "#666666",
    fontSize: 10,
    marginTop: 1,
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 7,
  },

  price: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  oldPrice: {
    color: "#666666",
    fontSize: 12,
    textDecorationLine: "line-through",
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
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 15,
  },

  errorText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  retryText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
  },

  // =========================
  // SIN PRODUCTOS
  // =========================

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 15,
  },

  emptyText: {
    color: "#777777",
    fontSize: 13,
    textAlign: "center",
    marginTop: 7,
  },

  clearButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18,
  },

  clearButtonText: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "bold",
  },

  // =========================
  // PAGINACIÓN
  // =========================

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },

  pageButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
  },

  pageButtonDisabled: {
    backgroundColor: "#0D0D0D",
    borderColor: "#1A1A1A",
  },

  pageButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },

  pageButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  pageButtonTextDisabled: {
    color: "#444444",
  },

  pageInfo: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 60,
    justifyContent: "center",
  },

  currentPage: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  pageSeparator: {
    color: "#555555",
    fontSize: 16,
    marginHorizontal: 4,
  },

  totalPages: {
    color: "#777777",
    fontSize: 15,
    fontWeight: "600",
  },

  footerSpace: {
    height: 20,
  },

  loadingProducts: {
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 50,
},

loadingProductsText: {
  color: "#777777",
  fontSize: 13,
  marginTop: 12,
},

});