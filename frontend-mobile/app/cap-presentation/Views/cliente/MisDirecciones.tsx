import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, ActivityIndicator, RefreshControl, Animated, KeyboardAvoidingView, Platform, } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { auth } from "../../../firebase/firebase";
import { API_URL } from "../../constants/api_url";

interface Direccion {
  id_direccion: string;
  id_usuario: string;
  calle: string;
  numero_exterior: string;
  numero_interior: string | null;
  colonia: string;
  codigo_postal: string;
  ciudad: string;
  estado: string;
  referencias: string | null;
  principal: boolean;
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export default function DireccionEntrega() {
  const usuario = auth.currentUser;
  
  // Estados
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  
  // Animaciones
  const [animacion] = useState(new Animated.Value(0));
  const [escalaAnim] = useState(new Animated.Value(1));
  
  // Formulario
  const [calle, setCalle] = useState("");
  const [numeroExterior, setNumeroExterior] = useState("");
  const [numeroInterior, setNumeroInterior] = useState("");
  const [colonia, setColonia] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [estado, setEstado] = useState("");
  const [referencias, setReferencias] = useState("");

  // Estados de validación
  const [errores, setErrores] = useState<Record<string, string>>({});

  useEffect(() => {
    obtenerDirecciones();
    animarEntrada();
  }, []);

  const animarEntrada = () => {
    Animated.spring(animacion, {
      toValue: 1,
      tension: 20,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const animarBoton = (pulsado: boolean) => {
    Animated.spring(escalaAnim, {
      toValue: pulsado ? 0.95 : 1,
      tension: 150,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  // ==========================================
  // OBTENER DIRECCIONES
  // ==========================================
  const obtenerDirecciones = async (refrescar = false) => {
    if (!usuario) {
      setCargando(false);
      return;
    }

    try {
      if (!refrescar) setCargando(true);

      const response = await fetch(
        `${API_URL}/direcciones/firebase/${usuario.uid}`
      );

      const texto = await response.text();
      console.log("RESPUESTA DIRECCIONES:", texto);

      if (!response.ok) {
        throw new Error(texto);
      }

      const data = JSON.parse(texto);

      if (Array.isArray(data) && data.length > 0) {
        setDirecciones(data);
      } else {
        setDirecciones([]);
      }
    } catch (error) {
      console.log("ERROR OBTENIENDO DIRECCIÓN:", error);
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefrescando(true);
    obtenerDirecciones(true);
  }, []);

  // ==========================================
  // GUARDAR DIRECCIÓN
  // ==========================================
  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!calle.trim()) nuevosErrores.calle = "La calle es obligatoria";
    if (!numeroExterior.trim()) nuevosErrores.numeroExterior = "El número exterior es obligatorio";
    if (!colonia.trim()) nuevosErrores.colonia = "La colonia es obligatoria";
    if (!codigoPostal.trim()) nuevosErrores.codigoPostal = "El código postal es obligatorio";
    if (!ciudad.trim()) nuevosErrores.ciudad = "La ciudad es obligatoria";
    if (!estado.trim()) nuevosErrores.estado = "El estado es obligatorio";

    if (codigoPostal.trim() && !/^\d{5}$/.test(codigoPostal.trim())) {
      nuevosErrores.codigoPostal = "Código postal inválido (5 dígitos)";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarDireccion = async () => {
    if (!usuario) {
      Alert.alert("Error", "No hay un usuario autenticado.");
      return;
    }

    if (!validarFormulario()) {
      Alert.alert("Datos incompletos", "Por favor, corrige los campos marcados.");
      return;
    }

    try {
      setGuardando(true);

      const response = await fetch(
        `${API_URL}/direcciones/firebase/${usuario.uid}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            calle: calle.trim(),
            numero_exterior: numeroExterior.trim(),
            numero_interior: numeroInterior.trim() || null,
            colonia: colonia.trim(),
            codigo_postal: codigoPostal.trim(),
            ciudad: ciudad.trim(),
            estado: estado.trim(),
            referencias: referencias.trim() || null,
          }),
        }
      );

      const texto = await response.text();
      console.log("RESPUESTA CREAR DIRECCIÓN:", texto);

      if (!response.ok) {
        throw new Error(texto);
      }

      Alert.alert(
        "¡Dirección guardada! 🎉",
        "Tu dirección de entrega se guardó correctamente.",
        [{ text: "OK" }]
      );

      await obtenerDirecciones();
      setMostrarFormulario(false);
      limpiarFormulario();
    } catch (error) {
      console.log("ERROR GUARDANDO DIRECCIÓN:", error);
      Alert.alert("Error", "No se pudo guardar la dirección. Intenta nuevamente.");
    } finally {
      setGuardando(false);
    }
  };

  const limpiarFormulario = () => {
    setCalle("");
    setNumeroExterior("");
    setNumeroInterior("");
    setColonia("");
    setCodigoPostal("");
    setCiudad("");
    setEstado("");
    setReferencias("");
    setErrores({});
  };

  // ==========================================
  // OBTENER ICONO
  // ==========================================
  const obtenerIconoDireccion = (esPrincipal: boolean): IconName => {
    return esPrincipal ? "home" : "location-outline";
  };

  // ==========================================
  // CARGANDO
  // ==========================================
  if (cargando) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>Verificando direcciones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==========================================
  // PANTALLA PRINCIPAL
  // ==========================================
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER*/}
        <View style={styles.header}>
          <Pressable  
          onPress={() => router.back()} 
          style={styles.back} onPressIn={() => animarBoton(true)}
            onPressOut={() => animarBoton(false)}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </Pressable>

          <View>
            <Text style={styles.titulo}>Dirección de entrega</Text>
          </View>

        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={onRefresh}
              tintColor="#FFF"
              colors={["#FFF"]}
            />
          }
        >
          {/* ================================= */}
          {/* DIRECCIONES EXISTENTES */}
          {/* ================================= */}
          {direcciones.length > 0 && !mostrarFormulario ? (
            <Animated.View style={{ opacity: animacion }}>
              <View style={styles.iconContainer}>
                <View style={styles.iconGradient}>
                  <Ionicons name="location" size={40} color="#FFF" />
                </View>
              </View>

              <Text style={styles.tituloSeccion}>
                 ¿Dónde entregamos tu pedido?
              </Text>

              <Text style={styles.descripcion}>
                Selecciona una dirección para recibir tu compra
              </Text>

              <View style={styles.listaDirecciones}>
                {direcciones.map((item, index) => {
                  const entradaAnimada = {
                    transform: [
                      {
                        translateX: animacion.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-30 * (index + 1), 0],
                        }),
                      },
                    ],
                    opacity: animacion,
                  };

                  return (
                    <Animated.View key={item.id_direccion} style={entradaAnimada}>
                      <Pressable
                        style={[
                          styles.direccionCard,
                        ]}
                      >
                        <View style={styles.direccionHeader}>
                          <View style={styles.direccionTituloContainer}>
                            <Ionicons
                              size={18}
                            />
                            <Text style={styles.direccionTitulo}>
                              {item.principal ? "Principal" : "Dirección"}
                            </Text>
                          </View>

                          {item.principal && (
                            <View style={styles.principalBadge}>
                              <Ionicons name="star" size={10} color="#000" />
                              <Text style={styles.principalTexto}>Principal</Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.direccionDetalles}>
                          <Ionicons
                            name={obtenerIconoDireccion(item.principal)}
                            size={14}
                            color="#777"
                          />
                          <Text style={styles.direccionTexto}>
                            {item.calle} #{item.numero_exterior}
                            {item.numero_interior ? ` Int. ${item.numero_interior}` : ""}
                          </Text>
                        </View>

                        <Text style={styles.direccionTexto}>
                          {item.colonia}
                        </Text>

                        <Text style={styles.direccionTexto}>
                          {item.codigo_postal} · {item.ciudad}, {item.estado}
                        </Text>

                        {item.referencias && (
                          <View style={styles.referenciaContainer}>
                            <Ionicons name="information-circle-outline" size={12} color="#777" />
                            <Text style={styles.referencia}>
                              Ref: {item.referencias}
                            </Text>
                          </View>
                        )}
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>

      <Animated.View style={{ opacity: animacion }}>


  {/* AGREGAR DIRECCIÓN */}
  <Pressable
    style={styles.agregarDireccion}
    onPress={() => {
      setMostrarFormulario(true);
      limpiarFormulario();
    }}
  >
    <Ionicons
      name="add-circle-outline"
      size={20}
      color="#FFF"
    />

    <Text style={styles.agregarDireccionTexto}>
      Agregar nueva dirección
    </Text>
  </Pressable>

</Animated.View>
</Animated.View>
          ) : (
            /* ================================= */
            /* FORMULARIO NUEVA DIRECCIÓN */
            /* ================================= */
            <Animated.View style={{ opacity: animacion }}>
              <View style={styles.iconContainer}>
                <View style={styles.iconGradient}>
                  <Ionicons name="location-outline" size={40} color="#FFF" />
                </View>
              </View>

              <Text style={styles.tituloSeccion}>
                 Agrega una dirección
              </Text>

              <Text style={styles.descripcion}>
                Necesitamos una dirección para poder entregar tu pedido
              </Text>

              <View style={styles.form}>
                {/* Calle */}
                <View style={styles.campoContainer}>
                  <Text style={styles.label}>Calle *</Text>
                  <View style={[styles.inputContainer, errores.calle && styles.inputError]}>
                    <Ionicons name="home-outline" size={18} color="#666" />
                    <TextInput
                      style={styles.input}
                      placeholder="Ej. Avenida Hidalgo"
                      placeholderTextColor="#555"
                      value={calle}
                      onChangeText={setCalle}
                    />
                  </View>
                  {errores.calle && <Text style={styles.errorText}>{errores.calle}</Text>}
                </View>

                {/* Número exterior */}
                <View style={styles.campoContainer}>
                  <Text style={styles.label}>Número exterior *</Text>
                  <View style={[styles.inputContainer, errores.numeroExterior && styles.inputError]}>
                    <Ionicons name="pricetag-outline" size={18} color="#666" />
                    <TextInput
                      style={styles.input}
                      placeholder="Ej. 123"
                      placeholderTextColor="#555"
                      value={numeroExterior}
                      onChangeText={setNumeroExterior}
                      keyboardType="numeric"
                    />
                  </View>
                  {errores.numeroExterior && <Text style={styles.errorText}>{errores.numeroExterior}</Text>}
                </View>

                {/* Número interior */}
                <View style={styles.campoContainer}>
                  <Text style={styles.label}>Número interior</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="pricetag-outline" size={18} color="#666" />
                    <TextInput
                      style={styles.input}
                      placeholder="Ej. 4B"
                      placeholderTextColor="#555"
                      value={numeroInterior}
                      onChangeText={setNumeroInterior}
                    />
                  </View>
                </View>

                {/* Colonia */}
                <View style={styles.campoContainer}>
                  <Text style={styles.label}>Colonia *</Text>
                  <View style={[styles.inputContainer, errores.colonia && styles.inputError]}>
                    <Ionicons name="map-outline" size={18} color="#666" />
                    <TextInput
                      style={styles.input}
                      placeholder="Ej. Centro"
                      placeholderTextColor="#555"
                      value={colonia}
                      onChangeText={setColonia}
                    />
                  </View>
                  {errores.colonia && <Text style={styles.errorText}>{errores.colonia}</Text>}
                </View>

                {/* Código postal */}
                <View style={styles.campoContainer}>
                  <Text style={styles.label}>Código postal *</Text>
                  <View style={[styles.inputContainer, errores.codigoPostal && styles.inputError]}>
                    <Ionicons name="mail-outline" size={18} color="#666" />
                    <TextInput
                      style={styles.input}
                      placeholder="Ej. 55600"
                      placeholderTextColor="#555"
                      value={codigoPostal}
                      onChangeText={setCodigoPostal}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  {errores.codigoPostal && <Text style={styles.errorText}>{errores.codigoPostal}</Text>}
                </View>

                {/* Ciudad */}
                <View style={styles.campoContainer}>
                  <Text style={styles.label}>Ciudad *</Text>
                  <View style={[styles.inputContainer, errores.ciudad && styles.inputError]}>
                    <Ionicons name="business-outline" size={18} color="#666" />
                    <TextInput
                      style={styles.input}
                      placeholder="Ej. Zumpango"
                      placeholderTextColor="#555"
                      value={ciudad}
                      onChangeText={setCiudad}
                    />
                  </View>
                  {errores.ciudad && <Text style={styles.errorText}>{errores.ciudad}</Text>}
                </View>

                {/* Estado */}
                <View style={styles.campoContainer}>
                  <Text style={styles.label}>Estado *</Text>
                  <View style={[styles.inputContainer, errores.estado && styles.inputError]}>
                    <Ionicons name="flag-outline" size={18} color="#666" />
                    <TextInput
                      style={styles.input}
                      placeholder="Ej. Estado de México"
                      placeholderTextColor="#555"
                      value={estado}
                      onChangeText={setEstado}
                    />
                  </View>
                  {errores.estado && <Text style={styles.errorText}>{errores.estado}</Text>}
                </View>

                {/* Referencias */}
                <View style={styles.campoContainer}>
                  <Text style={styles.label}>Referencias</Text>
                  <View style={[styles.inputContainer, styles.textareaContainer]}>
                    <Ionicons name="chatbubble-outline" size={18} color="#666" />
                    <TextInput
                      style={[styles.input, styles.textarea]}
                      placeholder="Ej. Casa blanca frente al parque"
                      placeholderTextColor="#555"
                      value={referencias}
                      onChangeText={setReferencias}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>

                <Pressable
                  style={styles.guardar}
                  onPress={guardarDireccion}
                  disabled={guardando}
                  onPressIn={() => animarBoton(true)}
                  onPressOut={() => animarBoton(false)}
                >
                  <Animated.View style={{ transform: [{ scale: escalaAnim }], flex: 1 }}>
                    <View style={styles.guardarContent}>
                      {guardando ? (
                        <ActivityIndicator color="#000" />
                      ) : (
                        <>
                          <Ionicons name="save-outline" size={18} color="#000" />
                          <Text style={styles.guardarTexto}>Guardar dirección</Text>
                        </>
                      )}
                    </View>
                  </Animated.View>
                </Pressable>

                {direcciones.length > 0 && (
                  <Pressable
                    style={styles.cancelar}
                    onPress={() => {
                      setMostrarFormulario(false);
                      limpiarFormulario();
                    }}
                  >
                    <Ionicons name="close-circle-outline" size={18} color="#777" />
                    <Text style={styles.cancelarTexto}>Cancelar</Text>
                  </Pressable>
                )}
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
    backgroundColor: "#0A0A0A",
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  headerCentro: {
    alignItems: "center",
    gap: 10,
  },
  titulo: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 18
  },

  scroll: {
    padding: 18,
    paddingBottom: 40,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  loadingText: {
    color: "#777",
    marginTop: 12,
    fontSize: 14,
  },
  iconContainer: {
    alignSelf: "center",
    marginTop: 10,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#1A1A1A",
    justifyContent: "center",
    alignItems: "center",
  },
  tituloSeccion: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 18,
  },
  descripcion: {
    color: "#777",
    textAlign: "center",
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
  listaDirecciones: {
    marginTop: 16,
  },
  direccionCard: {
    backgroundColor: "#0A0A0A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#1A1A1A",
    padding: 14,
    marginBottom: 10,
  },
  direccionSeleccionada: {
    borderColor: "#FFFFFF",
    borderWidth: 2,
    backgroundColor: "#0F1F0F",
  },
  direccionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  direccionTituloContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  direccionTitulo: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  principalBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "#FFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  principalTexto: {
    color: "#000",
    fontSize: 9,
    fontWeight: "bold",
  },
  direccionDetalles: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  direccionTexto: {
    color: "#CCC",
    fontSize: 13,
    marginTop: 2,
  },
  referenciaContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#1A1A1A",
  },
  referencia: {
    color: "#777",
    fontSize: 11,
  },
 
 continuar: {
  marginTop: 20,
  height: 52,
  borderRadius: 14,
  backgroundColor: "#FFF",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 8,
  width: "100%",
},

continuarPresionado: {
  opacity: 0.7,
  transform: [{ scale: 0.98 }],
},

continuarTexto: {
  color: "#000",
  fontSize: 15,
  fontWeight: "bold",
},

  agregarDireccion: {
    marginTop: 10,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  agregarDireccionTexto: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "600",
  },
  form: {
    marginTop: 16,
  },
  campoContainer: {
    marginBottom: 10,
  },
  label: {
    color: "#CCC",
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "500",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0A0A0A",
    borderWidth: 1,
    borderColor: "#1A1A1A",
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  inputError: {
    borderColor: "#FF4444",
  },
  input: {
    flex: 1,
    height: 44,
    color: "#FFF",
    fontSize: 13,
  },
  textareaContainer: {
    alignItems: "flex-start",
    paddingTop: 10,
  },
  textarea: {
    height: 70,
    paddingTop: 0,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#FF4444",
    fontSize: 11,
    marginTop: 3,
  },
  guardar: {
    height: 48,
    borderRadius: 14,
    marginTop: 8,
    overflow: "hidden",
  },
  guardarContent: {
    flex: 1,
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  guardarTexto: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 14,
  },
  cancelar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    marginTop: 12,
    paddingVertical: 8,
  },
  cancelarTexto: {
    color: "#777",
    fontSize: 13,
  },
});