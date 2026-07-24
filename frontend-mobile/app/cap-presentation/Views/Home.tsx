import React, { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MenuLateral from "../components/MenuLateral";
import { API_URL } from "../constants/api_url";
import { Boton } from "../components/botones";

export default function DevolverHome() {


  const { categoria } = useLocalSearchParams();

  // ESTADOS
  const [productos, setProductos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [precioMaximo, setPrecioMaximo] = useState("");
  const [ordenPrecio, setOrdenPrecio] = useState<"ninguno" | "menor" | "mayor">("ninguno");

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(0);

  useEffect(() => {
    obtenerProductos();
    obtenerCategorias();
  }, []);

  // RECIBIR CATEGORÍA DESDE CATEGORIAS.TSX

  useEffect(() => {
    if (categoria) {
      setCategoriaSeleccionada(Number(categoria));
    } else {
      setCategoriaSeleccionada(0);
    }
  }, [categoria]);

  // OBTENER PRODUCTOS

  const obtenerProductos = async () => {
    try {
      setCargando(true);

      console.log("Consultando productos...");

      const response = await fetch(`${API_URL}/productos`);

      console.log("Status productos:", response.status);

      const texto = await response.text();

      console.log("Respuesta productos:", texto);

      if (!response.ok) {
        throw new Error(
          `Error al obtener los productos: ${response.status}`
        );
      }

      const data = JSON.parse(texto);

      setProductos(data);

    } catch (error) {
      console.error(
        "Error obteniendo productos:",
        error
      );
    } finally {
      setCargando(false);
    }
  };

  // OBTENER CATEGORÍAS
  const obtenerCategorias = async () => {
    try {
      console.log("Consultando categorías...");

      const response = await fetch(
        `${API_URL}/categorias`
      );

      console.log(
        "Status categorías:",
        response.status
      );

      const texto = await response.text();

      console.log(
        "Respuesta categorías:",
        texto
      );

      if (!response.ok) {
        throw new Error(
          `Error al obtener las categorías: ${response.status}`
        );
      }

      const data = JSON.parse(texto);

      setCategorias(data);

    } catch (error) {
      console.error(
        "Error obteniendo categorías:",
        error
      );
    }
  };

  // FILTRAR PRODUCTOS
  const productosFiltrados = productos.filter((producto) => {
    const textoBusqueda = busqueda.toLowerCase().trim();

    const coincideBusqueda =
      producto.nombre?.toLowerCase().includes(textoBusqueda) ||
      producto.modelo?.toLowerCase().includes(textoBusqueda) ||
      producto.descripcion?.toLowerCase().includes(textoBusqueda);

    const coincideCategoria = categoriaSeleccionada === 0 || producto.id_categoria === categoriaSeleccionada;

    const precioProducto = producto.precio_oferta ?? producto.precio;

    const coincidePrecio = precioMaximo === "" || precioProducto <= Number(precioMaximo);

    return coincideBusqueda && coincideCategoria && coincidePrecio;
  })

    .sort((a, b) => {
      const precioA = a.precio_oferta ?? a.precio;
      const precioB = b.precio_oferta ?? b.precio;

      if (ordenPrecio === "menor") {
        return precioA - precioB;
      }
      if (ordenPrecio === "mayor") {
        return precioB - precioA;
      }

      return 0;
    });

  // PRODUCTOS DESTACADOS

  const productosMasVendidos =
    useMemo(() => {
      return productosFiltrados.filter(
        (producto) =>
          producto.destacado === true
      );

    }, [productosFiltrados]);

  // FORMATEAR PRECIO
  const formatearPrecio = (precio: number) => {
    return `$${precio.toLocaleString(
      "es-MX"
    )}`;

  };


  return (
    <SafeAreaView style={estilos.safe}>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={estilos.contenido}>

        {/* HEADER */}

        <View style={estilos.header}>
          <View style={estilos.logoContainer}>
            <View style={estilos.logoCircle}>
              <Text style={estilos.logoText}> T </Text>
            </View>
            <Text style={estilos.logoNombre}> TeCommerce </Text>
          </View>

          <View style={estilos.headerIcons}>
            <Pressable style={estilos.iconButton} >
              <Ionicons name="notifications-outline" size={23} color="#FFFFFF" />
            </Pressable>

            <Pressable style={estilos.iconButton} onPress={() => setMenuVisible(true)}>
              <Ionicons name="menu-outline" size={25} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* BUSCADOR */}

        <View style={estilos.searchContainer}>
          <Ionicons name="search-outline" size={21} color="#888888" />
          <TextInput style={estilos.searchInput} placeholder="Buscar productos..." placeholderTextColor="#777777" value={busqueda} onChangeText={setBusqueda} />
          <Pressable onPress={() => setMostrarFiltros(true)}>
            <Ionicons name="options-outline" size={21} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* BANNER  */}
        <View style={estilos.banner}>
          <View style={estilos.bannerTextContainer} >
            <Text style={estilos.bannerSmall} > OFERTA ESPECIAL </Text>
            <Text style={estilos.bannerTitle} > HASTA 30% </Text>
            <Text style={estilos.bannerSubtitle}> DE DESCUENTO </Text>
            <Boton titulo="Comprar ahora" color="#FFFFFF" textColor="black" width={160} height={40} style={{ marginTop: 10,  }} onPress={() => { router.push("/cap-presentation/Views/Productos"); }} />
          </View>

          <View style={estilos.bannerIcon} >
            <Ionicons name="bag-handle-outline" size={80} color="#FFFFFF" />
          </View>
        </View>

        {/* CATEGORÍAS */}
        <View style={estilos.sectionHeader}>
          <Text style={estilos.sectionTitle}> Categorías </Text>
          <Boton titulo="Ver todas" color="transparent" textColor="#FFFFFF" width={80} height={40} style={{ marginLeft: "auto" }} onPress={() => { router.push("/cap-presentation/Views/Categorias"); }} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={estilos.categoriasScroll}>

          {/* BOTÓN TODOS */}
          <Pressable onPress={() => { setCategoriaSeleccionada(0); }}
            style={[estilos.categoria, categoriaSeleccionada === 0 && estilos.categoriaActiva,]} >
            <Text style={[estilos.categoriaText, categoriaSeleccionada === 0 && estilos.categoriaTextActiva,]}> Todos </Text>
          </Pressable>

          {/* LISTA DE CATEGORÍAS */}

          {categorias.map((categoriaItem) => (
            <Pressable key={categoriaItem.id_categoria} onPress={() => {
              setCategoriaSeleccionada(
                categoriaItem.id_categoria
              );
            }}
              style={[estilos.categoria, categoriaSeleccionada === categoriaItem.id_categoria && estilos.categoriaActiva,]}>
              <Text style={[estilos.categoriaText, categoriaSeleccionada === categoriaItem.id_categoria && estilos.categoriaTextActiva,]}>{categoriaItem.nombre}</Text>
            </Pressable>
          )
          )}
        </ScrollView>

        {/* MÁS VENDIDOS */}

        <View style={estilos.sectionHeader} >
          <Text style={estilos.sectionTitle} > Más vendidos </Text>
        </View>

        {cargando ? (
          <Text style={estilos.mensaje} > Cargando productos... </Text>
        ) : productosMasVendidos.length === 0 ? (

          <Text style={estilos.mensaje} > No hay productos destacados en esta categoría. </Text>

        ) : (

          <ScrollView horizontal showsHorizontalScrollIndicator={false} >

            {productosMasVendidos.map((producto) => (

              <Pressable key={producto.id_producto} style={estilos.productCard}>
                <View style={estilos.productImageContainer}>
                  <View style={estilos.badge}>
                    <Text style={estilos.badgeText}>Más vendido </Text>
                  </View>

                  <Pressable style={estilos.favoriteButton}>
                    <Ionicons name="heart-outline" size={18} color="#FFFFFF" />
                  </Pressable>

                  {producto.imagen ? (
                    <Image source={{ uri: producto.imagen, }} style={estilos.productImage} resizeMode="contain" />

                  ) : (
                    <Ionicons name="image-outline" size={60} color="#555555" />

                  )}

                </View>

                <Text style={estilos.productName} numberOfLines={1} > {producto.nombre} </Text>
                <Text style={estilos.productCategory}> Modelo:{" "} {producto.modelo} </Text>
                <View style={estilos.priceContainer} >
                  <Text style={estilos.price} > {
                    formatearPrecio(
                      producto.precio_oferta ??
                      producto.precio
                    )
                  }
                  </Text>

                  {producto.precio_oferta && (
                    <Text style={estilos.oldPrice}> {formatearPrecio(producto.precio)} </Text>
                  )}
                </View>
              </Pressable>

            )
            )}

          </ScrollView>

        )}

        {/* PRODUCTOS */}

        <View style={estilos.sectionHeader}>
          <Text style={estilos.sectionTitle}> Productos </Text>
          <Boton titulo="Ver más" color="transparent" textColor="#FFFFFF" width={80} height={40} style={{ marginLeft: "auto" }} onPress={() => { router.push("/cap-presentation/Views/Productos"); }} />
        </View>

        {cargando ? (
          <Text style={estilos.mensaje} > Cargando productos... </Text>

        ) : productosFiltrados.length === 0 ? (

          <View style={estilos.sinProductos} >
            <Ionicons name="search-outline" size={45} color="#555555" />
            <Text style={estilos.mensaje} > No encontramos productos. </Text>
            <Text style={estilos.mensajeSecundario} > Intenta con otra búsqueda o categoría. </Text>
          </View>

        ) : (

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {productosFiltrados.map(
              (producto) => (

                <Pressable key={producto.id_producto} style={estilos.productCard}>

                  <View style={estilos.productImageContainer} >

                    <Pressable
                      style={
                        estilos.favoriteButton
                      }
                    >

                      <Ionicons
                        name="heart-outline"
                        size={18}
                        color="#FFFFFF"
                      />

                    </Pressable>

                    {producto.imagen ? (

                      <Image
                        source={{
                          uri:
                            producto.imagen,
                        }}
                        style={
                          estilos.productImage
                        }
                        resizeMode="contain"
                      />

                    ) : (

                      <Ionicons
                        name="image-outline"
                        size={60}
                        color="#555555"
                      />

                    )}

                  </View>

                  <Text
                    style={
                      estilos.productName
                    }
                    numberOfLines={1}
                  >
                    {
                      producto.nombre
                    }
                  </Text>

                  <Text
                    style={
                      estilos.productCategory
                    }
                  >
                    Modelo:{" "}
                    {
                      producto.modelo
                    }
                  </Text>

                  <View
                    style={
                      estilos.priceContainer
                    }
                  >

                    <Text
                      style={
                        estilos.price
                      }
                    >
                      {
                        formatearPrecio(
                          producto.precio_oferta ??
                          producto.precio
                        )
                      }
                    </Text>

                    {producto.precio_oferta && (

                      <Text
                        style={
                          estilos.oldPrice
                        }
                      >
                        {
                          formatearPrecio(
                            producto.precio
                          )
                        }
                      </Text>

                    )}

                  </View>

                </Pressable>

              )
            )}

          </ScrollView>

        )}

      </ScrollView>


      {/* MENÚ LATERAL */}
      <MenuLateral
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        seccionActual="inicio"
      />


      {mostrarFiltros && (
        <View style={estilos.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setMostrarFiltros(false)}
          />

          <View style={estilos.filtroModal}>
            <View style={estilos.filtroHeader}>
              <Text style={estilos.filtroTitulo}>
                Filtrar productos
              </Text>

              <Pressable
                onPress={() => setMostrarFiltros(false)}
              >
                <Ionicons
                  name="close"
                  size={25}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>

            <Text style={estilos.filtroLabel}>
              Precio máximo
            </Text>

            <TextInput
              style={estilos.precioInput}
              placeholder="Ej. 10000"
              placeholderTextColor="#777777"
              keyboardType="numeric"
              value={precioMaximo}
              onChangeText={setPrecioMaximo}
            />

            <Text style={estilos.filtroLabel}>
              Ordenar por precio
            </Text>

            <View style={estilos.ordenContainer}>
              <Pressable
                style={[
                  estilos.ordenButton,
                  ordenPrecio === "menor" &&
                  estilos.ordenButtonActivo,
                ]}
                onPress={() => setOrdenPrecio("menor")}
              >
                <Ionicons
                  name="arrow-down"
                  size={18}
                  color={
                    ordenPrecio === "menor"
                      ? "#000000"
                      : "#FFFFFF"
                  }
                />

                <Text
                  style={[
                    estilos.ordenText,
                    ordenPrecio === "menor" &&
                    estilos.ordenTextActivo,
                  ]}
                >
                  Menor precio
                </Text>
              </Pressable>

              <Pressable
                style={[
                  estilos.ordenButton,
                  ordenPrecio === "mayor" &&
                  estilos.ordenButtonActivo,
                ]}
                onPress={() => setOrdenPrecio("mayor")}
              >
                <Ionicons
                  name="arrow-up"
                  size={18}
                  color={
                    ordenPrecio === "mayor"
                      ? "#000000"
                      : "#FFFFFF"
                  }
                />

                <Text
                  style={[
                    estilos.ordenText,
                    ordenPrecio === "mayor" &&
                    estilos.ordenTextActivo,
                  ]}
                >
                  Mayor precio
                </Text>
              </Pressable>
            </View>

            <View style={estilos.filtroActions}>
              <Pressable
                style={estilos.limpiarButton}
                onPress={() => {
                  setPrecioMaximo("");
                  setOrdenPrecio("ninguno");
                }}
              >
                <Text style={estilos.limpiarText}>
                  Limpiar
                </Text>
              </Pressable>

              <Pressable
                style={estilos.aplicarButton}
                onPress={() => setMostrarFiltros(false)}
              >
                <Text style={estilos.aplicarText}>
                  Aplicar filtros
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {/* =====================================
          BOTÓN CARRITO
      ====================================== */}

      <Pressable
        style={
          estilos.cartButton
        }
      >

        <Ionicons
          name="cart-outline"
          size={26}
          color="#000000"
        />

        <View
          style={
            estilos.cartBadge
          }
        >

          <Text
            style={
              estilos.cartBadgeText
            }
          >
            0
          </Text>

        </View>

      </Pressable>

    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: "#000000",
  },

  contenido: {
    paddingHorizontal: 18,
    paddingBottom: 100,
  },

  // ==========================================
  // HEADER
  // ==========================================

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 15,
  },

  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  logoText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000000",
  },

  logoNombre: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 10,
  },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconButton: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },

  // ==========================================
  // BUSCADOR
  // ==========================================

  searchContainer: {
    height: 50,
    borderRadius: 12,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#2D2D2D",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 20,
  },

  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: 10,
  },

  // ==========================================
  // BANNER
  // ==========================================

  banner: {
    height: 165,
    borderRadius: 18,
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 25,
  },

  bannerTextContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },

  bannerSmall: {
    color: "#AAAAAA",
    fontSize: 11,
    fontWeight: "bold",
    letterSpacing: 1,
  },

  bannerTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5,
  },

  bannerSubtitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },

  bannerButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    marginTop: 12,
  },

  bannerButtonText: {
    color: "#000000",
    fontSize: 11,
    fontWeight: "bold",
  },

  bannerIcon: {
    width: 120,
    justifyContent: "center",
    alignItems: "center",
  },

  // ==========================================
  // SECCIONES
  // ==========================================

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 5,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  verMas: {
    color: "#AAAAAA",
    fontSize: 13,
  },

  // ==========================================
  // CATEGORÍAS
  // ==========================================

  categoriasScroll: {
    marginBottom: 25,
  },

  categoria: {
    backgroundColor: "#1A1A1A",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginRight: 8,
  },

  categoriaActiva: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },

  categoriaText: {
    color: "#AAAAAA",
    fontSize: 13,
    fontWeight: "600",
  },

  categoriaTextActiva: {
    color: "#000000",
  },

  // ==========================================
  // PRODUCTOS
  // ==========================================

  productCard: {
    width: 170,
    marginRight: 12,
    marginBottom: 25,
  },

  productImageContainer: {
    height: 170,
    backgroundColor: "#1A1A1A",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#2D2D2D",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },

  productImage: {
    width: "85%",
    height: "85%",
  },

  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 5,
    zIndex: 2,
  },

  badgeText: {
    color: "#000000",
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
  },

  productCategory: {
    color: "#888888",
    fontSize: 12,
    marginTop: 3,
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 7,
  },

  price: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 5,
  },

  oldPrice: {
    color: "#777777",
    fontSize: 11,
    textDecorationLine: "line-through",
  },

  // ==========================================
  // MENSAJES
  // ==========================================

  mensaje: {
    color: "#888888",
    fontSize: 14,
    marginBottom: 25,
  },

  sinProductos: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },

  mensajeSecundario: {
    color: "#555555",
    fontSize: 12,
    marginTop: -15,
  },

  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
    zIndex: 100,
  },

  filtroModal: {
    backgroundColor: "#151515",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 22,
    borderWidth: 1,
    borderColor: "#333333",
  },

  filtroHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  filtroTitulo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  filtroLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 10,
  },

  precioInput: {
    height: 50,
    backgroundColor: "#000000",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333333",
    color: "#FFFFFF",
    paddingHorizontal: 15,
    fontSize: 15,
  },

  ordenContainer: {
    flexDirection: "row",
    gap: 10,
  },

  ordenButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#333333",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  ordenButtonActivo: {
    backgroundColor: "#FFFFFF",
    borderColor: "#FFFFFF",
  },

  ordenText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  ordenTextActivo: {
    color: "#000000",
  },

  filtroActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 25,
  },

  limpiarButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#333333",
    justifyContent: "center",
    alignItems: "center",
  },

  limpiarText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  aplicarButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  aplicarText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "bold",
  },

  // ==========================================
  // CARRITO
  // ==========================================

  cartButton: {
    position: "absolute",
    right: 20,
    bottom: 25,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },

  cartBadge: {
    position: "absolute",
    right: -2,
    top: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#000000",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },

  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },

});
