"use client";

import { useEffect, useState } from "react";

type Producto = {
  id_producto: string;
  nombre: string;
  descripcion: string;
  modelo: string;
  precio: number;
  precio_oferta: number;
  imagen: string;
};

export default function SearchBar() {
  const [busqueda, setBusqueda] = useState("");
  const [productos, setProductos] = useState<Producto[]>([]);

const productosFiltrados = productos.filter((producto) =>
  producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
);


 useEffect(() => {
  console.log("🔥 useEffect ejecutado");

  async function cargarProductos() {
    console.log("🔥 Intentando obtener productos");

    try {
      const response = await fetch("http://localhost:8080/productos");

      console.log(response);

      const data = await response.json();

      console.log("Productos:", data);

      setProductos(data);
    } catch (error) {
      console.error(error);
    }
  }

  cargarProductos();
}, []);
console.log("🔥 SearchBar renderizado");
  return (
  <div className="relative w-72">
    <input
      type="text"
      placeholder="Buscar productos..."
      className="input input-bordered w-full"
      value={busqueda}
      onChange={(e) => setBusqueda(e.target.value)}
    />

    {busqueda.trim() !== "" && (
      <div className="absolute left-0 top-full mt-2 w-full rounded-lg border border-gray-200 bg-black shadow-lg z-50">
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((producto) => (
            <div
              key={producto.id_producto}
              className="cursor-pointer border-b p-3 hover:bg-gray-100"
            >
              {producto.nombre}
            </div>
          ))
        ) : (
          <div className="p-3 text-gray-500">
            No se encontraron productos.
          </div>
        )}
      </div>
    )}
  </div>
);
}