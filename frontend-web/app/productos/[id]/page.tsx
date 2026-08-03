import ProductoPage from "@/components/ProductsPage/ProductPage";
import { obtenerProductos } from "@/services/Productos_Service";
import Navbar from "@/components/Navbar";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;

  const productos = await obtenerProductos();

  const producto = productos.find(
    (producto) => producto.id_producto === id
  );

  if (!producto) {
    return (
      <main className="min-h-screen bg-gray-950 text-white">
        <Navbar />

        <h1 className="p-10">
          Producto no encontrado
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <Navbar />

       <ProductoPage
      producto={producto}
      productos={productos}
    />
    </main>
  );
}