import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { API_URL } from "../../constants/api_url";

interface ImagenProducto {
  id_imagen: string;
  id_producto: string;
  imagen_url: string;
  orden?: number;
  principal?: boolean;
}

export default function AgregarImagenes() {

  // ==========================================
  // ID DEL PRODUCTO
  // ==========================================

  const { id } = useLocalSearchParams<{
    id: string;
  }>();


  // ==========================================
  // ESTADOS
  // ==========================================

  const [imagenes, setImagenes] = useState<
    ImagenProducto[]
  >([]);

  const [imagenSeleccionada, setImagenSeleccionada] =
    useState<string | null>(null);

  const [subiendo, setSubiendo] =
    useState(false);

  const [cargando, setCargando] =
    useState(true);


  // ==========================================
  // OBTENER IMÁGENES
  // ==========================================

  useEffect(() => {

    if (id) {
      obtenerImagenes();
    }

  }, [id]);


  const obtenerImagenes = async () => {

    try {

      setCargando(true);

      const response = await fetch(
        `${API_URL}/productos/${id}/imagenes`
      );

      if (!response.ok) {
        throw new Error(
          "No se pudieron obtener las imágenes"
        );
      }

      const data =
        await response.json();

      setImagenes(
        data.imagenes || []
      );

    } catch (error) {

      console.error(
        "Error obteniendo imágenes:",
        error
      );

    } finally {

      setCargando(false);

    }

  };


  // ==========================================
  // SELECCIONAR IMAGEN
  // ==========================================

  const seleccionarImagen = async () => {

    try {

      const permiso =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {

        Alert.alert(
          "Permiso requerido",
          "Necesitamos acceso a tu galería para seleccionar una imagen."
        );

        return;

      }


      const resultado =
        await ImagePicker.launchImageLibraryAsync({

          mediaTypes: ["images"],

          allowsEditing: true,

          aspect: [1, 1],

          quality: 0.8,

        });


      if (
        !resultado.canceled &&
        resultado.assets.length > 0
      ) {

        setImagenSeleccionada(
          resultado.assets[0].uri
        );

      }

    } catch (error) {

      console.error(
        "Error seleccionando imagen:",
        error
      );

      Alert.alert(
        "Error",
        "No se pudo seleccionar la imagen."
      );

    }

  };


  // ==========================================
  // SUBIR IMAGEN
  // ==========================================

  const subirImagen = async () => {

    if (!imagenSeleccionada) {

      Alert.alert(
        "Imagen requerida",
        "Selecciona una imagen antes de subirla."
      );

      return;

    }


    try {

      setSubiendo(true);


      const formData =
        new FormData();


      // IMPORTANTE
      // El nombre debe ser "imagen"
      // porque así lo espera tu backend

      formData.append(
        "imagen",
        {
          uri:
            imagenSeleccionada,

          name:
            `producto-${Date.now()}.jpg`,

          type:
            "image/jpeg",

        } as any
      );


      const response =
        await fetch(
          `${API_URL}/productos/${id}/imagenes`,
          {
            method: "POST",

            body:
              formData,

            headers: {
              // NO colocar Content-Type manualmente
              // React Native agrega automáticamente
              // el boundary del multipart
            },
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
          "No se pudo subir la imagen"
        );

      }


      Alert.alert(
        "Imagen subida",
        "La imagen se subió correctamente."
      );


      // Limpiar selección

      setImagenSeleccionada(
        null
      );


      // Actualizar lista

      obtenerImagenes();


    } catch (error) {

      console.error(
        "Error subiendo imagen:",
        error
      );


      Alert.alert(
        "Error",

        error instanceof Error
          ? error.message
          : "No se pudo subir la imagen."
      );


    } finally {

      setSubiendo(false);

    }

  };


  // ==========================================
  // VISTA
  // ==========================================

  return (

    <View style={estilos.safe}>


      {/* HEADER */}

      <View style={estilos.header}>

        <Pressable
          style={
            estilos.botonRegresar
          }
          onPress={() =>
            router.back()
          }
        >

          <Ionicons
            name="arrow-back"
            size={24}
            color="#FFFFFF"
          />

        </Pressable>


        <View
          style={
            estilos.headerTexto
          }
        >

          <Text
            style={
              estilos.titulo
            }
          >
            Imágenes del producto
          </Text>

          <Text
            style={
              estilos.subtitulo
            }
          >
            Agrega imágenes para mostrar el producto
          </Text>

        </View>

      </View>


      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          estilos.contenido
        }
      >


        {/* ==========================================
            SELECCIONAR IMAGEN
        ========================================== */}

        <View
          style={
            estilos.seccion
          }
        >

          <View
            style={
              estilos.seccionHeader
            }
          >

            <Ionicons
              name="image-outline"
              size={22}
              color="#FFFFFF"
            />

            <Text
              style={
                estilos.seccionTitulo
              }
            >
              Agregar imagen
            </Text>

          </View>


          {/* PREVISUALIZACIÓN */}

          {imagenSeleccionada ? (

            <View
              style={
                estilos.previewContainer
              }
            >

              <Image
                source={{
                  uri:
                    imagenSeleccionada,
                }}
                style={
                  estilos.preview
                }
              />

            </View>

          ) : (

            <View
              style={
                estilos.sinImagen
              }
            >

              <Ionicons
                name="image-outline"
                size={55}
                color="#333333"
              />

              <Text
                style={
                  estilos.sinImagenTexto
                }
              >
                No has seleccionado una imagen
              </Text>

            </View>

          )}


          {/* BOTÓN SELECCIONAR */}

          <Pressable
            style={
              estilos.botonSeleccionar
            }
            onPress={
              seleccionarImagen
            }
          >

            <Ionicons
              name="images-outline"
              size={22}
              color="#FFFFFF"
            />

            <Text
              style={
                estilos.botonSeleccionarTexto
              }
            >
              Seleccionar imagen
            </Text>

          </Pressable>


          {/* BOTÓN SUBIR */}

          {imagenSeleccionada && (

            <Pressable
              style={[
                estilos.botonSubir,

                subiendo &&
                  estilos.botonDeshabilitado,
              ]}
              onPress={
                subirImagen
              }
              disabled={
                subiendo
              }
            >

              {subiendo ? (

                <ActivityIndicator
                  size="small"
                  color="#000000"
                />

              ) : (

                <>

                  <Ionicons
                    name="cloud-upload-outline"
                    size={22}
                    color="#000000"
                  />

                  <Text
                    style={
                      estilos.botonSubirTexto
                    }
                  >
                    Subir imagen
                  </Text>

                </>

              )}

            </Pressable>

          )}

        </View>


        {/* ==========================================
            IMÁGENES SUBIDAS
        ========================================== */}

        <View
          style={
            estilos.seccion
          }
        >

          <View
            style={
              estilos.seccionHeader
            }
          >

            <Ionicons
              name="albums-outline"
              size={22}
              color="#FFFFFF"
            />

            <Text
              style={
                estilos.seccionTitulo
              }
            >
              Imágenes del producto
            </Text>

          </View>


          {cargando ? (

            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />

          ) : imagenes.length === 0 ? (

            <View
              style={
                estilos.vacio
              }
            >

              <Ionicons
                name="images-outline"
                size={45}
                color="#333333"
              />

              <Text
                style={
                  estilos.vacioTexto
                }
              >
                Aún no hay imágenes
              </Text>

            </View>

          ) : (

            <View
              style={
                estilos.grid
              }
            >

              {imagenes.map(
                (imagen) => (

                  <View
                    key={
                      imagen.id_imagen
                    }
                    style={
                      estilos.imagenCard
                    }
                  >

                    <Image
                      source={{
                        uri:
                          imagen.imagen_url,
                      }}
                      style={
                        estilos.imagen
                      }
                    />

                    {imagen.principal && (

                      <View
                        style={
                          estilos.principalBadge
                        }
                      >

                        <Text
                          style={
                            estilos.principalTexto
                          }
                        >
                          Principal
                        </Text>

                      </View>

                    )}

                  </View>

                )
              )}

            </View>

          )}

        </View>


        {/* ==========================================
            FINALIZAR
        ========================================== */}

        <Pressable
          style={
            estilos.botonFinalizar
          }
          onPress={() =>
            router.replace(
              "/cap-presentation/Views/cliente/Productos"
            )
          }
        >

          <Ionicons
            name="checkmark-circle-outline"
            size={22}
            color="#000000"
          />

          <Text
            style={
              estilos.botonFinalizarTexto
            }
          >
            Finalizar
          </Text>

        </Pressable>


        <View
          style={
            estilos.espacioFinal
          }
        />

      </ScrollView>

    </View>

  );

}


