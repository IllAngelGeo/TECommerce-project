"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginGoogle, registerUser } from "../../../firebase/firebase";
import { db } from "../../../firebase/firebase";

import { doc,getDoc,setDoc,serverTimestamp} from "firebase/firestore";

export default function RegistroPage() {
  const [step, setStep] = useState(1); // 1: Datos personales, 2: Datos de cuenta
  
  const router = useRouter();

  // Paso 1 - Datos personales
  const [nombre, setNombre] = useState("");
  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [fechaTexto, setFechaTexto] = useState("");
  
  // Paso 2 - Datos de cuenta
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Estados de las acciones que esten
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // Validar paso 1
  const validarPaso1 = () => {
    if (!nombre || !apellidoPaterno || !apellidoMaterno || !fechaTexto) {
      setMensaje("Completa todos los campos");
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

  /* Acción de boton de siguiente  */
  const handleSiguiente = () => {
    if (validarPaso1()) {
      setStep(2);
    }
  };

  /* Botón de atras */
  const handleAtras = () => {
    setStep(1);
    setMensaje("");
  };


  /* Registrar con los campos normales  */
const handleRegister = async () => {
  if (!validarPaso2()) return;

  try {
    setIsLoading(true);

    const result = await registerUser(email, password);

    const user = result.user;

    await setDoc(doc(db, "users", user.uid), {nombre,apellidoPaterno,apellidoMaterno,fechaNacimiento: fechaTexto,email,
      roles: {
        cliente: true,
        vendedor: false,
      },

      createdAt: serverTimestamp(),
    });

    router.push("../cap-presentation/Views/completar_perfil");

  } catch (error: any) {

    switch (error.code) {

      case "auth/email-already-in-use":
        setMensaje("Este correo ya está registrado");
        break;

      case "auth/weak-password":
        setMensaje("La contraseña es muy débil");
        break;

      case "auth/invalid-email":
        setMensaje("Correo inválido");
        break;

      default:
        setMensaje("Error al registrar usuario");
        break;
    }

  } finally {
    setIsLoading(false);
  }
};

/* Registrar con Google */
const handleGoogleRegister = async () => {
  try {

    setIsGoogleLoading(true);
    const result = await loginGoogle();

    const user = result.user;
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {

      await setDoc(userRef, {
        nombre: user.displayName || "",
        email: user.email,
        foto: user.photoURL || "",
        apellidoPaterno: "",
        apellidoMaterno: "",
        fechaNacimiento: "",

        roles: {
          cliente: true,
          vendedor: false,
        },

        createdAt: serverTimestamp(),
      });

      console.log("Usuario creado en Firestore");
    }

    router.push("/home");

  } catch (error) {

    console.log(error);

    setMensaje("No se pudo registrar con Google");

  } finally {

    setIsGoogleLoading(false);

  }
};

// Indicador de progreso
  const ProgressIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className={`w-3 h-3 rounded-full transition-all ${step === 1 ? 'bg-white w-4 h-4' : 'bg-white/30'}`} />
      <div className={`w-16 h-0.5 mx-2 transition-all ${step === 2 ? 'bg-white' : 'bg-white/30'}`} />
      <div className={`w-3 h-3 rounded-full transition-all ${step === 2 ? 'bg-white w-4 h-4' : 'bg-white/30'}`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-7xl h-[88vh] rounded-3xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex">
        
        {/* IZQUIERDA - IMAGEN */}
        <div className="w-1/2 flex justify-center items-center bg-black">
          <Image src="/Images/logo_ecommerce.png" alt="Logo" width={500} height={500} priority className="object-contain"/>
        </div>

        {/* DERECHA - REGISTRO */}
        <div className="w-1/2 flex items-center justify-center bg-black/70 p-14 overflow-y-auto">
          <div className="w-full max-w-md">
            
            {/* LOGO */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent mb-2">
                TeCommerce
              </h1>
            </div>

            <h3 className="text-xl font-bold text-white mb-6 text-center mt-6">
              Crear cuenta {step}/2
            </h3>

            {/* Indicador de progreso */}
            <ProgressIndicator />

            {/* PASO 1 - Datos Personales */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-white text-center mb-4 font-semibold">Datos personales</p>
                
                {/* Nombre */}
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre" className="w-full px-4 py-3 pl-11 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500" />
                </div>

                {/* Apellido Paterno */}
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input type="text" value={apellidoPaterno} onChange={(e) => setApellidoPaterno(e.target.value)} placeholder="Apellido paterno" className="w-full px-4 py-3 pl-11 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500" />
                </div>

                {/* Apellido Materno */}
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input type="text" value={apellidoMaterno} onChange={(e) => setApellidoMaterno(e.target.value)} placeholder="Apellido materno" className="w-full px-4 py-3 pl-11 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500" />
                </div>

                {/* Fecha de Nacimiento */}
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <input type="date" value={fechaTexto} onChange={(e) => setFechaTexto(e.target.value)} placeholder="Fecha de nacimiento" className="w-full px-4 py-3 pl-11 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500 [color-scheme:dark]" />
                </div>

                {/* Botón Siguiente */}
                <button onClick={handleSiguiente} className="w-full py-3 bg-white hover:bg-gray-200 rounded-xl text-black font-semibold transition-all shadow-lg flex items-center justify-center gap-2 mt-6">
                  Siguiente
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            )}

            {/* PASO 2 - Datos de Cuenta */}
            {step === 2 && (
              <div className="space-y-4">
                <p className="text-white text-center mb-4 font-semibold">Datos de cuenta</p>

                {/* Email */}
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 7L2 7" />
                  </svg>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" className="w-full px-4 py-3 pl-11 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500" />
                </div>

                {/* Contraseña */}
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="w-full px-4 py-3 pl-11 pr-14 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* Confirmar Contraseña */}
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmar contraseña" className="w-full px-4 py-3 pl-11 pr-14 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>

                {/* Botones de navegación */}
                <div className="flex gap-3 mt-6">
                  <button onClick={handleAtras} className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white font-semibold transition-all border border-white/20 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="19" y1="12" x2="5" y2="12" />
                      <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Atrás
                  </button>
                  <button onClick={handleRegister} disabled={isLoading} className="flex-1 py-3 bg-white hover:bg-gray-200 rounded-xl text-black font-semibold transition-all shadow-lg flex items-center justify-center gap-2">
                    {isLoading ? "Cargando..." : "Registrarse"}
                    {!isLoading && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Separador */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/20"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-black/70 text-gray-400">O regístrate con</span>
                  </div>
                </div>

                {/* Botón Google */}
                <button onClick={handleGoogleRegister} disabled={isGoogleLoading} className="w-full flex items-center justify-center gap-3 py-3 bg-black hover:bg-gray-800 rounded-xl transition-all shadow-md border border-gray-700">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-white font-medium">
                    {isGoogleLoading ? "Conectando..." : " Google"}
                  </span>
                </button>
              </div>
            )}

            {/* Volver al Login (solo en paso 1) */}
            {step === 1 && (
              <div className="text-center text-sm text-gray-400 mt-6">
                ¿Ya tienes una cuenta?{" "}
                <button type="button"  onClick={() => router.push("/")} className="text-white hover:text-gray-400"> Inicia sesion aquí </button></div>
            )}

            {/* Mensaje de error */}
            {mensaje && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <circle cx="12" cy="16" r="0.5" fill="#EF4444" />
                </svg>
                <span className="text-red-400 text-sm">{mensaje}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}