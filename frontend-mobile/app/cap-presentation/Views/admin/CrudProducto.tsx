import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { API_URL } from "../../constants/api_url";
import MenuLateral from "../../../components/MenuLateral";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  TouchableOpacity,
} from "react-native";

interface Producto {
  id_producto: string;
  id_categoria?: number;
  nombre: string;
  descripcion?: string;
  modelo?: string;
  precio: number;
  precio_oferta?: number | null;
  activo: boolean;
  destacado: boolean;
  stock: number;
  imagen?: string;
}

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("todos");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    obtenerProductos();
    obtenerCategorias();
  }, []);

  // ==========================================
  // OBTENER PRODUCTOS
  // ==========================================
  const obtenerProductos = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_URL}/productos`);

      if (!response.ok) {
        throw new Error("No se pudieron obtener los productos");
      }

      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      Alert.alert("Error", "No se pudieron cargar los productos.");
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // OBTENER CATEGORÍAS
  // ==========================================
  const obtenerCategorias = async () => {
    try {
      const response = await fetch(`${API_URL}/categorias`);

      if (!response.ok) {
        throw new Error("No se pudieron obtener las categorías");
      }

      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      console.error("Error obteniendo categorías:", error);
    }
  };

  // ==========================================
  // ELIMINAR PRODUCTO
  // ==========================================
  const eliminarProducto = (id: string, nombre: string) => {
    Alert.alert(
      "Eliminar producto",
      `¿Seguro que deseas eliminar "${nombre}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => confirmarEliminar(id),
        },
      ]
    );
  };

  const confirmarEliminar = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/productos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("No se pudo eliminar el producto");
      }

      Alert.alert("Producto eliminado", "El producto se eliminó correctamente.");
      
      setProductos((productosActuales) =>
        productosActuales.filter((producto) => producto.id_producto !== id)
      );
    } catch (error) {
      console.error("Error eliminando producto:", error);
      Alert.alert("Error", "No se pudo eliminar el producto.");
    }
  };

  // ==========================================
  // FORMATEAR PRECIO
  // ==========================================
  const formatearPrecio = (precio: number) => {
    return `$${Number(precio).toLocaleString("es-MX")}`;
  };

  // ==========================================
  // FILTRAR PRODUCTOS
  // ==========================================
  const productosFiltrados = useMemo(() => {
    return productos.filter((producto) => {
      const textoBusqueda = busqueda.toLowerCase().trim();
      const coincideBusqueda =
        producto.nombre.toLowerCase().includes(textoBusqueda) ||
        (producto.modelo || "").toLowerCase().includes(textoBusqueda);

      let coincideFiltro = true;
      if (filtroActivo === "activos") coincideFiltro = producto.activo === true;
      if (filtroActivo === "inactivos") coincideFiltro = producto.activo === false;
      if (filtroActivo === "destacados") coincideFiltro = producto.destacado === true;
      if (filtroActivo === "agotados") coincideFiltro = producto.stock <= 0;

      let coincideCategoria = true;
      if (categoriaSeleccionada !== null && categoriaSeleccionada !== undefined) {
        coincideCategoria = producto.id_categoria === categoriaSeleccionada;
      }

      return coincideBusqueda && coincideFiltro && coincideCategoria;
    });
  }, [productos, busqueda, filtroActivo, categoriaSeleccionada]);

  // ==========================================
  // RENDER PRODUCTO
  // ==========================================
  const renderProducto = ({ item }: { item: Producto }) => {
    const tieneOferta =
      item.precio_oferta !== null &&
      item.precio_oferta !== undefined &&
      Number(item.precio_oferta) > 0;

    const precioActual = tieneOferta ? item.precio_oferta : item.precio;

    return (
      <View style={estilos.productoCard}>
        <View style={estilos.imagenContainer}>
          {item.imagen ? (
            <Image
              source={{ uri: item.imagen }}
              style={estilos.imagen}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="image-outline" size={50} color="#444444" />
          )}
        </View>

        <View style={estilos.productoInfo}>
          <Text style={estilos.productoNombre} numberOfLines={2}>
            {item.nombre}
          </Text>
          <Text style={estilos.productoModelo}>
            {item.modelo || "Sin modelo"}
          </Text>

          <View style={estilos.precioContainer}>
            <Text style={estilos.precio}>{formatearPrecio(precioActual ?? 0)}</Text>
            {tieneOferta && (
              <Text style={estilos.precioAnterior}>
                {formatearPrecio(item.precio)}
              </Text>
            )}
          </View>

          <View style={estilos.stockContainer}>
            <View
              style={[
                estilos.stockIndicator,
                item.stock > 0 ? estilos.stockDisponible : estilos.stockAgotado,
              ]}
            />
            <Text style={estilos.stockTexto}>Stock: {item.stock}</Text>
          </View>

          <Text style={estilos.estadoTexto}>
            {item.activo ? "Producto activo" : "Producto inactivo"}
          </Text>
        </View>

        <View style={estilos.acciones}>
          <Pressable
            style={estilos.botonEditar}
            onPress={() =>
              router.push({
                pathname: "/cap-presentation/Views/admin/EditarProducto",
                params: { id: item.id_producto },
              })
            }
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          </Pressable>

          <Pressable
            style={estilos.botonEliminar}
            onPress={() => eliminarProducto(item.id_producto, item.nombre)}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    );
  };

  // ==========================================
  // OBTENER NOMBRE DEL FILTRO ACTIVO
  // ==========================================
  const obtenerNombreFiltro = () => {
    const filtros = {
      todos: "Todos",
      activos: "Activos",
      inactivos: "Inactivos",
      destacados: "Destacados",
      agotados: "Agotados",
    };
    return filtros[filtroActivo as keyof typeof filtros] || "Todos";
  };

  // ==========================================
  // OBTENER NOMBRE DE CATEGORÍA SELECCIONADA
  // ==========================================
  const obtenerNombreCategoria = () => {
    if (categoriaSeleccionada === null) return "Todas";
    const categoria = categorias.find(c => c.id_categoria === categoriaSeleccionada);
    return categoria ? categoria.nombre : "Todas";
  };

  // ==========================================
  // CARGANDO
  // ==========================================
  if (cargando) {
    return (
      <View style={estilos.safe}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={estilos.cargandoTexto}>Cargando productos...</Text>
      </View>
    );
  }

  // ==========================================
  // VISTA PRINCIPAL
  // ==========================================
  return (
    <View style={estilos.safe}>
      {/* HEADER */}
 <View style={estilos.header}>

  <View style={estilos.headerIzquierda}>

    <Pressable
      style={estilos.botonMenu}
      onPress={() => setMenuVisible(true)}
    >
      <Ionicons
        name="menu"
        size={28}
        color="#FFFFFF"
      />
    </Pressable>


    <View>
      <Text style={estilos.titulo}>
        Productos
      </Text>
    </View>

  </View>


  <Pressable
    style={estilos.botonAgregar}
    onPress={() =>
      router.push(
        "/cap-presentation/Views/admin/CrearProducto"
      )
    }
  >
    <Ionicons 
      name="add" 
      size={22} 
      color="#000000" 
    />

    <Text style={estilos.botonAgregarTexto}>
      Nuevo
    </Text>

  </Pressable>

</View>

      {/* BÚSQUEDA */}
      <View style={estilos.busquedaContainer}>
        <Ionicons name="search-outline" size={21} color="#777777" />
        <TextInput
          style={estilos.inputBusqueda}
          placeholder="Buscar producto o modelo..."
          placeholderTextColor="#666666"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <Pressable onPress={() => setBusqueda("")}>
            <Ionicons name="close-circle" size={21} color="#777777" />
          </Pressable>
        )}
      </View>

      {/* BOTÓN DE FILTROS */}
      <Pressable
        style={estilos.botonFiltros}
        onPress={() => setModalVisible(true)}
      >
        <View style={estilos.botonFiltrosContent}>
          <Ionicons name="options-outline" size={20} color="#FFFFFF" />
          <Text style={estilos.botonFiltrosTexto}>Filtros</Text>
        </View>
        <View style={estilos.botonFiltrosBadge}>
          <Text style={estilos.botonFiltrosBadgeTexto}>
            {obtenerNombreFiltro()} · {obtenerNombreCategoria()}
          </Text>
        </View>
      </Pressable>

      {/* CONTADOR */}
      <View style={estilos.contadorContainer}>
        <Ionicons name="cube-outline" size={20} color="#FFFFFF" />
        <Text style={estilos.contadorTexto}>
          Mostrando {productosFiltrados.length} de {productos.length} productos
        </Text>
      </View>

      {/* LISTA */}
      {productosFiltrados.length === 0 ? (
        <ScrollView 
          contentContainerStyle={estilos.vacioContainer}
          showsVerticalScrollIndicator={false}
        >
          <Ionicons name="search-outline" size={70} color="#333333" />
          <Text style={estilos.vacioTitulo}>No se encontraron productos</Text>
          <Text style={estilos.vacioTexto}>
            Intenta cambiar la búsqueda o los filtros.
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => item.id_producto}
          renderItem={renderProducto}
          contentContainerStyle={estilos.lista}
          showsVerticalScrollIndicator={false}
          refreshing={cargando}
          onRefresh={obtenerProductos}
        />
      )}

      {/* ========================================== */}
      {/* MODAL DE FILTROS */}
      {/* ========================================== */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContent}>
            {/* HEADER MODAL */}
            <View style={estilos.modalHeader}>
              <Text style={estilos.modalTitulo}>Filtros</Text>
              <Pressable
                style={estilos.modalCerrar}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* FILTRO DE ESTADO */}
              <Text style={estilos.modalSeccionTitulo}>Estado</Text>
              <View style={estilos.modalOpcionesGrid}>
                {[
                  { id: "todos", nombre: "Todos", icono: "apps-outline" },
                  { id: "activos", nombre: "Activos", icono: "checkmark-circle-outline" },
                  { id: "inactivos", nombre: "Inactivos", icono: "close-circle-outline" },
                  { id: "destacados", nombre: "Destacados", icono: "star-outline" },
                  { id: "agotados", nombre: "Agotados", icono: "alert-circle-outline" },
                ].map((filtro) => (
                  <TouchableOpacity
                    key={filtro.id}
                    style={[
                      estilos.modalOpcion,
                      filtroActivo === filtro.id && estilos.modalOpcionActiva,
                    ]}
                    onPress={() => {
                      setFiltroActivo(filtro.id);
                    }}
                  >
                    <Ionicons
                      name={filtro.icono as any}
                      size={20}
                      color={filtroActivo === filtro.id ? "#000000" : "#FFFFFF"}
                    />
                    <Text
                      style={[
                        estilos.modalOpcionTexto,
                        filtroActivo === filtro.id && estilos.modalOpcionTextoActivo,
                      ]}
                    >
                      {filtro.nombre}
                    </Text>
                    {filtroActivo === filtro.id && (
                      <Ionicons name="checkmark" size={18} color="#000000" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* FILTRO DE CATEGORÍA */}
              <Text style={estilos.modalSeccionTitulo}>Categoría</Text>
              <View style={estilos.modalOpcionesGrid}>
                <TouchableOpacity
                  style={[
                    estilos.modalOpcion,
                    categoriaSeleccionada === null && estilos.modalOpcionActiva,
                  ]}
                  onPress={() => setCategoriaSeleccionada(null)}
                >
                  <Text
                    style={[
                      estilos.modalOpcionTexto,
                      categoriaSeleccionada === null && estilos.modalOpcionTextoActivo,
                    ]}
                  >
                    Todas
                  </Text>
                  {categoriaSeleccionada === null && (
                    <Ionicons name="checkmark" size={18} color="#000000" />
                  )}
                </TouchableOpacity>

                {categorias.map((categoria) => (
                  <TouchableOpacity
                    key={categoria.id_categoria}
                    style={[
                      estilos.modalOpcion,
                      categoriaSeleccionada === categoria.id_categoria && estilos.modalOpcionActiva,
                    ]}
                    onPress={() => setCategoriaSeleccionada(categoria.id_categoria)}
                  >
                    <Text
                      style={[
                        estilos.modalOpcionTexto,
                        categoriaSeleccionada === categoria.id_categoria && estilos.modalOpcionTextoActivo,
                      ]}
                    >
                      {categoria.nombre}
                    </Text>
                    {categoriaSeleccionada === categoria.id_categoria && (
                      <Ionicons name="checkmark" size={18} color="#000000" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {/* BOTONES DE ACCIÓN */}
              <View style={estilos.modalAcciones}>
                <Pressable
                  style={estilos.modalBotonLimpiar}
                  onPress={() => {
                    setFiltroActivo("todos");
                    setCategoriaSeleccionada(null);
                  }}
                >
                  <Text style={estilos.modalBotonLimpiarTexto}>Limpiar filtros</Text>
                </Pressable>

                <Pressable
                  style={estilos.modalBotonAplicar}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={estilos.modalBotonAplicarTexto}>Aplicar filtros</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
<MenuLateral
  visible={menuVisible}
  onClose={() => setMenuVisible(false)}
  seccionActual="productos"
/>

    </View>
  );
}

const estilos = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000000",
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  subtitulo: {
    color: "#666666",
    fontSize: 13,
    marginTop: 5,
  },

  // BOTÓN AGREGAR
  botonAgregar: {
    backgroundColor: "#FFFFFF",
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  botonAgregarTexto: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 13,
  },

  // BÚSQUEDA
  busquedaContainer: {
    height: 48,
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  inputBusqueda: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 10,
  },

  // BOTÓN FILTROS
  botonFiltros: {
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  botonFiltrosContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  botonFiltrosTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  botonFiltrosBadge: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  botonFiltrosBadgeTexto: {
    color: "#AAAAAA",
    fontSize: 11,
  },

  // CONTADOR
  contadorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },

  contadorTexto: {
    color: "#888888",
    fontSize: 13,
  },

  // LISTA
  lista: {
    paddingBottom: 40,
  },

  // CARD
  productoCard: {
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    padding: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  // IMAGEN
  imagenContainer: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  imagen: {
    width: "90%",
    height: "90%",
  },

  // INFO
  productoInfo: {
    flex: 1,
    marginLeft: 12,
  },

  productoNombre: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  productoModelo: {
    color: "#666666",
    fontSize: 12,
    marginTop: 3,
  },

  precioContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 7,
  },

  precio: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  precioAnterior: {
    color: "#555555",
    fontSize: 12,
    textDecorationLine: "line-through",
  },

  // STOCK
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },

  stockIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },

  stockDisponible: {
    backgroundColor: "#22C55E",
  },

  stockAgotado: {
    backgroundColor: "#EF4444",
  },

  stockTexto: {
    color: "#888888",
    fontSize: 11,
  },

  estadoTexto: {
    color: "#555555",
    fontSize: 10,
    marginTop: 3,
  },

  // ACCIONES
  acciones: {
    gap: 8,
    marginLeft: 8,
  },

  botonEditar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  botonEliminar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  // CARGANDO
  cargandoTexto: {
    color: "#888888",
    marginTop: 15,
    textAlign: "center",
  },

  // VACÍO
  vacioContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
    paddingVertical: 40,
  },

  vacioTitulo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 15,
  },

  vacioTexto: {
    color: "#666666",
    fontSize: 13,
    marginTop: 6,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  // ==========================================
  // MODAL
  // ==========================================
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "flex-end",
  },

  modalContent: {
    backgroundColor: "#0A0A0A",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    maxHeight: "80%",
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },

  modalTitulo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  modalCerrar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  modalSeccionTitulo: {
    color: "#888888",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  modalOpcionesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  modalOpcion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    minWidth: "30%",
    flex: 1,
  },

  modalOpcionActiva: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },

  modalOpcionTexto: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "500",
  },

  modalOpcionTextoActivo: {
    color: "#000000",
  },

  modalAcciones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
  },

  modalBotonLimpiar: {
    flex: 1,
    backgroundColor: "#1A1A1A",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  modalBotonLimpiarTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  modalBotonAplicar: {
    flex: 2,
    backgroundColor: "#FFFFFF",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  modalBotonAplicarTexto: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
  },

  headerIzquierda:{
  flexDirection:"row",
  alignItems:"center",
  gap:12,
},

botonMenu:{
  width:42,
  height:42,
  borderRadius:12,
  backgroundColor:"#111111",
  justifyContent:"center",
  alignItems:"center",
},

});