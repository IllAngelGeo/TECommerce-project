import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import MenuLateral from "../../../../components/MenuLateral";
import { API_URL } from "../../../constants/api_url";

interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  fecha_creacion: string;
}

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    obtenerCategorias();
  }, []);

  const obtenerCategorias = async () => {
    try {
      setCargando(true);
      const response = await fetch(`${API_URL}/categorias`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setCategorias(data);
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar las categorías");
    } finally {
      setCargando(false);
    }
  };

  const eliminarCategoria = (id: number, nombre: string) => {
    Alert.alert("Eliminar categoría", `¿Deseas eliminar "${nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: () => confirmarEliminar(id) },
    ]);
  };

  const confirmarEliminar = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/categorias/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error();
      setCategorias((categoriasActuales) =>
        categoriasActuales.filter((c) => c.id_categoria !== id)
      );
      Alert.alert("Correcto", "Categoría eliminada");
    } catch (error) {
      Alert.alert("Error", "No se pudo eliminar");
    }
  };

  const categoriasFiltradas = useMemo(() => {
    return categorias.filter((c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase().trim())
    );
  }, [categorias, busqueda]);

  const renderCategoria = ({ item }: { item: Categoria }) => {
    return (
      <View style={estilos.card}>
        <View style={estilos.cardContent}>
          <View style={estilos.cardHeader}>
            <Text style={estilos.nombre}>{item.nombre}</Text>
            <View style={[estilos.statusBadge, item.activo ? estilos.activeBadge : estilos.inactiveBadge]}>
              <Text style={estilos.statusText}>
                {item.activo ? "Activo" : "Inactivo"}
              </Text>
            </View>
          </View>
          
          <Text style={estilos.descripcion}>
            {item.descripcion || "Sin descripción"}
          </Text>

          <View style={estilos.cardFooter}>
            <View style={estilos.fechaContainer}>
              <Ionicons name="calendar-outline" size={12} color="#666" />
              <Text style={estilos.fechaText}>
                {new Date(item.fecha_creacion).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        <View style={estilos.acciones}>
          <Pressable
            style={[estilos.boton, estilos.editarBoton]}
            onPress={() =>
              router.push({
                pathname: "/cap-presentation/Views/admin/Categoria/EditarCategoria",
                params: { id: item.id_categoria },
              })
            }
          >
            <Ionicons name="create-outline" size={18} color="#FFF" />
          </Pressable>

          <Pressable
            style={[estilos.boton, estilos.eliminarBoton]}
            onPress={() => eliminarCategoria(item.id_categoria, item.nombre)}
          >
            <Ionicons name="trash-outline" size={18} color="#FFF" />
          </Pressable>
        </View>
      </View>
    );
  };

  if (cargando) {
    return (
      <View style={estilos.safe}>
        <View style={estilos.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={estilos.cargando}>Cargando categorías...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={estilos.safe}>
      <View style={estilos.header}>
        <View style={estilos.headerIzq}>
          <Pressable style={estilos.menu} onPress={() => setMenuVisible(true)}>
            <Ionicons name="menu" size={24} color="#FFF" />
          </Pressable>
          <Text style={estilos.titulo}>Categorías</Text>
        </View>

        <Pressable style={estilos.nuevo} onPress={() =>
          router.push("/cap-presentation/Views/admin/Categoria/CrearCategoria")
        }>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={estilos.nuevoTexto}>Nueva</Text>
        </Pressable>
      </View>

      <View style={estilos.buscar}>
        <Ionicons name="search-outline" size={20} color="#666" />
        <TextInput
          placeholder="Buscar categoría..."
          placeholderTextColor="#666"
          style={estilos.input}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <Pressable onPress={() => setBusqueda("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </Pressable>
        )}
      </View>

      <View style={estilos.contador}>
        <Text style={estilos.contadorTexto}>
          {categoriasFiltradas.length} categorías encontradas
        </Text>
      </View>

      {categoriasFiltradas.length === 0 ? (
        <ScrollView contentContainerStyle={estilos.vacio}>
          <View style={estilos.vacioIcon}>
            <Ionicons name="grid-outline" size={60} color="#333" />
          </View>
          <Text style={estilos.vacioTitulo}>No hay categorías</Text>
          <Text style={estilos.vacioSubtitulo}>
            Crea una nueva categoría para comenzar
          </Text>
        </ScrollView>
      ) : (
        <FlatList
          data={categoriasFiltradas}
          keyExtractor={(item) => String(item.id_categoria)}
          renderItem={renderCategoria}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={estilos.listContainer}
        />
      )}

      <MenuLateral
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        seccionActual="categorias"
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#1A1A1A",
  },
  headerIzq: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menu: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
  },
  titulo: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },
  nuevo: {
    backgroundColor: "#4F46E5",
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  nuevoTexto: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  buscar: {
    marginHorizontal: 20,
    marginTop: 16,
    height: 48,
    backgroundColor: "#0A0A0A",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    gap: 10,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },
  contador: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  contadorTexto: {
    color: "#666666",
    fontSize: 13,
    fontWeight: "500",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#0A0A0A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    marginRight: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  nombre: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 10,
  },
  activeBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
  },
  inactiveBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  descripcion: {
    color: "#666666",
    fontSize: 13,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  fechaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fechaText: {
    color: "#555555",
    fontSize: 11,
  },
  acciones: {
    flexDirection: "row",
    gap: 8,
  },
  boton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  editarBoton: {
    backgroundColor: "rgba(79, 70, 229, 0.2)",
  },
  eliminarBoton: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  cargando: {
    color: "#666666",
    marginTop: 15,
    fontSize: 14,
  },
  vacio: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  vacioIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  vacioTitulo: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  vacioSubtitulo: {
    color: "#666666",
    fontSize: 14,
    textAlign: "center",
  },
});