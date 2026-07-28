import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
  Dimensions,
  Animated,
  Platform, Pressable
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MenuLateral from "../components/MenuLateral";


const API_URL = "http://192.168.0.86:8080";
const { width } = Dimensions.get("window");

interface Producto {
  id_producto: string;
  nombre: string;
  precio: number;
  precio_oferta?: number | null;
  stock?: number;
  stock_minimo?: number;
  id_categoria?: number;
}

interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
}

export default function AdminHome() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [nombreUsuario, setNombreUsuario] = useState("Admin");
   const [menuVisible, setMenuVisible] = useState(false);
  
   useEffect(() => {
  obtenerDatos();
  cargarNombreUsuario();

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 800,
    useNativeDriver: true,
  }).start();
}, []);


const cargarNombreUsuario = async () => {
  const nombre = await AsyncStorage.getItem("nombreUsuario");

  if (nombre) {
    setNombreUsuario(nombre);
  }
};

  const obtenerDatos = async () => {
    try {
      setActualizando(true);
      
      // Obtener productos y categorías en paralelo
      const [productosResponse, categoriasResponse] = await Promise.all([
        fetch(`${API_URL}/productos`),
        fetch(`${API_URL}/categorias`),
      ]);

      const productosData = await productosResponse.json();
      const categoriasData = await categoriasResponse.json();

      // Procesar productos
      let productosArray: Producto[] = [];
      if (Array.isArray(productosData)) {
        productosArray = productosData;
      } else if (Array.isArray(productosData.productos)) {
        productosArray = productosData.productos;
      } else if (Array.isArray(productosData.data)) {
        productosArray = productosData.data;
      }

      // Procesar categorías
      let categoriasArray: Categoria[] = [];
      if (Array.isArray(categoriasData)) {
        categoriasArray = categoriasData;
      } else if (Array.isArray(categoriasData.categorias)) {
        categoriasArray = categoriasData.categorias;
      } else if (Array.isArray(categoriasData.data)) {
        categoriasArray = categoriasData.data;
      }

      setProductos(productosArray);
      setCategorias(categoriasArray);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los datos");
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  // Estadísticas
  const totalProductos = productos.length;
  const stockTotal = productos.reduce(
    (total, producto) => total + Number(producto.stock || 0),
    0
  );
  const stockBajo = productos.filter(
    (producto) =>
      Number(producto.stock || 0) <= Number(producto.stock_minimo || 0)
  ).length;
  const productosOferta = productos.filter(
    (producto) =>
      producto.precio_oferta !== null &&
      producto.precio_oferta !== undefined &&
      Number(producto.precio_oferta) > 0
  ).length;
  const valorInventario = productos.reduce(
    (total, producto) => total + (Number(producto.precio) * Number(producto.stock || 0)),
    0
  );

  // Datos para el gráfico circular de categorías
 const categoriasData = () => {
  const categoriaCount = new Map<number, number>();

  productos.forEach((producto) => {
    if (producto.id_categoria) {
      const count = categoriaCount.get(producto.id_categoria) || 0;
      categoriaCount.set(producto.id_categoria, count + 1);
    }
  });

  const colors = [
    "#4ECDC4",
    "#FF6B6B",
    "#FFE66D",
    "#A8E6CF",
    "#FF8A5C",
    "#6C5CE7",
    "#FD79A8",
    "#00CEC9",
  ];

  const data = Array.from(categoriaCount.entries()).map(
    ([id, count], index) => {

      const categoria = categorias.find(
        (c) => Number(c.id_categoria) === Number(id)
      );

      return {
        name: categoria ? categoria.nombre : "Sin categoría",
        population: count,
        color: colors[index % colors.length],
        legendFontColor: "#FFFFFF",
        legendFontSize: 12,
      };
    }
  );

  if (data.length === 0) {
    return [
      {
        name: "Sin categoría",
        population: productos.length || 1,
        color: "#666666",
        legendFontColor: "#FFFFFF",
        legendFontSize: 12,
      },
    ];
  }

  return data;
};
  if (cargando) {
    return (
      <SafeAreaView style={styles.loading}>
        <LinearGradient
          colors={["#0A0A0A", "#1A1A1A"]}
          style={styles.loadingGradient}
        >
          <ActivityIndicator size="large" color="#4ECDC4" />
          <Text style={styles.loadingText}>Cargando dashboard...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const pieData = categoriasData();




  return (
    <SafeAreaView style={styles.container}>

        <MenuLateral
  visible={menuVisible}
  onClose={() => setMenuVisible(false)}
  seccionActual="dashboard"
/>


      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* ENCABEZADO */}

          <View style={styles.header}>
         
            <View>
   <Pressable onPress={() => setMenuVisible(true)}>
  <Ionicons
    name="menu-outline"
    size={30}
    color="#FFFFFF"
  />
</Pressable>

            <Text style={styles.greeting}> Hola, {nombreUsuario}</Text>              
            <Text style={styles.title}>Resumen</Text>
          </View>

            <View style={styles.headerActions}>
              {/* BOTÓN ACTUALIZAR */}
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={obtenerDatos}
                disabled={actualizando}
                activeOpacity={0.7}
              >
                {actualizando ? (
                  <ActivityIndicator size="small" color="#4ECDC4" />
                ) : (
                  <Ionicons name="refresh-outline" size={22} color="#4ECDC4" />
                )}
              </TouchableOpacity>

              {/* BOTÓN CERRAR SESIÓN */}
              <TouchableOpacity
                style={styles.logout}
                onPress={() =>
                  Alert.alert(
                    "Cerrar sesión",
                    "¿Quieres cerrar la sesión?",
                    [
                      { text: "Cancelar", style: "cancel" },
                      { 
                        text: "Cerrar sesión", 
                        onPress: () => router.replace("/cap-presentation/Views/Login") 
                      },
                    ]
                  )
                }
              >
                <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* TARJETAS PRINCIPALES */}
          <View style={styles.cardsGrid}>
            <LinearGradient
              colors={["#4ECDC4", "#00A896"]}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="cube-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.cardNumber}>{totalProductos}</Text>
              <Text style={styles.cardLabel}>Productos</Text>
            </LinearGradient>

            <LinearGradient
              colors={["#3A506B", "#1C2541"]}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="layers-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.cardNumber}>{stockTotal}</Text>
              <Text style={styles.cardLabel}>Stock total</Text>
            </LinearGradient>

            <LinearGradient
              colors={["#FF6B6B", "#C44536"]}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="warning-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.cardNumber}>{stockBajo}</Text>
              <Text style={styles.cardLabel}>Stock bajo</Text>
            </LinearGradient>

            <LinearGradient
              colors={["#F6BD60", "#E09F3E"]}
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="pricetag-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.cardNumber}>{productosOferta}</Text>
              <Text style={styles.cardLabel}>En oferta</Text>
            </LinearGradient>
          </View>

          {/* TARJETA DE VALOR */}
          <LinearGradient
            colors={["#2D1B69", "#1A0F3D"]}
            style={styles.valueCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View>
              <Text style={styles.valueLabel}> Valor del inventario</Text>
              <Text style={styles.valueAmount}>
                ${valorInventario.toLocaleString("es-MX", { 
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2 
                })}
              </Text>
            </View>
            <View style={styles.valueIcon}>
              <Ionicons name="cash-outline" size={32} color="#4ECDC4" />
            </View>
          </LinearGradient>

          {/* GRÁFICO CIRCULAR DE CATEGORÍAS */}
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Productos por categoría</Text>
            
            {totalProductos > 0 ? (
              <>
                <PieChart
                  data={pieData}
                  width={width - 60}
                  height={180}
                  chartConfig={{
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
                
                <View style={styles.legendContainer}>
                  {pieData.map((item, index) => (
                    <View key={index} style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: item.color }]} />
                      <Text style={styles.legendText}>
                        {item.name}: {item.population}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No hay datos para mostrar</Text>
              </View>
            )}
          </View>

          <Text style={styles.footer}>
            Última actualización: {new Date().toLocaleTimeString()}
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: "#0A0A0A",
  paddingTop: Platform.OS === 'ios' ? 30 : 40,
},

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  loading: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  loadingGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: "#FFFFFF",
    marginTop: 12,
    fontSize: 15,
    opacity: 0.6,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 28,
  },

  greeting: {
    color: "#4ECDC4",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
    marginTop: 12
  },

  title: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },

  subtitle: {
    color: "#666666",
    fontSize: 14,
    marginTop: 4,
  },

  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(78, 205, 196, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(78, 205, 196, 0.2)",
  },

  logout: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  card: {
    width: "48%",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  cardNumber: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "bold",
  },

  cardLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    marginTop: 2,
  },

  valueCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  valueLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    marginBottom: 4,
  },

  valueAmount: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "bold",
  },

  valueIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "rgba(78, 205, 196, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  chartContainer: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },

  chartTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 16,
    alignSelf: "flex-start",
  },

  noDataContainer: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },

  noDataText: {
    color: "#666666",
    fontSize: 14,
  },

  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 12,
    gap: 8,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 4,
  },

  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },

  legendText: {
    color: "#CCCCCC",
    fontSize: 12,
  },

  footer: {
    textAlign: "center",
    color: "#444444",
    fontSize: 12,
    marginTop: 4,
  },
});