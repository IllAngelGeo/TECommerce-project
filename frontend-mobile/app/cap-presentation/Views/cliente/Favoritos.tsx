import React, { useCallback, useEffect, useState } from "react";
import {
ActivityIndicator,
Alert,
Image,
Platform,
Pressable,
RefreshControl,
SafeAreaView,
ScrollView,
StatusBar,
StyleSheet,
Text,
View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { auth } from "../../../firebase/firebase";
import { API_URL } from "../../constants/api_url";

interface Favorito {
id_favorito: string;
id_usuario: string;
id_producto: string;
fecha_creacion: string;
nombre: string;
precio: number;
imagen?: string | null;
}

export default function Favoritos() {
const [favoritos, setFavoritos] = useState<Favorito[]>([]);
const [cargando, setCargando] = useState(true);
const [refrescando, setRefrescando] = useState(false);
const [eliminando, setEliminando] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
cargarFavoritos();
}, []);

// ==========================================
// CARGAR FAVORITOS
// ==========================================

const cargarFavoritos = async () => {
try {
setError(null);

  const usuario = auth.currentUser;

  if (!usuario) {
    setFavoritos([]);
    return;
  }

  const response = await fetch(
    `${API_URL}/favoritos/firebase/${usuario.uid}`
  );

  if (!response.ok) {
    throw new Error("No se pudieron obtener los favoritos");
  }

  const data = await response.json();

  setFavoritos(Array.isArray(data) ? data : []);
} catch (error) {
  console.error("Error cargando favoritos:", error);
  setError("No pudimos cargar tus favoritos.");
} finally {
  setCargando(false);
}


};

// ==========================================
// ACTUALIZAR
// ==========================================

const onRefresh = async () => {
setRefrescando(true);


try {
  await cargarFavoritos();
} finally {
  setRefrescando(false);
}

};

// ==========================================
// ELIMINAR FAVORITO
// ==========================================

