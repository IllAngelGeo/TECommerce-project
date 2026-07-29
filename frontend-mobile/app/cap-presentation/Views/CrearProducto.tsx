import React, { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  Modal,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { API_URL } from "../constants/api_url";

interface Categoria {
  id_categoria: number;
  nombre: string;
}

export default function CrearProducto() {
  // ==========================================
  // ESTADOS
  // ==========================================
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [idCategoria, setIdCategoria] = useState<number | null>(null);
  const [modalCategoriasVisible, setModalCategoriasVisible] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [modelo, setModelo] = useState("");
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState<string[]>([]);
  const [subiendoImagen, setSubiendoImagen] = useState(false);
  const [precio, setPrecio] = useState("");
  const [precioOferta, setPrecioOferta] = useState("");
  const [activo, setActivo] = useState(true);
  const [destacado, setDestacado] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [cargandoCategorias, setCargandoCategorias] = useState(true);
  const [stock, setStock] = useState("");
  const [stockMinimo, setStockMinimo] = useState("");

  // ==========================================
  // OBTENER CATEGORÍAS
  // ==========================================
  useEffect(() => {
    obtenerCategorias();
  }, []);

  const obtenerCategorias = async () => {
    try {
      setCargandoCategorias(true);
      const response = await fetch(`${API_URL}/categorias`);

      if (!response.ok) {
        throw new Error("No se pudieron obtener las categorías");
      }

      const data = await response.json();
      console.log(
  "RESPUESTA CREAR PRODUCTO:",
  JSON.stringify(data, null, 2)
);

      setCategorias(data);
    } catch (error) {
      console.error("Error obteniendo categorías:", error);
      Alert.alert("Error", "No se pudieron cargar las categorías.");
    } finally {
      setCargandoCategorias(false);
    }
  };

  // ==========================================
  // SELECCIONAR IMÁGENES
  // ==========================================
  const seleccionarImagen = async () => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          "Permiso requerido",
          "Necesitamos acceso a tu galería para seleccionar imágenes."
        );
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 0.8,
      });

      if (!resultado.canceled) {
        const nuevasImagenes = resultado.assets.map((asset) => asset.uri);
        setImagenesSeleccionadas(nuevasImagenes);
      }
    } catch (error) {
      console.error("Error seleccionando imágenes:", error);
      Alert.alert("Error", "No se pudieron seleccionar las imágenes.");
    }
  };

  // ==========================================
  // ELIMINAR IMAGEN
  // ==========================================
  const eliminarImagen = (index: number) => {
    setImagenesSeleccionadas((prev) => prev.filter((_, i) => i !== index));
  };

  // ==========================================
  // SUBIR IMÁGENES
  // ==========================================
  const subirImagenProducto = async (idProducto: string, uri: string, index: number) => {
    try {
      const formData = new FormData();
      formData.append("imagen", {
        uri: uri,
        name: `producto-${index}.jpg`,
        type: "image/jpeg",
      } as any);

      const response = await fetch(`${API_URL}/productos/${idProducto}/imagenes`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `No se pudo subir la imagen ${index + 1}`);
      }

      console.log(`Imagen ${index + 1} subida correctamente:`, data);
      return data;
    } catch (error) {
      console.error(`Error subiendo imagen ${index + 1}:`, error);
      throw error;
    }
  };

  // ==========================================
  // CREAR PRODUCTO
  // ==========================================
  const crearProducto = async () => {
    // VALIDAR CATEGORÍA
    if (idCategoria === null) {
      Alert.alert("Campo requerido", "Selecciona una categoría para el producto.");
      return;
    }

    // VALIDAR NOMBRE
    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "Ingresa el nombre del producto.");
      return;
    }

    // VALIDAR PRECIO
    if (!precio.trim()) {
      Alert.alert("Campo requerido", "Ingresa el precio del producto.");
      return;
    }

    // VALIDAR PRECIO OFERTA
    if (precioOferta.trim() && Number(precioOferta) >= Number(precio)) {
      Alert.alert(
        "Precio inválido",
        "El precio de oferta debe ser menor al precio normal."
      );
      return;
    }

    if (!stock.trim()) {
  Alert.alert("Campo requerido", "Ingresa el stock del producto.");
  return;
}

if (!stockMinimo.trim()) {
  Alert.alert("Campo requerido", "Ingresa el stock mínimo.");
  return;
}

