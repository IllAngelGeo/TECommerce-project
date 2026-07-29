"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../componentes/Navbar';
import Hero from '../componentes/Hero';
import ProductCard from '../componentes/ProductCard';
import Footer from '../componentes/Footer';
import { API_URL } from '../constants/api_url';

export default function HomePage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const [busqueda, setBusqueda] = useState("");
  const [precioMaximo, setPrecioMaximo] = useState("");
  const [ordenPrecio, setOrdenPrecio] = useState<"ninguno" | "menor" | "mayor">("ninguno");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(0);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    const obtenerCategorias = async () => {
      try {
        const response = await fetch(`${API_URL}/categorias`);
        if (!response.ok) throw new Error(`Error categorías: ${response.status}`);
        const data = await response.json();
        setCategorias(data);
      } catch (error) {
        console.error("Error obteniendo categorías:", error);
      }
    };
    obtenerCategorias();
  }, []);

  useEffect(() => {
    const obtenerProductosDelBack = async () => {
      try {
        setCargando(true);

        const params = new URLSearchParams();

        if (busqueda.trim() !== "") params.append("buscar", busqueda.trim());
        if (categoriaSeleccionada !== 0) params.append("categoria", categoriaSeleccionada.toString());
        if (precioMaximo !== "") params.append("precio_max", precioMaximo);
        if (ordenPrecio !== "ninguno") params.append("orden_precio", ordenPrecio);

        const urlFinal = `${API_URL}/productos?${params.toString()}`;

        const response = await fetch(urlFinal);
        if (!response.ok) throw new Error(`Error productos: ${response.status}`);
        const data = await response.json();

        setProductos(data);
      } catch (error) {
        console.error("Error obteniendo productos del backend:", error);
      } finally {
        setCargando(false);
      }
    };

    const temporizador = setTimeout(() => {
      obtenerProductosDelBack();
    }, 300);

    return () => clearTimeout(temporizador);
  }, [busqueda, categoriaSeleccionada, precioMaximo, ordenPrecio]);
  // SECCIONES DEL HOME
  const productosFiltrados = productos;

  const productosMasVendidos = useMemo(() => {
    return productosFiltrados.filter((producto) => producto.destacado === true || producto.destacado === 1);
  }, [productosFiltrados]);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col justify-between selection:bg-zinc-800">

      <Navbar
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        mostrarFiltros={mostrarFiltros}
        setMostrarFiltros={setMostrarFiltros}
      />

      {mostrarFiltros && (
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 md:px-8 py-4 flex flex-wrap gap-6 items-center">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400 mb-1">Precio Máximo</span>
            <input
              type="number"
              placeholder="Ej. 15000"
              value={precioMaximo}
              onChange={(e) => setPrecioMaximo(e.target.value)}
              className="bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-sm w-36 focus:outline-none text-white"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400 mb-1">Ordenar por precio</span>
            <select
              value={ordenPrecio}
              onChange={(e) => setOrdenPrecio(e.target.value as any)}
              className="bg-black border border-zinc-800 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none"
            >
              <option value="ninguno">Ninguno</option>
              <option value="menor">Menor a Mayor</option>
              <option value="mayor">Mayor a Menor</option>
            </select>
          </div>
          <button
            onClick={() => { setPrecioMaximo(""); setOrdenPrecio("ninguno"); setBusqueda(""); setCategoriaSeleccionada(0); }}
            className="text-xs text-red-400 hover:underline pt-4"
          >
            Limpiar Filtros
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 w-full flex-grow space-y-10">

        <div className="flex md:hidden items-center bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 w-full">
          <span className="text-zinc-500 mr-2">🔍</span>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="bg-transparent text-sm text-white focus:outline-none w-full placeholder-zinc-500"
          />
          <button onClick={() => setMostrarFiltros(!mostrarFiltros)} className="text-sm ml-2">🎛️</button>
        </div>

        <Hero />

        {/* Categorías Dinámicas */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Categorías</h2>
            <button className="text-xs text-zinc-400 hover:underline">Ver todas</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setCategoriaSeleccionada(0)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors border ${categoriaSeleccionada === 0
                ? 'bg-white border-white text-black'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
            >
              Todos
            </button>

            {categorias.map((cat) => (
              <button
                key={cat.id_categoria}
                onClick={() => setCategoriaSeleccionada(cat.id_categoria)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors border ${categoriaSeleccionada === cat.id_categoria
                  ? 'bg-white border-white text-black'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </section>

        {/* SECCIÓN DE PRODUCTOS   */}
        <section className="space-y-4 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">Productos</h2>
          </div>

          {cargando ? (
            <p className="text-zinc-500 text-sm py-4 animate-pulse">Cargando productos desde el servidor...</p>
          ) : productosFiltrados.length === 0 ? (
            <p className="text-zinc-500 text-sm py-4">No se encontraron productos con esos filtros.</p>
          ) : (
 
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
              {productosFiltrados.map((prod: any) => {

                let fotoAMostrar = "https://placeholder.com";
                let rutaImagenRaw = "";

                if (prod.imagenes && prod.imagenes.length > 0) {
                  const imagenPrincipal = prod.imagenes.find((img: any) => img.principal === true || img.principal === 1);
                  rutaImagenRaw = imagenPrincipal ? imagenPrincipal.imagen_url : prod.imagenes[0].imagen_url;
                } else {
                  rutaImagenRaw = prod.imagen_url || prod.imagen || prod.url_imagen || "";
                }

                if (rutaImagenRaw) {
                  if (rutaImagenRaw.startsWith("http")) 
                    fotoAMostrar = rutaImagenRaw;
                  
                }

                return (
                  <ProductCard
                    key={prod.id_producto || prod.id}
                    name={prod.nombre}
                    model={prod.modelo}
                    price={prod.precio}
                    priceOffer={prod.precio_oferta ?? undefined}
                    image={fotoAMostrar}
                  />
                );
              })}
            </div>
          )}
        </section>

      </main>
      <Footer />
    </div>
  );
}
