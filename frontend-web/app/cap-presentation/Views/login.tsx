"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loginGoogle, loginUser } from "../../firebase/firebase";


export default function Home() {

  const router= useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);


  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setIsLoading(true);

    const result = await loginUser(
      username,
      password
    );

    console.log("Login correcto:", result.user);

    router.push("/home");

  } catch (error: any) {

    console.log("ERROR LOGIN:", error);

    alert("Correo o contraseña incorrectos");

  } finally {

    setIsLoading(false);

  }
};
/* Logear por Google */
const handleGoogleLogin = async () => {
  try {
    setIsGoogleLoading(true);

    const result = await loginGoogle();

    const user = result.user;


    router.push("../cap-presentation/Views/completar_perfil");

  } catch (error) {

    console.log("ERROR GOOGLE:", error);

  } finally {

    setIsGoogleLoading(false);

  }
};


/* Imprimir la vista */
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-7xl h-[88vh] rounded-3xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex">
        
        {/* Imagen, la que esta en la izquierda */}
        <div className="w-1/2 flex justify-center items-center bg-black">
          <Image src="/Images/logo_ecommerce.png" alt="Logo" width={500} height={500} priority className="object-contain"/>
        </div>

        {/*Del lado derecho el login */}
        <div className="w-1/2 flex items-center justify-center bg-black/70 p-14">
          <div className="w-full max-w-md">

            {/* LOGO */}
            <div className="text-center">
              
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-300 to-white bg-clip-text text-transparent mb-5">TeCommerce</h1>
            </div>

            <h3 className="text-2xl font-bold text-white mb-8 text-center"> Iniciar sesión</h3>

            <form onSubmit={handleLogin} className="space-y-6">

        {/* USUARIO */}
<div>
  <div className="relative">
    {/* Ícono de usuario */}
    <Image src="https://res.cloudinary.com/demobew9m/image/upload/v1782205178/usuario_vs8oyo.png" alt="icono_usuario" width={18} height={18} priority className="absolute left-4 top-1/2 -translate-y-1/2 object-contain"/>  
    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario o correo electrónico" className="w-full px-4 py-3 pl-11 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500" required 
    />
  </div>
</div>
              {/* PASSWORD */}
    <div>

  <div className="relative">  
     
      { /* Imagen de contraseña */}
    
    <Image src="https://res.cloudinary.com/demobew9m/image/upload/v1782205176/candado_iplsp7.png" alt="campo_contrasena" width={18} height={18} priority className="absolute left-4 top-1/2 -translate-y-1/2 object-contain"/>
      
    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="w-full px-4 py-3 pl-11 pr-14 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gray-500" required />

    {/* Botón para mostrar/ocultar contraseña */}
    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white">
      {showPassword ? (

      /* Imagen de ojito si muestra */
      <Image src="https://res.cloudinary.com/demobew9m/image/upload/v1782205176/ojoabierto_jzqvxk.png" alt="ojito_muestra" width={18} height={18} priority />
            ) 
      : (

      /* Imagen de ojito si nomuestra */
      <Image src="https://res.cloudinary.com/demobew9m/image/upload/v1782205177/ojocerrado_vlkzkj.png" alt="ojito_no_muestra" width={18} height={18} priority />
  
)}
    </button>
  </div>
</div>
  
   <div className="flex justify-end mt-2">
    <button type="button" onClick={() => console.log("Olvidé contraseña")} className="text-sm text-gray-400 hover:text-white transition-colors">
      ¿Olvidaste tu contraseña?
    </button>
  </div>
  
        {/* BOTÓN LOGIN */}
              <button type="submit" disabled={isLoading} className="w-full py-3 bg-white hover:bg-gray-200 rounded-xl text-black font-semibold transition-all shadow-lg">
                {isLoading ? "Cargando..." : "Iniciar sesión"}
              </button>



              {/* DIVISOR */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-black/70 text-gray-400">O continúa con</span>
                </div>
              </div>


              {/* BOTÓN GOOGLE */}
              <button type="button" onClick={handleGoogleLogin} disabled={isGoogleLoading} className="w-full flex items-center justify-center gap-3 py-3 bg-black hover:bg-gray-600 rounded-xl transition-all shadow-md border border-gray-700 group">
               <Image src="https://res.cloudinary.com/demobew9m/image/upload/v1782204067/icono_google_uktsac.png" alt="icono_google" width={18} height={18} priority className="object-contain"/>
                
                <span className="text-white-700 font-medium">
                  {isGoogleLoading ? "Conectando..." : "Continuar con Google"}
                </span>
              </button>

              {/* REGISTRO */}
               <div className="text-center text-sm text-gray-400 mt-6">
                ¿No tienes cuenta?{" "}
            <button type="button"  onClick={() => router.push("/cap-presentation/Views/registrate/")} className="text-white hover:text-gray-400"> Regístrate ahora </button></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}