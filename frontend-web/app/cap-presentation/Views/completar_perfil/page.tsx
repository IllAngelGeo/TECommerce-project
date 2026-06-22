"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../../../firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

export default function CompletarPerfil() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [apellidoPaterno, setApellidoPaterno] = useState("");
  const [apellidoMaterno, setApellidoMaterno] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [telefono, setTelefono] = useState("");

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  // 🔥 Auth listener seguro (IMPORTANTE en Next.js)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoadingUser(false);

      // si no hay usuario, fuera
      if (!u) router.push("/");
    });

    return () => unsub();
  }, [router]);

  const isGoogle =
    user?.providerData?.some((p) => p.providerId === "google.com") ?? false;

  const nombre = user?.displayName || "";

  const handleGuardar = async () => {
    try {
      setMensaje("");

      if (!user) {
        setMensaje("No hay usuario autenticado");
        return;
      }

      // 🔥 Validación base (todos)
      if (!fechaNacimiento || !telefono) {
        setMensaje("Completa los campos obligatorios");
        return;
      }

      // 🔥 Solo email users
      if (!isGoogle && (!apellidoPaterno || !apellidoMaterno)) {
        setMensaje("Completa todos los campos");
        return;
      }

      setLoading(true);

      // 🔥 Payload listo para backend (Supabase / Go / RN)
      const payload = {
        uid: user.uid,
        email: user.email,
        nombre: isGoogle ? nombre : "",
        fechaNacimiento,
        telefono,

        provider: isGoogle ? "google" : "email",

        ...(isGoogle
          ? {}
          : {
              apellidoPaterno,
              apellidoMaterno,
            }),
      };

      console.log("Perfil capturado:", payload);

      // 👉 aquí después llamas tu API Go o Supabase
      // await fetch("/api/profile", ...)

      router.push("/home");
    } catch (error) {
      console.log(error);
      setMensaje("Error al guardar los datos");
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        Cargando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <div className="w-full max-w-xl rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-10">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Completa tu perfil
          </h1>

          <p className="text-gray-400 mt-3">
            {isGoogle
              ? "Solo necesitamos algunos datos adicionales"
              : "Completa tu información para continuar"}
          </p>
        </div>

        <div className="space-y-4">

          {/* EMAIL USERS */}
          {!isGoogle && (
            <>
              <input
                type="text"
                placeholder="Apellido paterno"
                value={apellidoPaterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
              />

              <input
                type="text"
                placeholder="Apellido materno"
                value={apellidoMaterno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
              />
            </>
          )}

          {/* TODOS */}
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white [color-scheme:dark]"
          />

          <input
            type="tel"
            placeholder="Teléfono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
          />

          {/* INFO GOOGLE */}
          {isGoogle && nombre && (
            <div className="text-gray-400 text-sm text-center">
              Nombre detectado:{" "}
              <span className="text-white">{nombre}</span>
            </div>
          )}

          <button
            onClick={handleGuardar}
            disabled={loading}
            className="w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all"
          >
            {loading ? "Guardando..." : "Guardar y continuar"}
          </button>

          {mensaje && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-center">
              <span className="text-red-400 text-sm">{mensaje}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}