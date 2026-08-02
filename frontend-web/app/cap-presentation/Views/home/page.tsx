"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import type { Categoria } from "@/types/Categoria";
import { obtenerCategorias } from "@/services/Categoria_Service";
import { obtenerProductos } from "@/services/Productos_Service";
import { Productos } from "@/types/Productos";

  export default function Home() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [productos, setProductos] = useState<Productos[]>([]);

  useEffect(() => {
  async function cargarDatos() {
    const [categorias, productos] = await Promise.all([
      obtenerCategorias(),
      obtenerProductos(),
    ]);

    setCategorias(categorias);
    setProductos(productos);
  }

  cargarDatos();
}, []);
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />
        <section className="relative overflow-hidden">
            <div className="mx-auto flex max-w-7xl items-center px-6 py-16 lg:px-8">
            <div className="max-w-2xl">
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              ¿Tecnología?
              <span className="block text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.6)] pt-3">
                TeCommerce...
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-gray-400">
              Descubre productos, tecnología y ofertas seleccionadas
              especialmente para ti en TECommerce.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500">
                Explorar productos
              </button>

              <button className="rounded-xl border border-white/20 px-6 py-3 font-semibold transition hover:bg-white/10">
                Ver ofertas
              </button>
            </div>
          </div>

        </div>

        {/* Decoración */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
      </section>


      {/* CATEGORÍAS */}
      <section className="mx-auto max-w-7xl pb-1 px-6 py-10 lg:px-8">

        <div className="mb-10">
          <h2 className="text-3xl font-bold">
            Explora categorías
          </h2>

          <p className="mt-2 text-gray-400">
            Encuentra exactamente lo que necesitas.
          </p>
        </div>

        <div className="relative">
      <div className="flex gap-4 overflow-x-auto px-1 pt-3 pb-4 snap-x snap-mandatory scrollbar-hide">
      {categorias
      .filter((categoria) => categoria.activo)
      .map((categoria) => (
        <div
          key={categoria.id_categoria}
          className="group min-w-[260px] shrink-0 snap-start cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
        >


          <h3 className="font-semibold">
            {categoria.nombre}
          </h3>

          <p className="mt-1 text-sm text-gray-400">
            {categoria.descripcion}
          </p>
        </div>
      ))}
  </div>
</div>
      </section>


      {/* PRODUCTOS */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">

        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              Productos destacados
            </h2>

            <p className="mt-2 text-gray-400">
              Algunos de nuestros productos más populares.
            </p>
          </div>

          <button className="hidden text-sm text-blue-400 hover:text-blue-300 sm:block">
            Ver todos →
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
  {productos
    .filter((productos) => productos.activo)
    .map((productos) => (
      <div
        key={productos.id_producto}
        className="group cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:bg-white/10"
      >
        <div className="mb-4 text-4xl"><img src={productos.imagen} alt="" className="w-full h-48 object-contain" /></div>

        <h3 className="font-semibold">
          {productos.nombre}
        </h3>

        <p className="mt-1 text-sm text-gray-400">
          {productos.descripcion}
        </p>
      </div>
    ))}
</div>
        
      </section>


      {/* OFERTA */}
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">

        <div className="overflow-hidden rounded-3xl border border-blue-500/20 bg-blue-600/10 p-8 md:p-12">

          <div className="max-w-2xl">
            <span className="text-sm font-semibold text-blue-400">
              OFERTAS ESPECIALES
            </span>

            <h2 className="mt-3 text-4xl font-bold">
              Las 3 B Bueno, Bonito y
              <span className="text-blue-400">
                {" "}  Bastardo!! .
              </span>
            </h2>

            <p className="mt-4 text-gray-400">
              Aprovecha nuestras promociones y encuentra productos
              seleccionados a precios especiales.
            </p>

            <button className="mt-7 rounded-xl bg-blue-600 px-6 py-3 font-semibold transition hover:bg-blue-500">
              Ver ofertas
            </button>
          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-gray-500">
        © 2026 TECommerce. Todos los derechos reservados.
      </footer>

    </main>
  );
}