const eliminarFavorito = useCallback(
async (idProducto: string) => {
try {
const usuario = auth.currentUser;


    if (!usuario) {
      return;
    }

    setEliminando(idProducto);

    const response = await fetch(
      `${API_URL}/favoritos/firebase/${usuario.uid}/producto/${idProducto}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      console.log("Error eliminando favorito:", data);

      Alert.alert(
        "No se pudo eliminar",
        "Ocurrió un problema al eliminar este producto de favoritos."
      );

      return;
    }

    // Eliminar inmediatamente de la interfaz
    setFavoritos((actuales) =>
      actuales.filter(
        (item) => String(item.id_producto) !== String(idProducto)
      )
    );
  } catch (error) {
    console.error("Error eliminando favorito:", error);

    Alert.alert(
      "Error",
      "No pudimos eliminar el producto de tus favoritos."
    );
  } finally {
    setEliminando(null);
  }
},
[]
);

// ==========================================
// CONFIRMAR ELIMINACIÓN
// ==========================================

const confirmarEliminacion = (idProducto: string, nombre: string) => {
Alert.alert(
"Eliminar de favoritos",
`¿Quieres quitar "${nombre}" de tus favoritos?`,
[
{
text: "Cancelar",
style: "cancel",
},
{
text: "Eliminar",
style: "destructive",
onPress: () => eliminarFavorito(idProducto),
},
]
);
};

// ==========================================
// FORMATEAR PRECIO
// ==========================================

const formatearPrecio = (precio: number) => {
return `$${Number(precio).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
};

// ==========================================
// LOADING
// ==========================================

if (cargando) {
return ( <SafeAreaView style={styles.container}> <StatusBar
       barStyle="light-content"
       backgroundColor="#000000"
     />


    <View style={styles.loadingContainer}>
      <View style={styles.loadingIcon}>
        <Ionicons
          name="heart"
          size={28}
          color="#FFFFFF"
        />
      </View>

      <ActivityIndicator
        size="small"
        color="#FFFFFF"
        style={styles.loadingSpinner}
      />

      <Text style={styles.loadingTitle}>
        Cargando favoritos
      </Text>

    </View>
  </SafeAreaView>
);


}

// ==========================================
// ERROR
// ==========================================

if (error) {
return ( <SafeAreaView style={styles.container}> <StatusBar
       barStyle="light-content"
       backgroundColor="#000000"
     />

    <View style={styles.header}>
      <Pressable
        style={({ pressed }) => [
          styles.backButton,
          pressed && styles.pressed,
        ]}
        onPress={() => router.back()}
      >
        <Ionicons
          name="arrow-back"
          size={22}
          color="#FFFFFF"
        />
      </Pressable>

      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>
          Mis favoritos
        </Text>
      </View>

      <View style={styles.headerPlaceholder} />
    </View>

    <View style={styles.errorContainer}>
      <View style={styles.errorIcon}>
        <Ionicons
          name="alert-outline"
          size={36}
          color="#FFFFFF"
        />
      </View>

      <Text style={styles.errorTitle}>
        Algo salió mal
      </Text>

      <Text style={styles.errorText}>
        {error}
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.retryButton,
          pressed && styles.pressed,
        ]}
        onPress={cargarFavoritos}
      >
        <Ionicons
          name="refresh-outline"
          size={18}
          color="#000000"
        />

        <Text style={styles.retryText}>
          Intentar nuevamente
        </Text>
      </Pressable>
    </View>
  </SafeAreaView>
);


}

// ==========================================
// VISTA PRINCIPAL
// ==========================================

return ( <SafeAreaView style={styles.container}> <StatusBar
     barStyle="light-content"
     backgroundColor="#000000"
   />

```
  {/* HEADER */}
  <View style={styles.header}>
    <Pressable
      style={({ pressed }) => [
        styles.backButton,
        pressed && styles.pressed,
      ]}
      onPress={() => router.back()}
    >
      <Ionicons
        name="arrow-back"
        size={22}
        color="#FFFFFF"
      />
    </Pressable>

    <View style={styles.headerTitleContainer}>
      <Text style={styles.headerTitle}>
        Mis favoritos
      </Text>

      {favoritos.length > 0 && (
        <Text style={styles.headerSubtitle}>
          {favoritos.length}{" "}
          {favoritos.length === 1
            ? "producto guardado"
            : "productos guardados"}
        </Text>
      )}
    </View>

    <View style={styles.headerCount}>
      <Ionicons
        name="heart"
        size={17}
        color="#FFFFFF"
      />

      <Text style={styles.headerCountText}>
        {favoritos.length}
      </Text>
    </View>
  </View>

  {/* CONTENIDO */}
  {favoritos.length === 0 ? (
    <ScrollView
      contentContainerStyle={styles.emptyScroll}
      refreshControl={
        <RefreshControl
          refreshing={refrescando}
          onRefresh={onRefresh}
          tintColor="#FFFFFF"
          colors={["#FFFFFF"]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.emptyContainer}>
        <View style={styles.emptyHeartContainer}>
          <View style={styles.emptyHeartCircle}>
            <Ionicons
              name="heart-outline"
              size={58}
              color="#FFFFFF"
            />
          </View>
        </View>

        <Text style={styles.emptyTitle}>
          Tu lista está vacía
        </Text>

        <Text style={styles.emptyText}>
          Guarda los productos que más te gusten
          para encontrarlos rápidamente después.
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.exploreButton,
            pressed && styles.pressed,
          ]}
          onPress={() =>
            router.push(
              "/cap-presentation/Views/cliente/Productos"
            )
          }
        >
          <Ionicons
            name="bag-handle-outline"
            size={19}
            color="#000000"
          />

          <Text style={styles.exploreButtonText}>
            Explorar productos
          </Text>
        </Pressable>

        <View style={styles.emptyHint}>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color="#666666"
          />

          <Text style={styles.emptyHintText}>
            Pulsa el corazón de un producto para
            guardarlo aquí.
          </Text>
        </View>
      </View>
    </ScrollView>
  ) : (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.listContent}
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
      {/* ENCABEZADO DE LISTA */}
      <View style={styles.listHeader}>
        <View>
          <Text style={styles.listTitle}>
            Tus productos
          </Text>

          <Text style={styles.listSubtitle}>
            Los productos que más te gustaron
          </Text>
        </View>

      </View>

      {/* TARJETAS */}
      {favoritos.map((item) => {
        const idProducto = String(item.id_producto);
        const estaEliminando =
          eliminando === idProducto;

        return (
          <Pressable
            key={idProducto}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() =>
              router.push({
                pathname:
                  "/cap-presentation/Views/cliente/DetalleProducto",
                params: {
                  id: idProducto,
                },
              })
            }
          >
            {/* IMAGEN */}
            <View style={styles.imageContainer}>
              {item.imagen ? (
                <Image
                  source={{
                    uri: item.imagen,
                  }}
                  style={styles.image}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons
                  name="image-outline"
                  size={45}
                  color="#444444"
                />
              )}

              <View style={styles.favoriteBadge}>
                <Ionicons
                  name="heart"
                  size={14}
                  color="#FFFFFF"
                />
              </View>
            </View>

            {/* INFORMACIÓN */}
            <View style={styles.info}>
              <View style={styles.productLabel}>
                <Ionicons
                  name="heart"
                  size={11}
                  color="#777777"
                />

                <Text style={styles.productLabelText}>
                  FAVORITO
                </Text>
              </View>

              <Text
                style={styles.name}
                numberOfLines={2}
              >
                {item.nombre}
              </Text>

              <Text style={styles.price}>
                {formatearPrecio(item.precio)}
              </Text>

              <View style={styles.detailHint}>
                <Text style={styles.detailHintText}>
                  Ver detalles
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={13}
                  color="#777777"
                />
              </View>
            </View>

            {/* ELIMINAR */}
            <Pressable
              style={({ pressed }) => [
                styles.deleteButton,
                estaEliminando &&
                  styles.deleteButtonLoading,
                pressed && styles.deleteButtonPressed,
              ]}
              disabled={estaEliminando}
              onPress={(event) => {
                event.stopPropagation();

                confirmarEliminacion(
                  idProducto,
                  item.nombre
                );
              }}
            >
              {estaEliminando ? (
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />
              ) : (
                <Ionicons
                  name="heart"
                  size={21}
                  color="#FFFFFF"
                />
              )}
            </Pressable>
          </Pressable>
        );
      })}

      {/* INFORMACIÓN FINAL */}
      <View style={styles.bottomInfo}>
        <Ionicons
          name="heart-outline"
          size={18}
          color="#555555"
        />

        <Text style={styles.bottomInfoText}>
          Puedes eliminar cualquier producto
          pulsando el corazón.
        </Text>
      </View>

      <View style={styles.footerSpace} />
    </ScrollView>
  )}
</SafeAreaView>


);
}

const styles = StyleSheet.create({
// ==========================================
// CONTENEDOR
// ==========================================

container: {
flex: 1,
backgroundColor: "#000000",
paddingTop:
Platform.OS === "android"
? StatusBar.currentHeight
: 0,
},

scroll: {
flex: 1,
backgroundColor: "#000000",
},

listContent: {
paddingHorizontal: 18,
paddingTop: 20,
},

// ==========================================
// HEADER
// ==========================================

header: {
height: 76,
flexDirection: "row",
alignItems: "center",
paddingHorizontal: 18,
borderBottomWidth: 1,
borderBottomColor: "#1B1B1B",
backgroundColor: "#000000",
},

backButton: {
width: 42,
height: 42,
borderRadius: 21,
backgroundColor: "#151515",
borderWidth: 1,
borderColor: "#292929",
justifyContent: "center",
alignItems: "center",
},

headerTitleContainer: {
flex: 1,
marginLeft: 14,
},

headerTitle: {
color: "#FFFFFF",
fontSize: 19,
fontWeight: "700",
},

headerSubtitle: {
color: "#666666",
fontSize: 11,
marginTop: 3,
},

headerCount: {
minWidth: 42,
height: 38,
paddingHorizontal: 10,
borderRadius: 19,
backgroundColor: "#151515",
borderWidth: 1,
borderColor: "#292929",
flexDirection: "row",
alignItems: "center",
justifyContent: "center",
gap: 5,
},

headerCountText: {
color: "#FFFFFF",
fontSize: 12,
fontWeight: "700",
},

headerPlaceholder: {
width: 42,
},

// ==========================================
// LISTA
// ==========================================

listHeader: {
flexDirection: "row",
justifyContent: "space-between",
alignItems: "center",
marginBottom: 16,
},

listTitle: {
color: "#FFFFFF",
fontSize: 18,
fontWeight: "700",
},

listSubtitle: {
color: "#666666",
fontSize: 12,
marginTop: 4,
},

savedBadge: {
flexDirection: "row",
alignItems: "center",
gap: 5,
paddingHorizontal: 10,
paddingVertical: 7,
borderRadius: 15,
backgroundColor: "#121212",
borderWidth: 1,
borderColor: "#292929",
},

savedBadgeText: {
color: "#888888",
fontSize: 10,
fontWeight: "600",
},

// ==========================================
// TARJETA
// ==========================================

card: {
minHeight: 145,
flexDirection: "row",
alignItems: "center",
backgroundColor: "#111111",
borderRadius: 18,
borderWidth: 1,
borderColor: "#242424",
marginBottom: 14,
padding: 10,
overflow: "hidden",
},

cardPressed: {
opacity: 0.85,
transform: [{ scale: 0.985 }],
},

// ==========================================
// IMAGEN
// ==========================================

imageContainer: {
width: 116,
height: 124,
borderRadius: 14,
backgroundColor: "#F5F5F5",
justifyContent: "center",
alignItems: "center",
position: "relative",
overflow: "hidden",
},

image: {
width: "86%",
height: "86%",
},

favoriteBadge: {
position: "absolute",
top: 7,
left: 7,
width: 27,
height: 27,
borderRadius: 14,
backgroundColor: "#000000",
justifyContent: "center",
alignItems: "center",
},

// ==========================================
// INFORMACIÓN
// ==========================================

info: {
flex: 1,
minHeight: 120,
marginLeft: 13,
justifyContent: "center",
paddingVertical: 5,
},

productLabel: {
flexDirection: "row",
alignItems: "center",
gap: 5,
marginBottom: 6,
},

productLabelText: {
color: "#666666",
fontSize: 8,
fontWeight: "800",
letterSpacing: 1,
},

name: {
color: "#FFFFFF",
fontSize: 15,
fontWeight: "700",
lineHeight: 20,
paddingRight: 4,
},

price: {
color: "#FFFFFF",
fontSize: 17,
fontWeight: "800",
marginTop: 9,
},

detailHint: {
flexDirection: "row",
alignItems: "center",
gap: 5,
marginTop: 9,
},

detailHintText: {
color: "#666666",
fontSize: 10,
},

// ==========================================
// BOTÓN ELIMINAR
// ==========================================

deleteButton: {
width: 40,
height: 40,
borderRadius: 20,
backgroundColor: "#1B1B1B",
borderWidth: 1,
borderColor: "#303030",
justifyContent: "center",
alignItems: "center",
marginLeft: 8,
},

deleteButtonLoading: {
backgroundColor: "#222222",
},

deleteButtonPressed: {
transform: [{ scale: 0.9 }],
opacity: 0.7,
},

// ==========================================
// EMPTY
// ==========================================

emptyScroll: {
flexGrow: 1,
},

emptyContainer: {
flex: 1,
minHeight: 600,
alignItems: "center",
justifyContent: "center",
paddingHorizontal: 35,
},

emptyHeartContainer: {
marginBottom: 25,
},

emptyHeartCircle: {
width: 125,
height: 125,
borderRadius: 63,
backgroundColor: "#111111",
borderWidth: 1,
borderColor: "#292929",
justifyContent: "center",
alignItems: "center",
},

emptyTitle: {
color: "#FFFFFF",
fontSize: 21,
fontWeight: "800",
textAlign: "center",
},

emptyText: {
color: "#777777",
fontSize: 13,
lineHeight: 20,
textAlign: "center",
marginTop: 10,
maxWidth: 310,
},

exploreButton: {
height: 48,
paddingHorizontal: 22,
borderRadius: 24,
backgroundColor: "#FFFFFF",
flexDirection: "row",
alignItems: "center",
justifyContent: "center",
gap: 8,
marginTop: 25,
},

exploreButtonText: {
color: "#000000",
fontSize: 13,
fontWeight: "800",
},

emptyHint: {
flexDirection: "row",
alignItems: "center",
gap: 7,
marginTop: 22,
paddingHorizontal: 14,
paddingVertical: 10,
borderRadius: 12,
backgroundColor: "#0D0D0D",
borderWidth: 1,
borderColor: "#1D1D1D",
},

emptyHintText: {
color: "#555555",
fontSize: 10,
maxWidth: 230,
},

// ==========================================
// LOADING
// ==========================================

loadingContainer: {
flex: 1,
justifyContent: "center",
alignItems: "center",
paddingHorizontal: 40,
},

loadingIcon: {
width: 70,
height: 70,
borderRadius: 35,
backgroundColor: "#151515",
borderWidth: 1,
borderColor: "#292929",
justifyContent: "center",
alignItems: "center",
},

loadingSpinner: {
marginTop: 22,
},

loadingTitle: {
color: "#FFFFFF",
fontSize: 17,
fontWeight: "700",
marginTop: 14,
},

loadingText: {
color: "#666666",
fontSize: 12,
textAlign: "center",
marginTop: 6,
},

// ==========================================
// ERROR
// ==========================================

errorContainer: {
flex: 1,
justifyContent: "center",
alignItems: "center",
paddingHorizontal: 35,
},

errorIcon: {
width: 75,
height: 75,
borderRadius: 38,
backgroundColor: "#151515",
borderWidth: 1,
borderColor: "#292929",
justifyContent: "center",
alignItems: "center",
},

errorTitle: {
color: "#FFFFFF",
fontSize: 19,
fontWeight: "700",
marginTop: 18,
},

errorText: {
color: "#777777",
fontSize: 13,
lineHeight: 20,
textAlign: "center",
marginTop: 8,
maxWidth: 300,
},

retryButton: {
height: 46,
paddingHorizontal: 20,
borderRadius: 23,
backgroundColor: "#FFFFFF",
flexDirection: "row",
alignItems: "center",
gap: 8,
marginTop: 22,
},

retryText: {
color: "#000000",
fontSize: 13,
fontWeight: "800",
},

// ==========================================
// INFO FINAL
// ==========================================

bottomInfo: {
flexDirection: "row",
alignItems: "center",
justifyContent: "center",
gap: 7,
marginTop: 6,
paddingHorizontal: 20,
paddingVertical: 14,
},

bottomInfoText: {
color: "#555555",
fontSize: 10,
textAlign: "center",
},

footerSpace: {
height: 25,
},

pressed: {
opacity: 0.7,
transform: [{ scale: 0.96 }],
},
});
