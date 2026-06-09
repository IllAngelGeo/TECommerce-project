"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../../../firebase/firebase";

import { doc, updateDoc } from "firebase/firestore";

export default function CompletarPerfil() {
const router = useRouter();

const [apellidoPaterno, setApellidoPaterno] = useState("");
const [apellidoMaterno, setApellidoMaterno] = useState("");
const [fechaNacimiento, setFechaNacimiento] = useState("");
const [telefono, setTelefono] = useState("");

const [loading, setLoading] = useState(false);
const [mensaje, setMensaje] = useState("");

const handleGuardar = async () => {
try {
setMensaje("");

  if (
    !apellidoPaterno ||
    !apellidoMaterno ||
    !fechaNacimiento ||
    !telefono
  ) {
    setMensaje("Completa todos los campos");
    return;
  }

  const user = auth.currentUser;

  if (!user) {
    setMensaje("No hay usuario autenticado");
    return;
  }

  setLoading(true);

  await updateDoc(doc(db, "users", user.uid), {
    apellidoPaterno,
    apellidoMaterno,
    fechaNacimiento,
    telefono,
    perfilCompleto: true,
  });

  router.push("/home");
} catch (error) {
  console.log(error);
  setMensaje("Error al guardar los datos");
} finally {
  setLoading(false);
}

};

return ( <div className="min-h-screen bg-black flex items-center justify-center p-8"> <div className="w-full max-w-xl rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-10">

    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-white">
        Completa tu perfil
      </h1>

      <p className="text-gray-400 mt-3">
        Necesitamos algunos datos adicionales para terminar tu registro.
      </p>
    </div>

    <div className="space-y-4">

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

      <button
        onClick={handleGuardar}
        disabled={loading}
        className="w-full py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all"
      >
        {loading ? "Guardando..." : "Guardar y continuar"}
      </button>

      {mensaje && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-3 text-center">
          <span className="text-red-400 text-sm">
            {mensaje}
          </span>
        </div>
      )}
    </div>
  </div>
</div>


);
}
