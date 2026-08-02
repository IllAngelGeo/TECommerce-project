import type { Productos } from "@/types/Productos";

export async function obtenerProductos(): Promise<Productos[]> {
  const response = await fetch("http://localhost:8080/productos");

  if (!response.ok) {
    throw new Error("Error al obtener los productos");
  }

  return response.json();
}