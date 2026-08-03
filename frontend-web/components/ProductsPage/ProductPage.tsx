"use client";
import { useState } from "react";
import type { Productos } from "@/types/Productos";
import { useAuth } from "@/context/AuthContext";
import { agregarAlCarrito } from "@/services/Carrito_Service";
type Props = {
    producto: Productos;
    productos: Productos[];
};

export default function ProductoPage({ producto, productos }: Props) {
    const { user, loading } = useAuth();
    const [agregando, setAgregando] = useState(false);
    console.log("USER:", user);
console.log("LOADING:", loading);
console.log("AGREGANDO:", agregando);
const handleAgregarCarrito = async () => {
  console.log("🟢 CLICK EN AGREGAR CARRITO");
  console.log("LOADING DENTRO:", loading);
  console.log("USER DENTRO:", user);

  if (loading) {
    console.log("⏳ Firebase todavía está cargando");
    return;
  }

  if (!user) {
    console.log("❌ No hay usuario");
    return;
  }

  console.log("✅ Podemos continuar");
  console.log("UID:", user.uid);
  console.log("Producto:", producto.id_producto);

  try {
    setAgregando(true);

    const resultado = await agregarAlCarrito({
      id_usuario: user.uid,
      id_producto: producto.id_producto,
      cantidad: 1,
    });

    console.log("✅ Respuesta del backend:", resultado);

    alert("Producto agregado al carrito");

  } catch (error) {
    console.error("❌ Error al agregar:", error);

    alert(
      error instanceof Error
        ? error.message
        : "No se pudo agregar el producto"
    );

  } finally {
    setAgregando(false);
  }
};
    return (
        <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">

                {/* PRODUCTO PRINCIPAL */}
                <div className="rounded-3xl border border-white/10 bg-white/5 p-8">

                    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">

                        {/* IMAGEN */}
                        <div className="flex min-h-[450px] items-center justify-center rounded-2xl bg-white/5 p-8">

                            <img
                                src={producto.imagen}
                                alt={producto.nombre}
                                className="max-h-[420px] w-full object-contain"
                            />

                        </div>

                        {/* INFORMACIÓN */}
                        <div className="flex flex-col justify-center">

                            <h1 className="text-4xl font-bold tracking-tight">
                                {producto.nombre}
                            </h1>

                            <p className="mt-5 leading-7 text-gray-400">
                                {producto.descripcion}
                            </p>

                            <div className="mt-8">
                                <span className="text-3xl font-bold text-blue-400">
                                    ${producto.precio}
                                </span>
                            </div>

                            <button
                                onClick={handleAgregarCarrito}
                                disabled={false}
                                className="mt-8 w-fit rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500">
                                Agregar al carrito
                            </button>

                        </div>

                    </div>

                </div>


                {/* PRODUCTOS */}
                <aside className="rounded-3xl border border-white/10 bg-white/5 p-6">

                    <h2 className="text-xl font-bold">
                        Productos
                    </h2>

                    <p className="mt-1 text-sm text-gray-400">
                        También te puede interesar
                    </p>

                    <div className="mt-6 space-y-4">

                        {productos
                            .filter((p) => p.id_producto !== producto.id_producto)
                            .slice(0, 4)
                            .map((p) => (
                                <div
                                    key={p.id_producto}
                                    className="flex gap-4 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                                >

                                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-white/5">
                                        <img
                                            src={p.imagen}
                                            alt={p.nombre}
                                            className="h-full w-full object-contain"
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="truncate font-semibold">
                                            {p.nombre}
                                        </h3>

                                        <p className="mt-1 text-sm text-blue-400">
                                            ${p.precio}
                                        </p>
                                    </div>

                                </div>
                            ))}

                    </div>

                </aside>

            </div>

        </section>
    );
}