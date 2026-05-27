"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      console.log("Login:", { username, password, rememberMe });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-7xl h-[88vh] rounded-3xl overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl flex">
        
        {/* IZQUIERDA - IMAGEN */}
 <div className="w-1/2 relative flex justify-center items-center bg-black/70 backdrop-blur-2xl " >
  <Image
    src="/Images/carrito.png"
    alt="Campus"
    width={100}
    height={120}
    priority
    className="w-[90%] h-[90%] object-cover mx-auto"
  />
        </div>

        {/* DERECHA - LOGIN */}
        <div className="w-1/2 flex items-center justify-center bg-black/70 backdrop-blur-2xl p-14">
          <div className="w-full max-w-md">

            {/* LOGO */}
            <div className="text-center mb-10">
              <div className="flex justify-center mb-5">
         <div className="w-20 h-20 bg-gradient-to-br from-gray-500 to-gray-800 rounded-full flex items-center justify-center shadow-xl">      
             <span className="text-white text-2xl font-bold">MAEL</span>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white">
                TeCommerce
              </h1>
              <h2 className="text-xl font-semibold text-gray-400">
                MAELDEVS
              </h2>
            </div>

            <h3 className="text-2xl font-bold text-white mb-8 text-center">
              Iniciar sesión
            </h3>

            <form onSubmit={handleLogin} className="space-y-6">

              {/* USUARIO */}
              <div>
                <label className="block text-white text-sm mb-2">
                  Usuario
                </label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Usuario o correo electronico"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block text-white text-sm mb-2">
                  Contraseña
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña"
                    className="w-full px-4 py-3 pr-14 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    {showPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              {/* RECORDAR */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-white">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                  />
                  Recordarme
                </label>

                <button
                  type="button"
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* BOTÓN LOGIN */}
              <button
                type="submit"
                disabled={isLoading}
      className="w-full py-3 bg-white hover:bg-gray-200 rounded-xl text-black font-semibold transition-all shadow-lg"        >
                {isLoading ? "Cargando..." : "Iniciar sesión"}
              </button>

              {/* REGISTRO */}
              <div className="text-center text-sm text-gray-400">
                ¿No tienes cuenta?{" "}
                <button
                  type="button"
                  className="text-white hover:text-amber-400"
                >
                  Regístrate ahora
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}