
"use client";

import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import {
  obtenerCarrito,
  type Carrito,
} from "@/services/Carrito_Service";

export default function CarritoPage() {

  const [carrito, setCarrito] = useState<Carrito[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

    const cargarCarrito = async () => {

      try {

        setCargando(true);
        setError("");

        const usuario = auth.currentUser;

        if (!usuario) {
          setError("No hay un usuario autenticado");
          return;
        }

        console.log("Firebase UID:", usuario.uid);

        const productos = await obtenerCarrito(
          usuario.uid
        );

        console.log("Carrito:", productos);

        setCarrito(productos);

      } catch (error) {

        console.error("Error al obtener carrito:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Error al cargar el carrito"
        );

      } finally {

        setCargando(false);

      }
    };

    cargarCarrito();

  }, []);

  if (cargando) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white text-lg">
          Cargando carrito...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-400">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          Mi carrito
        </h1>

        {carrito.length === 0 ? (

          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">
              Tu carrito está vacío
            </p>
          </div>

        ) : (

          <div className="space-y-4">

            {carrito.map((producto) => (

              <div
                key={producto.id_carrito}
                className="flex items-center gap-6 p-5 bg-white/10 border border-white/10 rounded-2xl"
              >

                {/* IMAGEN */}

                <div className="w-32 h-32 bg-white/5 rounded-xl flex items-center justify-center overflow-hidden">

                  {producto.imagen ? (

                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-full object-contain"
                    />

                  ) : (

                    <span className="text-gray-500">
                      Sin imagen
                    </span>

                  )}

                </div>

                {/* INFORMACIÓN */}

                <div className="flex-1">

                  <h2 className="text-xl font-semibold">
                    {producto.nombre}
                  </h2>

                  <p className="text-gray-400 mt-1">
                    Precio: ${producto.precio.toFixed(2)}
                  </p>

                  <p className="text-gray-400">
                    Stock disponible: {producto.stock}
                  </p>

                </div>

                {/* CANTIDAD */}

                <div className="text-center">

                  <p className="text-sm text-gray-400 mb-2">
                    Cantidad
                  </p>

                  <div className="flex items-center gap-4">

                    <button
                      className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20"
                    >
                      -
                    </button>

                    <span className="text-lg font-semibold">
                      {producto.cantidad}
                    </span>

                    <button
                      className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20"
                    >
                      +
                    </button>

                  </div>

                </div>

                {/* TOTAL */}

                <div className="w-28 text-right">

                  <p className="text-sm text-gray-400">
                    Total
                  </p>

                  <p className="text-lg font-bold">
                    ${(producto.precio * producto.cantidad).toFixed(2)}
                  </p>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

