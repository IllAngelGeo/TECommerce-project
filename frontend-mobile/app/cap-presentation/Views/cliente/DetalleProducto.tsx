import React, { useEffect, useRef, useState } from "react";
import {ActivityIndicator,Animated,Image,Pressable,ScrollView,StyleSheet,Text,View,Dimensions,} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {useContext} from "react";
import {CartContext} from "../../../context/CartContext";
import { API_URL } from "../../constants/api_url";
import {Alert} from "react-native";
import { auth } from "../../../firebase/firebase";


const { width } = Dimensions.get('window');

export default function DetalleProducto() {
  const { id } = useLocalSearchParams();
const insets = useSafeAreaInsets();
  const [producto, setProducto] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [esFavorito, setEsFavorito] = useState(false);
  const escalaCarrito = useRef(new Animated.Value(1)).current;
  const escalaCorazon = useRef(new Animated.Value(1)).current;
  const carruselRef = useRef<ScrollView>(null);
  const [imagenes, setImagenes] = useState<any[]>([]);
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
  const {agregarCarrito}=useContext(CartContext);
  const usuario = auth.currentUser;
const [cambiandoFavorito, setCambiandoFavorito] = useState(false);


  useEffect(() => {
  if (producto?.stock > 0) {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(escalaCarrito, {
          toValue: 1.08,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(escalaCarrito, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    );

    animacion.start();

    return () => {
      animacion.stop();
      escalaCarrito.setValue(1);
    };
  }
}, [producto]);

useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(escalaCorazon, {
        toValue: 1.15,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(escalaCorazon, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);

useEffect(() => {
  if (id) {
    obtenerProducto();
    obtenerImagenes();
    verificarFavorito();
  }
}, [id]);

  const obtenerProducto = async () => {
    try {
      setCargando(true);
      setMensaje("");

      const response = await fetch(
        `${API_URL}/productos/${id}`
      );

      const texto = await response.text();

      if (!response.ok) {
        throw new Error("No se pudo obtener el producto");
      }

      const data = JSON.parse(texto);
      setProducto(data);

    } catch (error) {
      console.error("Error obteniendo producto:", error);
      setMensaje("No se pudo cargar la información del producto.");
    } finally {
      setCargando(false);
    }
  };

const verificarFavorito = async () => {
  try {
    const usuario = auth.currentUser;

    if (!usuario || !id) {
      return;
    }

    const response = await fetch(
      `${API_URL}/favoritos/firebase/${usuario.uid}`
    );

    if (!response.ok) {
      throw new Error("No se pudieron obtener los favoritos");
    }

    const data = await response.json();

    const existe = data.some(
      (favorito: any) =>
        String(favorito.id_producto) === String(id)
    );

    setEsFavorito(existe);

    console.log("¿Es favorito?", existe);

  } catch (error) {
    console.error("Error verificando favorito:", error);
  }
};

  const formatearPrecio = (precio: number) => {
    return `$${Number(precio).toLocaleString("es-MX")}`;
  };

  const incrementarCantidad = () => {
    if (cantidad < producto.stock) {
      setCantidad(cantidad + 1);
    }
  };

  const decrementarCantidad = () => {
    if (cantidad > 1) {
      setCantidad(cantidad - 1);
    }
  };

const toggleFavorito = async () => {
  try {
    const usuario = auth.currentUser;

    if (!usuario || !id || cambiandoFavorito) {
      return;
    }

    setCambiandoFavorito(true);

    const idProducto = String(id);

    // =========================
    // ELIMINAR FAVORITO
    // =========================

    if (esFavorito) {
      const response = await fetch(
        `${API_URL}/favoritos/firebase/${usuario.uid}/producto/${idProducto}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const texto = await response.text();

        console.log(
          "Error eliminando favorito:",
          texto
        );

        return;
      }

      // Actualizamos la interfaz
      setEsFavorito(false);

      console.log("❤️ Favorito eliminado");

      return;
    }

    // =========================
    // AGREGAR FAVORITO
    // =========================

    const response = await fetch(
      `${API_URL}/favoritos`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_usuario: usuario.uid,
          id_producto: idProducto,
        }),
      }
    );

    if (!response.ok) {
      const texto = await response.text();

      console.log(
        "Error agregando favorito:",
        texto
      );

      return;
    }

    // Actualizamos la interfaz
    setEsFavorito(true);

    console.log("❤️ Favorito agregado");

  } catch (error) {

    console.error(
      "Error cambiando favorito:",
      error
    );

  } finally {

    setCambiandoFavorito(false);

  }
};

const obtenerImagenes = async () => {
  try {
    const response = await fetch(
      `${API_URL}/productos/${id}/imagenes`
    );

    if (!response.ok) {
      throw new Error("No se pudieron obtener las imágenes");
    }

    const data = await response.json();

    setImagenes(data.imagenes || []);

  } catch (error) {
    console.error("Error obteniendo imágenes:", error);
  }
};

const cambiarImagen = (index: number) => {
  if (index < 0 || index >= imagenes.length) {
    return;
  }

  setImagenSeleccionada(index);

  carruselRef.current?.scrollTo({
    x: index * (width - 32),
    animated: true,
  });
};


  if (cargando) {
    return (
      <SafeAreaView style={estilos.safe}>
        <View style={estilos.cargandoContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={estilos.cargandoTexto}>Cargando producto...</Text>
        </View>
      </SafeAreaView>
    );
  }


  if (!producto) {
    return (
      <SafeAreaView style={estilos.safe}>
        <View style={estilos.errorContainer}>
          <View style={estilos.errorIconContainer}>
            <Ionicons name="alert-circle-outline" size={60} color="#FFFFFF" />
          </View>
          <Text style={estilos.errorTitulo}>Producto no encontrado</Text>
          <Text style={estilos.errorTexto}>{mensaje}</Text>
          <Pressable
            style={estilos.botonRegresar}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back-outline" size={20} color="#000000" />
            <Text style={estilos.botonRegresarTexto}>Regresar</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const tieneOferta =
    producto.precio_oferta !== null &&
    producto.precio_oferta !== undefined &&
    Number(producto.precio_oferta) > 0;

  const precioActual = tieneOferta
    ? producto.precio_oferta
    : producto.precio;

  return (
    <SafeAreaView style={estilos.safe}>
      {/* HEADER */}
      <View style={estilos.header}>
        <Pressable
          style={({ pressed }) => [
            estilos.headerButton,
            pressed && estilos.buttonPressed,
          ]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
        </Pressable>
        <Text style={estilos.headerTitulo}>Detalle del producto </Text>
        <View style={estilos.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={estilos.scrollContent}
      >
        {/* IMAGEN */}
  {/* IMAGEN PRINCIPAL */}
{/* GALERÍA DE IMÁGENES */}
<View>

  {/* CARRUSEL PRINCIPAL */}
  <View style={estilos.imagenContainer}>

    {imagenes.length > 0 ? (

      <ScrollView
        ref={carruselRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {

          const posicion = Math.round(
            event.nativeEvent.contentOffset.x /
              (width - 32)
          );

          setImagenSeleccionada(posicion);

        }}
      >

        {imagenes.map((imagen) => (

          <View
            key={imagen.id_imagen}
            style={estilos.slide}
          >

            <Image
              source={{
                uri: imagen.imagen_url,
              }}
              style={estilos.imagen}
              resizeMode="contain"
            />

          </View>

        ))}

      </ScrollView>

    ) : producto.imagen ? (

      <Image
        source={{
          uri: producto.imagen,
        }}
        style={estilos.imagen}
        resizeMode="contain"
      />

    ) : (

      <View style={estilos.imagenPlaceholder}>

        <Ionicons
          name="image-outline"
          size={80}
          color="#333333"
        />

        <Text style={estilos.imagenPlaceholderText}>
          Sin imagen
        </Text>

      </View>

    )}

    {/* BADGE MÁS VENDIDO */}
    {producto.destacado && (
      <View style={estilos.badge}>

        <Ionicons
          name="star"
          size={12}
          color="#000000"
        />

        <Text style={estilos.badgeText}>
          Más vendido
        </Text>

      </View>
    )}

  
    {/* CONTADOR 1 / 4 */}
    {imagenes.length > 1 && (
      <View style={estilos.contadorImagen}>

        <Text style={estilos.contadorTexto}>
          {imagenSeleccionada + 1} / {imagenes.length}
        </Text>

      </View>
    )}

  </View>


  {/* MINIATURAS */}
  {imagenes.length > 1 && (

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={
        estilos.miniaturasContainer
      }
    >

      {imagenes.map((imagen, index) => (

        <Pressable
          key={imagen.id_imagen}
          onPress={() => cambiarImagen(index)}
          style={[
            estilos.miniatura,

            imagenSeleccionada === index &&
              estilos.miniaturaSeleccionada,
          ]}
        >

<Image
  source={{
    uri: imagen.imagen_url,
  }}
  style={estilos.miniaturaImagen}
  resizeMode="contain"
/>
        </Pressable>

      ))}

    </ScrollView>

  )}

</View> 

        {/* INFORMACIÓN DEL PRODUCTO */}
        <View style={estilos.informacion}>
          {/* Título y modelo */}
          <View style={estilos.tituloContainer}>
            <Text style={estilos.nombre}>{producto.nombre}</Text>
            <View style={estilos.modeloContainer}>
              <Ionicons name="pricetag-outline" size={16} color="#666666" />
              <Text style={estilos.modelo}>{producto.modelo}</Text>
            </View>
          </View>

          {/* PRECIO Y CORAZÓN */}
          <View style={estilos.precioFavoritoContainer}>
            <View style={estilos.precioWrapper}>
              <Text style={estilos.precio}>{formatearPrecio(precioActual)}</Text>
              {tieneOferta && (
                <Text style={estilos.precioAnterior}>
                  {formatearPrecio(producto.precio)}
                </Text>
              )}
            </View>

<Animated.View
  style={{
    transform: [
      {
        scale: escalaCorazon,
      },
    ],
  }}
>
<Pressable
  style={({ pressed }) => [
    estilos.favoritoButton,
    pressed && estilos.buttonPressed,
  ]}
  onPress={toggleFavorito}
  disabled={cambiandoFavorito}
>
  <Ionicons
    name={esFavorito ? "heart" : "heart-outline"}
    size={28}
    color={esFavorito ? "#FFFFFF" : "#666666"}
  />
</Pressable>

</Animated.View>

          </View>

          {tieneOferta && (
            <View style={estilos.descuentoBadge}>
              <Text style={estilos.descuentoText}>
                Ahorra {formatearPrecio(producto.precio - producto.precio_oferta)}
              </Text>
            </View>
          )}

          {/* STOCK */}
          <View style={estilos.stockContainer}>
            <View style={[
              estilos.stockIndicator,
              producto.stock > 0 ? estilos.stockDisponible : estilos.stockAgotado
            ]} />
            <Text style={estilos.stockTexto}>
              {producto.stock > 0
                ? `Disponible · ${producto.stock} unidades`
                : "Producto agotado"}
            </Text>
          </View>

          {/* SEPARADOR */}
          <View style={estilos.separador} />

          {/* DESCRIPCIÓN */}
          <View style={estilos.descripcionSection}>
            <View style={estilos.seccionHeader}>
              <Ionicons name="document-text-outline" size={22} color="#FFFFFF" />
              <Text style={estilos.tituloSeccion}>Descripción</Text>
            </View>
            <Text style={estilos.descripcion}>
              {producto.descripcion ||
                "Este producto no tiene una descripción disponible."}
            </Text>
          </View>

          {/* INFORMACIÓN EXTRA */}
          <View style={estilos.infoCard}>
            <View style={estilos.infoItem}>
              <View style={estilos.infoIconContainer}>
                <Ionicons name="cube-outline" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={estilos.infoLabel}>Producto</Text>
                <Text style={estilos.infoValor}>{producto.nombre}</Text>
              </View>
            </View>

            <View style={estilos.infoDivider} />

            <View style={estilos.infoItem}>
              <View style={estilos.infoIconContainer}>
                <Ionicons name="barcode-outline" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={estilos.infoLabel}>Modelo</Text>
                <Text style={estilos.infoValor}>{producto.modelo}</Text>
              </View>
            </View>

            <View style={estilos.infoDivider} />

            <View style={estilos.infoItem}>
              <View style={estilos.infoIconContainer}>
                <Ionicons name="pricetag-outline" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={estilos.infoLabel}>Categoría</Text>
                <Text style={estilos.infoValor}>
                  {producto.categoria || "Sin categoría"}
                </Text>
              </View>
            </View>
          </View>

          {/* Espacio extra para que el contenido no se esconda detrás del footer */}
          <View style={estilos.espacioFooter} />
        </View>
      </ScrollView>

      {/* FOOTER CON BOTONES */}
  <SafeAreaView
  edges={["bottom"]}
  style={estilos.footerSafe}
>
  <View style={estilos.footer}>
    <View style={estilos.footerContent}>
      <View style={estilos.cantidadContainer}>
        <Pressable
          style={({ pressed }) => [
            estilos.cantidadButton,
            pressed && estilos.buttonPressed,
            cantidad <= 1 && estilos.cantidadButtonDisabled,
          ]}
          onPress={decrementarCantidad}
          disabled={cantidad <= 1}
        >
          <Ionicons
            name="remove"
            size={20}
            color={cantidad <= 1 ? "#444444" : "#FFFFFF"}
          />
        </Pressable>

        <Text style={estilos.cantidadTexto}>
          {cantidad}
        </Text>

        <Pressable
          style={({ pressed }) => [
            estilos.cantidadButton,
            pressed && estilos.buttonPressed,
            cantidad >= producto.stock &&
              estilos.cantidadButtonDisabled,
          ]}
          onPress={incrementarCantidad}
          disabled={cantidad >= producto.stock}
        >
          <Ionicons
            name="add"
            size={20}
            color={
              cantidad >= producto.stock
                ? "#444444"
                : "#FFFFFF"
            }
          />
        </Pressable>
      </View>

   <Animated.View
  style={{
    flex: 1,
    transform: [
      {
        scale: escalaCarrito,
      },
    ],
  }}
>
  <Pressable
    style={({ pressed }) => [
      estilos.botonCarrito,
      pressed && estilos.buttonPressed,
      producto.stock <= 0 &&
        estilos.botonDeshabilitado,
    ]}
    disabled={producto.stock <= 0}
 onPress={() => {

if(usuario){

 agregarCarrito(
    {
      ...producto,
      cantidad,
      precio:precioActual,
      imagen:producto.imagen
    },
    usuario.uid
 );

 Alert.alert(
   "Carrito",
   "Producto agregado correctamente"
 );

}

}} >
    <Ionicons
      name="cart-outline"
      size={22}
      color="#000000"
    />

    <Text style={estilos.botonCarritoTexto}>
      Agregar
    </Text>

    <View style={estilos.precioTotalContainer}>
      <Text style={estilos.precioTotal}>
        {formatearPrecio(precioActual * cantidad)}
      </Text>
    </View>
  </Pressable>
</Animated.View>
   
     </View>
  </View>
</SafeAreaView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000000",
  },

  scrollContent: {
    paddingBottom: 100,
  },

  // HEADER
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },

  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  headerTitulo: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  headerSpacer: {
    width: 40,
  },

  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },

  // IMAGEN
  imagenContainer: {
    height: 320,
    margin: 16,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },

  slide: {
  width: width - 32,
  height: 320,
  justifyContent: "center",
  alignItems: "center",
},

contadorImagen: {
  position: "absolute",
  bottom: 12,
  right: 12,
  backgroundColor: "rgba(0, 0, 0, 0.75)",
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 8,
},

contadorTexto: {
  color: "#FFFFFF",
  fontSize: 12,
  fontWeight: "bold",
},

  imagen: {
    width: "90%",
    height: "90%",
  },

  imagenPlaceholder: {
    alignItems: "center",
    gap: 10,
  },

  imagenPlaceholderText: {
    color: "#444444",
    fontSize: 14,
  },

  badge: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "#d7d4d4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  badgeText: {
    color: "#000000",
    fontSize: 10,
    fontWeight: "bold",
  },

  badgeOferta: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

  badgeOfertaText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
  },

  // INFORMACIÓN
  informacion: {
    paddingHorizontal: 20,
  },

  tituloContainer: {
    gap: 6,
  },

  nombre: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },

  modeloContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  modelo: {
    color: "#666666",
    fontSize: 14,
  },

  // PRECIO Y FAVORITO
  precioFavoritoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
  },

  precioWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  precio: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
  },

  precioAnterior: {
    color: "#555555",
    fontSize: 17,
    textDecorationLine: "line-through",
  },

  favoritoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  descuentoBadge: {
    backgroundColor: "#1A1A1A",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 8,
  },

  descuentoText: {
    color: "#AAAAAA",
    fontSize: 12,
    fontWeight: "500",
  },

  // STOCK
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    gap: 10,
  },

  stockIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  stockDisponible: {
    backgroundColor: "#22c55e",
  },

  stockAgotado: {
    backgroundColor: "#ef4444",
  },

  stockTexto: {
    color: "#AAAAAA",
    fontSize: 14,
  },

  // SEPARADOR
  separador: {
    height: 1,
    backgroundColor: "#1A1A1A",
    marginVertical: 20,
  },

  // DESCRIPCIÓN
  descripcionSection: {
    gap: 10,
  },

  seccionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  tituloSeccion: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },

  descripcion: {
    color: "#AAAAAA",
    fontSize: 15,
    lineHeight: 24,
  },

  // INFORMACIÓN EXTRA
  infoCard: {
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    padding: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },

  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },

  infoDivider: {
    height: 1,
    backgroundColor: "#1A1A1A",
    marginVertical: 12,
  },

  infoLabel: {
    color: "#666666",
    fontSize: 12,
  },

  infoValor: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },

  espacioFooter: {
    height: 30,
  },

footerSafe: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "#000000",
},

footer: {
  backgroundColor: "#000000",
  borderTopWidth: 1,
  borderTopColor: "#1A1A1A",
  paddingHorizontal: 20,
  paddingTop: 12,
  paddingBottom: 12,
},

  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  cantidadContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    overflow: "hidden",
  },

  cantidadButton: {
    width: 40,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },

  cantidadButtonDisabled: {
    opacity: 0.4,
  },

  cantidadTexto: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    width: 35,
    textAlign: "center",
  },

  botonCarrito: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  botonCarritoTexto: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
  },

  precioTotalContainer: {
    backgroundColor: "#E8E8E8",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  precioTotal: {
    color: "#000000",
    fontSize: 13,
    fontWeight: "bold",
  },

  botonDeshabilitado: {
    opacity: 0.4,
  },

  // CARGANDO
  cargandoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  cargandoTexto: {
    color: "#AAAAAA",
    marginTop: 15,
    fontSize: 14,
  },

  // ERROR
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1A1A1A",
  },

  errorTitulo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },

  errorTexto: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },

  botonRegresar: {
    marginTop: 25,
    backgroundColor: "#FFFFFF",
    height: 50,
    paddingHorizontal: 25,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  botonRegresarTexto: {
    color: "#000000",
    fontSize: 15,
    fontWeight: "bold",
  },

miniaturasContainer: {
  paddingHorizontal: 16,
  paddingVertical: 10,
  gap: 10,
},

miniatura: {
  width: 75,
  height: 75,
  borderRadius: 12,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#1A1A1A",
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
  padding: 5,
},

miniaturaSeleccionada: {
  borderColor: "#FFFFFF",
  borderWidth: 2,
},

miniaturaImagen: {
  width: "100%",
  height: "100%",
},
});