export type AgregarCarritoData = {
  id_usuario: string;
  id_producto: string;
  cantidad: number;
};

export type Carrito = {
  id_carrito: string;
  id_usuario: string;
  id_producto: string;
  cantidad: number;
  nombre: string;
  precio: number;
  imagen: string;
  stock: number;
};

// ==========================================
// AGREGAR PRODUCTO AL CARRITO
// ==========================================

export async function agregarAlCarrito(
  datos: AgregarCarritoData
) {
  const response = await fetch(
    "http://localhost:8080/carrito",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Error al agregar al carrito"
    );
  }

  return data;
}

// ==========================================
// OBTENER CARRITO
// ==========================================

export async function obtenerCarrito(
  idFirebase: string
): Promise<Carrito[]> {

  const response = await fetch(
    `http://localhost:8080/carrito/firebase/${idFirebase}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || "Error al obtener el carrito"
    );
  }

  return data;
}
