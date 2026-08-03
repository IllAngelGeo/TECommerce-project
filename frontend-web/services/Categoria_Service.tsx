  import type { Categoria } from "@/types/Categoria";

  export async function obtenerCategorias(): Promise<Categoria[]> {
    const response = await fetch("http://localhost:8080/categorias");

    if (!response.ok) {
      throw new Error("Error al obtener las categorías");
    }

    return response.json();
  }