// ==========================================
// ESTILOS
// ==========================================

const estilos =
  StyleSheet.create({

    safe: {
      flex: 1,
      backgroundColor:
        "#000000",
      paddingTop: 50,
    },


    header: {
      flexDirection:
        "row",
      alignItems:
        "center",
      paddingHorizontal:
        20,
      paddingBottom:
        20,
      borderBottomWidth:
        1,
      borderBottomColor:
        "#1A1A1A",
    },


    botonRegresar: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor:
        "#111111",
      justifyContent:
        "center",
      alignItems:
        "center",
      marginRight: 12,
    },


    headerTexto: {
      flex: 1,
    },


    titulo: {
      color:
        "#FFFFFF",
      fontSize: 22,
      fontWeight:
        "bold",
    },


    subtitulo: {
      color:
        "#666666",
      fontSize: 12,
      marginTop: 4,
    },


    contenido: {
      paddingHorizontal:
        20,
      paddingTop:
        20,
      paddingBottom:
        40,
    },


    seccion: {
      backgroundColor:
        "#0A0A0A",
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#1A1A1A",
      padding: 16,
      marginBottom: 15,
    },


    seccionHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      gap: 10,
      marginBottom:
        18,
    },


    seccionTitulo: {
      color:
        "#FFFFFF",
      fontSize: 16,
      fontWeight:
        "bold",
    },


    // ==========================================
    // PREVIEW
    // ==========================================

    previewContainer: {
      width: "100%",
      height: 220,
      borderRadius: 12,
      backgroundColor:
        "#111111",
      overflow: "hidden",
      marginBottom: 12,
    },


    preview: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },


    sinImagen: {
      height: 180,
      backgroundColor:
        "#111111",
      borderRadius: 12,
      justifyContent:
        "center",
      alignItems:
        "center",
      marginBottom: 12,
    },


    sinImagenTexto: {
      color:
        "#555555",
      fontSize: 12,
      marginTop: 10,
    },


    // ==========================================
    // BOTONES
    // ==========================================

    botonSeleccionar: {
      height: 50,
      backgroundColor:
        "#151515",
      borderWidth: 1,
      borderColor:
        "#2A2A2A",
      borderRadius: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },


    botonSeleccionarTexto: {
      color:
        "#FFFFFF",
      fontSize: 14,
      fontWeight:
        "600",
    },


    botonSubir: {
      height: 50,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 10,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
      marginTop: 10,
    },


    botonSubirTexto: {
      color:
        "#000000",
      fontSize: 14,
      fontWeight:
        "bold",
    },


    botonDeshabilitado: {
      opacity: 0.5,
    },


    // ==========================================
    // GRID
    // ==========================================

    grid: {
      flexDirection:
        "row",
      flexWrap:
        "wrap",
      gap: 10,
    },


    imagenCard: {
      width: "31%",
      aspectRatio: 1,
      borderRadius: 10,
      backgroundColor:
        "#111111",
      overflow: "hidden",
      position: "relative",
    },


    imagen: {
      width: "100%",
      height: "100%",
      resizeMode:
        "cover",
    },


    principalBadge: {
      position:
        "absolute",
      bottom: 5,
      left: 5,
      right: 5,
      backgroundColor:
        "rgba(0,0,0,0.75)",
      borderRadius: 5,
      paddingVertical: 3,
      alignItems:
        "center",
    },


    principalTexto: {
      color:
        "#FFFFFF",
      fontSize: 9,
      fontWeight:
        "bold",
    },


    // ==========================================
    // VACÍO
    // ==========================================

    vacio: {
      alignItems:
        "center",
      paddingVertical: 25,
    },


    vacioTexto: {
      color:
        "#555555",
      fontSize: 12,
      marginTop: 8,
    },


    // ==========================================
    // FINALIZAR
    // ==========================================

    botonFinalizar: {
      height: 52,
      backgroundColor:
        "#FFFFFF",
      borderRadius: 12,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      gap: 8,
    },


    botonFinalizarTexto: {
      color:
        "#000000",
      fontSize: 15,
      fontWeight:
        "bold",
    },


    espacioFinal: {
      height: 30,
    },

  });
