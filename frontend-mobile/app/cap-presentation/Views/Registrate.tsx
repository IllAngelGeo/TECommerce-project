import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Imagen } from "../components/Imagen";
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

import { createUserWithEmailAndPassword } from "firebase/auth"; 
import {doc,setDoc,serverTimestamp} from "firebase/firestore";
import {auth,db} from "../../firebase/firebase";

export default function DevolverRegistro() {

    const [fecha, setFecha] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [step, setStep] = useState(1); // 1: Datos personales, 2: Datos de cuenta
    
    // Paso 1 - Datos personales
    const [nombre, setNombre] = useState("");
    const [apellidoPaterno, setApellidoPaterno] = useState("");
    const [apellidoMaterno, setApellidoMaterno] = useState("");
    const [fechaTexto, setFechaTexto] = useState("");
    const [telefono, setTelefono] = useState(""); // NUEVO: estado para teléfono
    
    // Paso 2 - Datos de cuenta
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [verPassword, setVerPassword] = useState(false);
    const [verConfirmPassword, setVerConfirmPassword] = useState(false);
    
    // Estados comunes
    const [cargando, setCargando] = useState(false);
    const [cargandoGoogle, setCargandoGoogle] = useState(false);
    const [mensaje, setMensaje] = useState("");

    // Función para formatear teléfono
    const formatearTelefono = (texto: string) => {
        // Solo permitir dígitos
        const soloDigitos = texto.replace(/\D/g, '');
        
        // Limitar a 10 dígitos
        const limitado = soloDigitos.slice(0, 10);
        
        // Formatear como (XXX) XXX-XXXX
        if (limitado.length <= 3) {
            return limitado;
        } else if (limitado.length <= 6) {
            return `(${limitado.slice(0, 3)}) ${limitado.slice(3)}`;
        } else {
            return `(${limitado.slice(0, 3)}) ${limitado.slice(3, 6)}-${limitado.slice(6, 10)}`;
        }
    };

    const handleTelefonoChange = (texto: string) => {
        const formateado = formatearTelefono(texto);
        setTelefono(formateado);
    };

    // Validar paso 1
    const validarPaso1 = () => {
        if (!nombre || !apellidoPaterno || !apellidoMaterno || !fechaTexto || !telefono) {
            setMensaje("Completa todos los campos");
            return false;
        }

        // Validar que el teléfono tenga al menos 10 dígitos
        const telefonoLimpio = telefono.replace(/\D/g, '');
        if (telefonoLimpio.length < 10) {
            setMensaje("Ingresa un número de teléfono válido (10 dígitos)");
            return false;
        }

        setMensaje("");
        return true;
    };

    // Validar paso 2
    const validarPaso2 = () => {
        if (!email || !password || !confirmPassword) {
            setMensaje("Completa todos los campos");
            return false;
        }

        if (password.length < 6) {
            setMensaje("La contraseña debe tener al menos 6 caracteres");
            return false;
        }

        if (password !== confirmPassword) {
            setMensaje("Las contraseñas no coinciden");
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setMensaje("Ingresa un correo electrónico válido");
            return false;
        }
        setMensaje("");
        return true;
    };

    const handleSiguiente = () => {
        if (validarPaso1()) {
            setStep(2);
        }
    };

    const handleAtras = () => {
        setStep(1);
        setMensaje("");
    };

   const handleRegister = async () => {
  if (!validarPaso2()) return;

  try {
    setCargando(true);

    const telefonoLimpio = telefono.replace(/\D/g, "");

    // 1. CREAR USUARIO EN FIREBASE PRIMERO
    const credencial = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const uid = credencial.user.uid;

    console.log("UID FIREBASE:", uid);

    // 2. AHORA SÍ LLAMAR A GO CON EL UID
    const response = await fetch("http://192.168.0.86:8080/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id_firebase: uid,
        email: email.trim(),
        nombre: nombre.trim(),
        apellido_paterno: apellidoPaterno.trim(),
        apellido_materno: apellidoMaterno.trim(),
        telefono: telefonoLimpio,
        provider: "email",
      }),
    });

    const data = await response.json();
    console.log("RESPUESTA GO:", data);

    if (!response.ok) {
      setMensaje(data.error || "Error en backend");
      return;
    }

    // 3. FIRESTORE (opcional pero recomendado)
    await setDoc(doc(db, "users", uid), {
      idFirebase: uid,
      email,
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      telefono: telefonoLimpio,
      provider: "email",
      createdAt: serverTimestamp(),
    });

    router.replace("/cap-presentation/Views/Login");
  } catch (error) {
    console.log("ERROR REGISTER:", error);
    setMensaje("Error de conexión");
  } finally {
    setCargando(false);
  }
};
    const handleGoogleRegister = () => {
        setCargandoGoogle(true);
        setMensaje("");

        setTimeout(() => {
            setCargandoGoogle(false);
        }, 1500);
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }} >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <LinearGradient colors={["#000000", "#000000", "#1A1A1A"]} style={styles.container}>
                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} >
                            
                            <View style={styles.logoContainer}>
                                <View style={styles.logoWrapper}>
                           <Imagen source={{ uri: "https://res.cloudinary.com/demobew9m/image/upload/v1782204337/logo_tecommerce_rzx7yp.png", }} style={{ width: 80, height: 80}}/> 
                  </View>
                            </View>
                            
                            <Text style={styles.titulo}>TeCommerce</Text>
                            <Text style={styles.subtitulo}> Crear cuenta {step}/2 </Text>

                            {/* PASO 1 - Datos Personales */}
                            {step === 1 && (
                                <View>
                                    <Text style={styles.stepTitle}>Datos personales</Text>
                                    
                                    <View style={styles.inputContainer}>
                                        <Imagen source={{ uri: "https://res.cloudinary.com/demobew9m/image/upload/v1782205178/usuario_vs8oyo.png", }} style={{ width: 20, height: 20}}/> 
                                        <TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="#6B7280" value={nombre} onChangeText={setNombre} autoCapitalize="words" />
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Imagen source={{ uri: "https://res.cloudinary.com/demobew9m/image/upload/v1782205178/usuario_vs8oyo.png", }} style={{ width: 20, height: 20}}/> 
                                        <TextInput style={styles.input} placeholder="Apellido paterno" placeholderTextColor="#6B7280" value={apellidoPaterno} onChangeText={setApellidoPaterno} autoCapitalize="words" />
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Imagen source={{ uri: "https://res.cloudinary.com/demobew9m/image/upload/v1782205178/usuario_vs8oyo.png", }} style={{ width: 20, height: 20}}/> 
                                        <TextInput style={styles.input} placeholder="Apellido materno" placeholderTextColor="#6B7280" value={apellidoMaterno} onChangeText={setApellidoMaterno} autoCapitalize="words" />
                                    </View>

                                    <Pressable onPress={() => setShowDatePicker(true)}>
                                        <View style={styles.inputContainer}>
                                        <Imagen source={{ uri: "https://res.cloudinary.com/demobew9m/image/upload/v1782205176/calendario_gvrcwv.png", }} style={{ width: 20, height: 20}}/> 
                                            <TextInput style={styles.input} placeholder="Fecha de nacimiento" placeholderTextColor="#6B7280" value={fechaTexto} editable={false} pointerEvents="none" />
                                            <Ionicons name="chevron-down-outline" size={20} color="#9CA3AF" />
                                        </View>
                                    </Pressable>

                                    <View style={styles.inputContainer}>
                                        <Imagen source={{ uri: "https://res.cloudinary.com/demobew9m/image/upload/v1782205178/telefono_k2jkam.png", }} style={{ width: 20, height: 20}}/> 
                                        <TextInput style={styles.input} placeholder="Teléfono (10 dígitos)" placeholderTextColor="#6B7280" value={telefono} onChangeText={handleTelefonoChange} keyboardType="phone-pad" maxLength={14}
                                        />
                                    </View>

                                    <Pressable style={styles.botonSiguiente} onPress={handleSiguiente} >
                                        <Text style={styles.textoBoton}>Siguiente</Text>
                                        <Ionicons name="arrow-forward-outline" size={20} color="#000000" />
                                    </Pressable>
                                </View>
                            )}

                            {/* PASO 2 - Datos de Cuenta */}
                            {step === 2 && (
                                <View>
                                    <Text style={styles.stepTitle}>Datos de cuenta</Text>
                                    
                                    <View style={styles.inputContainer}>
                                        <Imagen source={{ uri: "https://res.cloudinary.com/demobew9m/image/upload/v1782205176/correo_cnvdey.png", }} style={{ width: 20, height: 20}}/> 
                                        <TextInput style={styles.input} placeholder="Correo electrónico" placeholderTextColor="#6B7280" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address"/>
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Imagen source={{ uri: "https://res.cloudinary.com/demobew9m/image/upload/v1782205176/candado_iplsp7.png", }} style={{ width: 20, height: 20}}/> 
                                        <TextInput 
                                            style={styles.input} 
                                            placeholder="Contraseña" 
                                            placeholderTextColor="#6B7280" 
                                            secureTextEntry={!verPassword} 
                                            value={password} 
                                            onChangeText={setPassword} 
                                        />
                                        <Pressable onPress={() => setVerPassword(!verPassword)}>
                                            <Ionicons name={verPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF"/>
                                        </Pressable>
                                    </View>

                                    <View style={styles.inputContainer}>
                                            <Imagen source={{ uri: "https://res.cloudinary.com/demobew9m/image/upload/v1782205176/candado_iplsp7.png", }} style={{ width: 20, height: 20}}/> 
                                            <TextInput style={styles.input} placeholder="Confirmar contraseña" placeholderTextColor="#6B7280" secureTextEntry={!verConfirmPassword} value={confirmPassword} onChangeText={setConfirmPassword} />
                                        <Pressable onPress={() => setVerConfirmPassword(!verConfirmPassword)}>
                                            <Ionicons name={verConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#9CA3AF" />
                                        </Pressable>
                                    </View>

                                    {/* Botones de navegación */}
                                    <View style={styles.buttonRow}>
                                        <Pressable style={styles.botonAtras} onPress={handleAtras}>
                                            <Ionicons name="arrow-back-outline" size={20} color="#FFFFFF" />
                                            <Text style={styles.textoBotonAtras}>Atrás</Text>
                                        </Pressable>

                                        <Pressable style={[styles.botonRegistrar, cargando && styles.botonDisabled]} onPress={handleRegister} disabled={cargando} >
                                            {cargando ? (
                                                <ActivityIndicator color="#FFFFFF" />
                                            ) : (
                                                <>
                                                    <Text style={styles.textoBoton}>Registrarse</Text>
                                                    <Ionicons name="checkmark-outline" size={20} color="#000000" />
                                                </>
                                            )}
                                        </Pressable>
                                    </View>
                                </View>
                            )}

                            {/* Separador (solo en paso 2) */}
                            {step === 2 && (
                                <>
                                    <View style={styles.separator}>
                                        <View style={styles.line} />
                                        <Text style={styles.separatorText}>O regístrate con</Text>
                                        <View style={styles.line} />
                                    </View>

                                    <Pressable style={styles.googleButton} onPress={handleGoogleRegister} disabled={cargandoGoogle}>
                                        {cargandoGoogle ? (
                                            <ActivityIndicator color="#4285F4" />
                                        ) : (
                                            <>
                                        <Imagen source={{ uri: "https://res.cloudinary.com/demobew9m/image/upload/v1782204067/icono_google_uktsac.png", }} style={{ width: 20, height: 20}}/> 
                                        <Text style={styles.googleText}>Google</Text>
                                            </>
                                        )}
                                    </Pressable>
                                </>
                            )}

                            {/* Volver al Login (solo en paso 1) */}
                            {step === 1 && (
                                <View style={styles.registerContainer}>
                                    <Text style={styles.registerText}>¿Ya tienes una cuenta? </Text>
                                    <Pressable onPress={() => router.replace("/cap-presentation/Views/Login")}>
                                        <Text style={styles.registerLink}>Inicia sesión aquí</Text>
                                    </Pressable>
                                </View>
                            )}

                            {/* Mensaje de error */}
                            {!!mensaje && (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
                                    <Text style={styles.error}>{mensaje}</Text>
                                </View>
                            )}
                        </ScrollView>
                    </LinearGradient>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* Modal de selección de fecha */}
            {showDatePicker && (
                <DateTimePicker 
                    value={fecha} 
                    mode="date" 
                    display="spinner" 
                    themeVariant="dark" 
                    onChange={(event, selectedDate) => { 
                        setShowDatePicker(false);
                        if (selectedDate) {
                            setFecha(selectedDate);
                            const dia = selectedDate.getDate().toString().padStart(2, "0");
                            const mes = (selectedDate.getMonth() + 1).toString().padStart(2, "0"); 
                            const año = selectedDate.getFullYear();
                            setFechaTexto(`${dia}/${mes}/${año}`);
                        }
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },

    scrollContent: {
        flexGrow: 1,
        justifyContent: "center",
        paddingHorizontal: 25,
        paddingVertical: 40,
    },

    logoContainer: {
        alignItems: "center",
        marginBottom: 20,
    },

    logoWrapper: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "rgba(255,255,255,0.05)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },

    titulo: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
        textAlign: "center",
    },

    subtitulo: {
        fontSize: 14,
        color: "#9CA3AF",
        marginBottom: 20,
        textAlign: "center",
    },

    stepTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 20,
        textAlign: "center",
    },

    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 30,
    },

    progressDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "rgba(255,255,255,0.3)",
    },

    progressDotActive: {
        backgroundColor: "#FFFFFF",
        width: 12,
        height: 12,
        borderRadius: 6,
    },

    progressLine: {
        width: 50,
        height: 2,
        backgroundColor: "rgba(255,255,255,0.3)",
        marginHorizontal: 8,
    },

    progressLineActive: {
        backgroundColor: "#FFFFFF",
    },

    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 12,
        paddingHorizontal: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },

    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: "#FFFFFF",
        marginLeft: 10,
    },

    botonSiguiente: {
        width: "100%",
        height: 50,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 20,
        marginBottom: 20,
        flexDirection: "row",
        gap: 10,
    },

    botonRegistrar: {
        flex: 1,
        height: 50,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
    },

    botonAtras: {
        flex: 1,
        height: 50,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },

    buttonRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 20,
        marginBottom: 20,
    },

    botonDisabled: {
        opacity: 0.7,
    },

    textoBoton: {
        color: "#000000",
        fontSize: 15,
        fontWeight: "bold",
    },

    textoBotonAtras: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },

    separator: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        marginBottom: 20,
    },

    line: {
        flex: 1,
        height: 1,
        backgroundColor: "rgba(255,255,255,0.1)",
    },

    separatorText: {
        color: "#6B7280",
        paddingHorizontal: 10,
        fontSize: 12,
    },

    googleButton: {
        width: "100%",
        height: 50,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        flexDirection: "row",
        gap: 10,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },

    googleText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },

    registerContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },

    registerText: {
        color: "#9CA3AF",
        fontSize: 14,
    },

    registerLink: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "bold",
    },

    errorContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 20,
        gap: 8,
    },

    error: {
        color: "#EF4444",
        fontSize: 13,
        fontWeight: "500",
    },
});