if (Number(stock) < 0 || Number(stockMinimo) < 0) {
  Alert.alert(
    "Stock inválido",
    "El stock no puede ser negativo."
  );
  return;
}

    try {
      setCargando(true);

const producto = {
  id_categoria: idCategoria,
  nombre: nombre.trim(),
  descripcion: descripcion.trim() || null,
  modelo: modelo.trim() || null,
  precio: Number(precio),
  precio_oferta: precioOferta.trim()
    ? Number(precioOferta)
    : null,
  stock: Number(stock),
  stock_minimo: Number(stockMinimo),
  activo: activo,
  destacado: destacado,
};
      console.log("Producto enviado:", producto);

      const response = await fetch(`${API_URL}/productos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(producto),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo crear el producto");
      }

      // Subir imágenes si existen
if (imagenesSeleccionadas.length > 0 && data.producto?.id_producto) {
            try {
          setSubiendoImagen(true);
          
          // Subir cada imagen
          for (let i = 0; i < imagenesSeleccionadas.length; i++) {
           await subirImagenProducto(
  data.producto.id_producto,
  imagenesSeleccionadas[i],
  i
);}

          console.log("Todas las imágenes subidas correctamente");
        } catch (error) {
          console.error("Error subiendo imágenes:", error);
          Alert.alert(
            "Producto creado",
            "El producto se creó correctamente, pero hubo un error al subir algunas imágenes."
          );
          router.replace("/cap-presentation/Views/Productos");
          return;
        } finally {
          setSubiendoImagen(false);
        }
      }

      Alert.alert(
        "Producto creado",
        "El producto se creó correctamente.",
        [
          {
            text: "Aceptar",
            onPress: () => router.replace("/cap-presentation/Views/Productos"),
          },
        ]
      );
    } catch (error) {
      console.error("Error creando producto:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "No se pudo crear el producto."
      );
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // OBTENER NOMBRE DE CATEGORÍA
  // ==========================================
  const obtenerNombreCategoria = () => {
    if (idCategoria === null) return "Seleccionar categoría";
    const categoria = categorias.find(c => c.id_categoria === idCategoria);
    return categoria ? categoria.nombre : "Seleccionar categoría";
  };

  // ==========================================
  // VISTA
  // ==========================================
  return (
    <View style={estilos.safe}>
      {/* HEADER */}
      <View style={estilos.header}>
        <Pressable style={estilos.botonRegresar} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View style={estilos.headerTexto}>
          <Text style={estilos.titulo}>Crear producto</Text>
          <Text style={estilos.subtitulo}>Agrega un nuevo producto al catálogo</Text>
        </View>
      </View>

      {/* FORMULARIO */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.contenido}
      >
        {/* ==========================================
            IMÁGENES
        ========================================== */}
        <View style={estilos.seccion}>
          <View style={estilos.seccionHeader}>
            <Ionicons name="image-outline" size={22} color="#FFFFFF" />
            <Text style={estilos.seccionTitulo}>Imágenes del producto</Text>
            <Text style={estilos.seccionSubtitulo}>
              {imagenesSeleccionadas.length}/5
            </Text>
          </View>

          {/* Botón para seleccionar imágenes */}
          <Pressable style={estilos.botonImagen} onPress={seleccionarImagen}>
            <Ionicons
              name={imagenesSeleccionadas.length > 0 ? "images-outline" : "cloud-upload-outline"}
              size={24}
              color="#FFFFFF"
            />
            <Text style={estilos.botonImagenTexto}>
              {imagenesSeleccionadas.length > 0
                ? `${imagenesSeleccionadas.length} imágenes seleccionadas`
                : "Seleccionar imágenes (máx. 5)"}
            </Text>
          </Pressable>

          {/* Vista previa de imágenes */}
          {imagenesSeleccionadas.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={estilos.imagenesPreviewContainer}
            >
              {imagenesSeleccionadas.map((uri, index) => (
                <View key={index} style={estilos.imagenPreviewItem}>
                  <Image source={{ uri }} style={estilos.imagenPreview} />
                  <Pressable
                    style={estilos.botonEliminarImagen}
                    onPress={() => eliminarImagen(index)}
                  >
                    <Ionicons name="close-circle" size={20} color="#FF4444" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* ==========================================
            CATEGORÍA
        ========================================== */}
        <View style={estilos.seccion}>
          <View style={estilos.seccionHeader}>
            <Ionicons name="folder-outline" size={22} color="#FFFFFF" />
            <Text style={estilos.seccionTitulo}>Categoría *</Text>
          </View>

          <Pressable
            style={estilos.botonCategoria}
            onPress={() => setModalCategoriasVisible(true)}
          >
            <Text style={estilos.botonCategoriaTexto}>
              {obtenerNombreCategoria()}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#666666" />
          </Pressable>
        </View>

        {/* ==========================================
            INFORMACIÓN DEL PRODUCTO
        ========================================== */}
        <View style={estilos.seccion}>
          <View style={estilos.seccionHeader}>
            <Ionicons name="cube-outline" size={22} color="#FFFFFF" />
            <Text style={estilos.seccionTitulo}>Información del producto</Text>
          </View>

          <Text style={estilos.label}>Nombre *</Text>
          <TextInput
            style={estilos.input}
            placeholder="Ej. Laptop Lenovo IdeaPad"
            placeholderTextColor="#555555"
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={estilos.label}>Modelo</Text>
          <TextInput
            style={estilos.input}
            placeholder="Ej. IdeaPad 3 15ALC6"
            placeholderTextColor="#555555"
            value={modelo}
            onChangeText={setModelo}
          />

          <Text style={estilos.label}>Descripción</Text>
          <TextInput
            style={[estilos.input, estilos.inputDescripcion]}
            placeholder="Características y detalles del producto..."
            placeholderTextColor="#555555"
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={5}
          />
        </View>

        {/* ==========================================
            PRECIOS
        ========================================== */}
        <View style={estilos.seccion}>
          <View style={estilos.seccionHeader}>
            <Ionicons name="pricetag-outline" size={22} color="#FFFFFF" />
            <Text style={estilos.seccionTitulo}>Precios</Text>
          </View>

          <Text style={estilos.label}>Precio *</Text>
          <TextInput
            style={estilos.input}
            placeholder="Ej. 15000"
            placeholderTextColor="#555555"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="decimal-pad"
          />

          <Text style={estilos.label}>Precio de oferta</Text>
          <TextInput
            style={estilos.input}
            placeholder="Opcional"
            placeholderTextColor="#555555"
            value={precioOferta}
            onChangeText={setPrecioOferta}
            keyboardType="decimal-pad"
          />
        </View>

<View style={estilos.seccion}>

  <View style={estilos.seccionHeader}>
    <Ionicons name="layers-outline" size={22} color="#FFFFFF" />
    <Text style={estilos.seccionTitulo}>
      Inventario
    </Text>
  </View>


  <Text style={estilos.label}>
    Stock disponible *
  </Text>

  <TextInput
    style={estilos.input}
    placeholder="Ej. 50"
    placeholderTextColor="#555555"
    value={stock}
    onChangeText={setStock}
    keyboardType="number-pad"
  />


  <Text style={estilos.label}>
    Stock mínimo *
  </Text>

  <TextInput
    style={estilos.input}
    placeholder="Ej. 5"
    placeholderTextColor="#555555"
    value={stockMinimo}
    onChangeText={setStockMinimo}
    keyboardType="number-pad"
  />

</View>

        {/* ==========================================
            CONFIGURACIÓN
        ========================================== */}
        <View style={estilos.seccion}>
          <View style={estilos.seccionHeader}>
            <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
            <Text style={estilos.seccionTitulo}>Configuración</Text>
          </View>

          {/* ACTIVO */}
          <View style={estilos.switchContainer}>
            <View>
              <Text style={estilos.switchTitulo}>Producto activo</Text>
              <Text style={estilos.switchDescripcion}>
                Disponible para los clientes.
              </Text>
            </View>
            <Switch
              value={activo}
              onValueChange={setActivo}
              trackColor={{ false: "#333333", true: "#666666" }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* DESTACADO */}
          <View style={estilos.switchContainer}>
            <View>
              <Text style={estilos.switchTitulo}>Producto destacado</Text>
              <Text style={estilos.switchDescripcion}>
                Aparecerá como producto destacado.
              </Text>
            </View>
            <Switch
              value={destacado}
              onValueChange={setDestacado}
              trackColor={{ false: "#333333", true: "#666666" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ==========================================
            BOTÓN CREAR
        ========================================== */}
        <Pressable
          style={[estilos.botonCrear, (cargando || subiendoImagen) && estilos.botonDeshabilitado]}
          onPress={crearProducto}
          disabled={cargando || subiendoImagen}
        >
          {cargando || subiendoImagen ? (
            <>
              <ActivityIndicator size="small" color="#000000" />
              <Text style={estilos.botonCrearTexto}>
                {subiendoImagen ? "Subiendo imágenes..." : "Creando..."}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="add-circle-outline" size={22} color="#000000" />
              <Text style={estilos.botonCrearTexto}>Crear producto</Text>
            </>
          )}
        </Pressable>

        <View style={estilos.espacioFinal} />
      </ScrollView>

      {/* ========================================== */}
      {/* MODAL DE CATEGORÍAS */}
      {/* ========================================== */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalCategoriasVisible}
        onRequestClose={() => setModalCategoriasVisible(false)}
      >
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContent}>
            <View style={estilos.modalHeader}>
              <Text style={estilos.modalTitulo}>Seleccionar categoría</Text>
              <Pressable
                style={estilos.modalCerrar}
                onPress={() => setModalCategoriasVisible(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {cargandoCategorias ? (
                <View style={estilos.cargandoCategoriasContainer}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={estilos.cargandoCategoriasTexto}>
                    Cargando categorías...
                  </Text>
                </View>
              ) : (
                <View style={estilos.modalOpcionesGrid}>
                  {categorias.map((categoria) => (
                    <TouchableOpacity
                      key={categoria.id_categoria}
                      style={[
                        estilos.modalOpcion,
                        idCategoria === categoria.id_categoria && estilos.modalOpcionActiva,
                      ]}
                      onPress={() => {
                        setIdCategoria(categoria.id_categoria);
                        setModalCategoriasVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          estilos.modalOpcionTexto,
                          idCategoria === categoria.id_categoria &&
                            estilos.modalOpcionTextoActivo,
                        ]}
                      >
                        {categoria.nombre}
                      </Text>
                      {idCategoria === categoria.id_categoria && (
                        <Ionicons name="checkmark" size={18} color="#000000" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ==========================================
// ESTILOS
// ==========================================
const estilos = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000000",
    paddingTop: 50,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },

  botonRegresar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerTexto: {
    flex: 1,
  },

  titulo: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  subtitulo: {
    color: "#666666",
    fontSize: 12,
    marginTop: 4,
  },

  contenido: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  seccion: {
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    padding: 16,
    marginBottom: 15,
  },

  seccionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },

  seccionTitulo: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },

  seccionSubtitulo: {
    color: "#666666",
    fontSize: 12,
  },

  label: {
    color: "#AAAAAA",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 7,
    marginTop: 10,
  },

  // ==========================================
  // IMAGEN
  // ==========================================
  botonImagen: {
    height: 48,
    backgroundColor: "#111111",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#222222",
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  botonImagenTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },

  imagenesPreviewContainer: {
    marginTop: 12,
  },

  imagenPreviewItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    position: "relative",
  },

  imagenPreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },

  botonEliminarImagen: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#000000",
    borderRadius: 12,
  },

  // ==========================================
  // CATEGORÍA
  // ==========================================
  botonCategoria: {
    height: 48,
    backgroundColor: "#111111",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#222222",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },

  botonCategoriaTexto: {
    color: "#FFFFFF",
    fontSize: 14,
  },

  // ==========================================
  // INPUTS
  // ==========================================
  input: {
    height: 48,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#222222",
    borderRadius: 10,
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 14,
  },

  inputDescripcion: {
    height: 110,
    paddingTop: 14,
    textAlignVertical: "top",
  },

  // ==========================================
  // SWITCH
  // ==========================================
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },

  switchTitulo: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  switchDescripcion: {
    color: "#666666",
    fontSize: 11,
    marginTop: 3,
    maxWidth: 240,
  },

  // ==========================================
  // BOTÓN
  // ==========================================
  botonCrear: {
    height: 52,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 5,
  },

  botonCrearTexto: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
  },

  botonDeshabilitado: {
    opacity: 0.5,
  },

  espacioFinal: {
    height: 30,
  },

  // ==========================================
  // MODAL CATEGORÍAS
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

  modalOpcionesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  modalOpcion: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "transparent",
    width: "100%",
  },

  modalOpcionActiva: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },

  modalOpcionTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },

  modalOpcionTextoActivo: {
    color: "#000000",
  },

  cargandoCategoriasContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },

  cargandoCategoriasTexto: {
    color: "#888888",
    marginTop: 15,
  },
});