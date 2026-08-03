"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Categoria } from "@/types/Categoria";
import { obtenerCategorias } from "@/services/Categoria_Service";

export default function CategoriasDropdown() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);

  useEffect(() => {
    async function cargarCategorias() {
      try {
        const data = await obtenerCategorias();
        setCategorias(data);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    }

    cargarCategorias();
  }, []);

  return (
    <li className="dropdown relative inline-flex [--auto-close:inside] [--offset:9]">

      <button
        id="dropdown-categorias"
        type="button"
        className="dropdown-toggle dropdown-open:bg-base-content/10 dropdown-open:text-base-content"
        aria-haspopup="menu"
        aria-expanded="false"
      >
        Categorías

        <span className="icon-[tabler--chevron-down] dropdown-open:rotate-180 size-4"></span>
      </button>

      <ul
        className="dropdown-menu dropdown-open:opacity-100 hidden w-56"
        role="menu"
        aria-labelledby="dropdown-categorias"
      >

        {categorias
          .filter((categoria) => categoria.activo)
          .map((categoria) => (
            <li key={categoria.id_categoria}>
              <Link
                href={`/categorias/${categoria.id_categoria}`}
                className="dropdown-item"
              >
                {categoria.nombre}
              </Link>
            </li>
          ))}

      </ul>

    </li>
  );
}