"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  X,
  ArrowDown,
  ArrowUp,
  ImageIcon,
} from "lucide-react";

import { API_URL } from "../../../../../frontend-mobile/app/cap-presentation/constants/api_url";

// =========================================================
// TIPOS
// =========================================================

interface Producto {
  id_producto: number;
  nombre: string;
  modelo?: string;
  descripcion?: string;
  precio: number;
  precio_oferta?: number | null;
  imagen?: string | null;
  id_categoria: number;
  destacado?: boolean;
}

interface Categoria {
  id_categoria: number;
  nombre: string;
}

interface Banner {
  id_banner: number;
  titulo: string;
  subtitulo?: string;
  texto_boton?: string;
  imagen_url?: string;
  activo: boolean;
}

type OrdenPrecio = "ninguno" | "menor" | "mayor";

// =========================================================
// HOME
// =========================================================

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoriaParametro = searchParams.get("categoria");

  // =======================================================
  // ESTADOS
  // =======================================================

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);

  const [cargando, setCargando] = useState(true);

  const [busqueda, setBusqueda] = useState("");

  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState(0);

  const [bannerActual, setBannerActual] = useState(0);

  const [mostrarFiltros, setMostrarFiltros] =
    useState(false);

  const [precioMaximo, setPrecioMaximo] = useState("");

  const [ordenPrecio, setOrdenPrecio] =
    useState<OrdenPrecio>("ninguno");

  const [productosAleatorios, setProductosAleatorios] =
    useState<Producto[]>([]);

  // Después conectamos tu CartContext web.
  const cantidadCarrito = 0;

  // =======================================================
  // CARGA INICIAL
  // =======================================================

  useEffect(() => {
    obtenerDatos();
  }, []);

  useEffect(() => {
    if (categoriaParametro) {
      setCategoriaSeleccionada(Number(categoriaParametro));
    } else {
      setCategoriaSeleccionada(0);
    }
  }, [categoriaParametro]);

  // =======================================================
  // BANNER AUTOMÁTICO
  // =======================================================

  useEffect(() => {
    if (banners.length <= 1) return;

    const intervalo = window.setInterval(() => {
      setBannerActual((actual) =>
        actual === banners.length - 1
          ? 0
          : actual + 1
      );
    }, 5000);

    return () => window.clearInterval(intervalo);
  }, [banners]);

  // =======================================================
  // OBTENER INFORMACIÓN
  // =======================================================

  const obtenerDatos = async () => {
    try {
      setCargando(true);

      await Promise.all([
        obtenerProductos(),
        obtenerCategorias(),
        obtenerBanners(),
      ]);
    } finally {
      setCargando(false);
    }
  };

  const obtenerProductos = async () => {
    try {
      const response = await fetch(`${API_URL}/productos`);

      if (!response.ok) {
        throw new Error(
          `Error obteniendo productos: ${response.status}`
        );
      }

      const data: Producto[] = await response.json();

      setProductos(data);
    } catch (error) {
      console.error("Error obteniendo productos:", error);
    }
  };

  const obtenerCategorias = async () => {
    try {
      const response = await fetch(`${API_URL}/categorias`);

      if (!response.ok) {
        throw new Error(
          `Error obteniendo categorías: ${response.status}`
        );
      }

      const data: Categoria[] = await response.json();

      setCategorias(data);
    } catch (error) {
      console.error("Error obteniendo categorías:", error);
    }
  };

  const obtenerBanners = async () => {
    try {
      const response = await fetch(`${API_URL}/banners`);

      if (!response.ok) {
        throw new Error(
          `Error obteniendo banners: ${response.status}`
        );
      }

      const data: Banner[] = await response.json();

      setBanners(
        data.filter((banner) => banner.activo)
      );
    } catch (error) {
      console.error("Error obteniendo banners:", error);
    }
  };

  // =======================================================
  // FILTRADO
  // =======================================================

  const productosFiltrados = useMemo(() => {
    const resultado = productos.filter((producto) => {
      const texto = busqueda.toLowerCase().trim();

      const coincideBusqueda =
        !texto ||
        producto.nombre
          ?.toLowerCase()
          .includes(texto) ||
        producto.modelo
          ?.toLowerCase()
          .includes(texto) ||
        producto.descripcion
          ?.toLowerCase()
          .includes(texto);

      const coincideCategoria =
        categoriaSeleccionada === 0 ||
        producto.id_categoria === categoriaSeleccionada;

      const precio =
        producto.precio_oferta ?? producto.precio;

      const coincidePrecio =
        precioMaximo === "" ||
        precio <= Number(precioMaximo);

      return (
        coincideBusqueda &&
        coincideCategoria &&
        coincidePrecio
      );
    });

    return [...resultado].sort((a, b) => {
      const precioA =
        a.precio_oferta ?? a.precio;

      const precioB =
        b.precio_oferta ?? b.precio;

      if (ordenPrecio === "menor") {
        return precioA - precioB;
      }

      if (ordenPrecio === "mayor") {
        return precioB - precioA;
      }

      return 0;
    });
  }, [
    productos,
    busqueda,
    categoriaSeleccionada,
    precioMaximo,
    ordenPrecio,
  ]);

  // =======================================================
  // PRODUCTOS ALEATORIOS
  // =======================================================

  useEffect(() => {
    const mezclar = () => {
      setProductosAleatorios(
        [...productosFiltrados].sort(
          () => Math.random() - 0.5
        )
      );
    };

    mezclar();

    const intervalo = window.setInterval(
      mezclar,
      30000
    );

    return () => window.clearInterval(intervalo);
  }, [productosFiltrados]);

  // =======================================================
  // MÁS VENDIDOS
  // =======================================================

  const productosMasVendidos = useMemo(
    () =>
      productosFiltrados.filter(
        (producto) => producto.destacado === true
      ),
    [productosFiltrados]
  );

  // =======================================================
  // UTILIDADES
  // =======================================================

  const formatearPrecio = (precio: number) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 2,
    }).format(precio);

  const abrirProducto = (id: number) => {
    router.push(`/productos/${id}`);
  };

  const bannerAnterior = () => {
    setBannerActual((actual) =>
      actual === 0
        ? banners.length - 1
        : actual - 1
    );
  };

  const bannerSiguiente = () => {
    setBannerActual((actual) =>
      actual === banners.length - 1
        ? 0
        : actual + 1
    );
  };

  const limpiarFiltros = () => {
    setPrecioMaximo("");
    setOrdenPrecio("ninguno");
  };

  const hayFiltros =
    precioMaximo !== "" ||
    ordenPrecio !== "ninguno";

  const banner = banners[bannerActual];

  // =======================================================
  // VISTA
  // =======================================================

  return (
    <main className="min-h-screen bg-[#050505] text-white">

      {/* ===================================================
          NAVBAR
      ==================================================== */}

      <header
        className="
          sticky top-0 z-40
          border-b border-white/[0.07]
          bg-black/85
          backdrop-blur-xl
        "
      >
        <div
          className="
            mx-auto
            flex h-[76px]
            max-w-[1450px]
            items-center
            gap-6
            px-4
            sm:px-6
            lg:px-10
          "
        >
          {/* LOGO */}

          <button
            onClick={() => router.push("/home")}
            className="flex shrink-0 items-center gap-3"
          >
            <div
              className="
                flex h-10 w-10
                items-center justify-center
                rounded-xl
                bg-white
                font-black text-black
              "
            >
              T
            </div>

            <span
              className="
                hidden text-lg font-bold
                tracking-tight
                sm:block
              "
            >
              TeCommerce
            </span>
          </button>

          {/* BUSCADOR */}

          <div className="relative mx-auto w-full max-w-2xl">

            <Search
              size={19}
              className="
                absolute left-4 top-1/2
                -translate-y-1/2
                text-white/35
              "
            />

            <input
              value={busqueda}
              onChange={(e) =>
                setBusqueda(e.target.value)
              }
              placeholder="Buscar productos, marcas o modelos..."
              className="
                h-11 w-full
                rounded-xl
                border border-white/10
                bg-white/[0.055]
                pl-12 pr-12
                text-sm text-white
                outline-none
                transition
                placeholder:text-white/30
                hover:border-white/20
                focus:border-white/30
                focus:bg-white/[0.075]
              "
            />

            <button
              onClick={() =>
                setMostrarFiltros(true)
              }
              className="
                absolute right-2 top-1/2
                flex h-8 w-8
                -translate-y-1/2
                items-center justify-center
                rounded-lg
                text-white/50
                transition
                hover:bg-white/10
                hover:text-white
              "
            >
              <SlidersHorizontal size={18} />

              {hayFiltros && (
                <span
                  className="
                    absolute right-0 top-0
                    h-2 w-2
                    rounded-full
                    bg-white
                  "
                />
              )}
            </button>

          </div>

          {/* CARRITO */}

          <button
            onClick={() =>
              router.push("/carrito")
            }
            className="
              relative
              flex h-11 w-11
              shrink-0
              items-center justify-center
              rounded-xl
              border border-white/10
              bg-white/[0.04]
              transition
              hover:bg-white/[0.09]
            "
          >
            <ShoppingBag size={21} />

            {cantidadCarrito > 0 && (
              <span
                className="
                  absolute -right-1 -top-1
                  flex h-5 min-w-5
                  items-center justify-center
                  rounded-full
                  bg-white
                  px-1
                  text-[10px]
                  font-bold
                  text-black
                "
              >
                {cantidadCarrito}
              </span>
            )}
          </button>

        </div>
      </header>

      {/* ===================================================
          CONTENIDO
      ==================================================== */}

      <div
        className="
          mx-auto
          max-w-[1450px]
          px-4 py-8
          sm:px-6
          lg:px-10
        "
      >

        {/* =================================================
            HERO / BANNER
        ================================================== */}

        {banner && (
          <section
            className="
              relative
              mb-10
              min-h-[360px]
              overflow-hidden
              rounded-[28px]
              border border-white/[0.08]
              bg-[#111]
              sm:min-h-[420px]
              lg:min-h-[460px]
            "
          >

            {/* IMAGEN */}

            {banner.imagen_url && (
              <div
                className="
                  absolute
                  inset-y-0 right-0
                  w-full
                  lg:w-[58%]
                "
              >
                <Image
                  src={banner.imagen_url}
                  alt={banner.titulo}
                  fill
                  unoptimized
                  className="object-cover"
                />

                <div
                  className="
                    absolute inset-0
                    bg-gradient-to-r
                    from-[#111]
                    via-[#111]/55
                    to-transparent
                  "
                />

                <div
                  className="
                    absolute inset-0
                    bg-gradient-to-t
                    from-[#111]/60
                    via-transparent
                    to-transparent
                    lg:hidden
                  "
                />
              </div>
            )}

            {/* CONTENIDO */}

            <div
              className="
                relative z-10
                flex min-h-[360px]
                max-w-2xl
                flex-col
                justify-center
                p-7
                sm:min-h-[420px]
                sm:p-12
                lg:min-h-[460px]
                lg:p-16
              "
            >
              <span
                className="
                  mb-4
                  w-fit
                  rounded-full
                  border border-white/15
                  bg-black/30
                  px-4 py-2
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-white/60
                  backdrop-blur-md
                "
              >
                TeCommerce
              </span>

              <h1
                className="
                  max-w-xl
                  text-4xl
                  font-semibold
                  tracking-[-0.04em]
                  sm:text-5xl
                  lg:text-6xl
                "
              >
                {banner.titulo}
              </h1>

              {banner.subtitulo && (
                <p
                  className="
                    mt-5
                    max-w-lg
                    text-sm
                    leading-7
                    text-white/55
                    sm:text-base
                  "
                >
                  {banner.subtitulo}
                </p>
              )}

              <button
                onClick={() =>
                  router.push("/productos")
                }
                className="
                  mt-8
                  w-fit
                  rounded-xl
                  bg-white
                  px-7 py-3.5
                  text-sm
                  font-semibold
                  text-black
                  transition
                  hover:bg-neutral-200
                "
              >
                {banner.texto_boton ||
                  "Explorar productos"}
              </button>
            </div>

            {/* CONTROLES */}

            {banners.length > 1 && (
              <>
                <button
                  onClick={bannerAnterior}
                  className="
                    absolute
                    bottom-6 right-16 z-20
                    flex h-10 w-10
                    items-center justify-center
                    rounded-full
                    border border-white/10
                    bg-black/60
                    backdrop-blur
                    transition
                    hover:bg-white
                    hover:text-black
                  "
                >
                  <ChevronLeft size={19} />
                </button>

                <button
                  onClick={bannerSiguiente}
                  className="
                    absolute
                    bottom-6 right-5 z-20
                    flex h-10 w-10
                    items-center justify-center
                    rounded-full
                    border border-white/10
                    bg-black/60
                    backdrop-blur
                    transition
                    hover:bg-white
                    hover:text-black
                  "
                >
                  <ChevronRight size={19} />
                </button>
              </>
            )}

            {/* INDICADORES */}

            {banners.length > 1 && (
              <div
                className="
                  absolute bottom-7
                  left-7 z-20
                  flex gap-2
                  sm:left-12
                "
              >
                {banners.map((item, index) => (
                  <button
                    key={item.id_banner}
                    onClick={() =>
                      setBannerActual(index)
                    }
                    className={`
                      h-1.5 rounded-full
                      transition-all
                      ${
                        index === bannerActual
                          ? "w-8 bg-white"
                          : "w-2 bg-white/30"
                      }
                    `}
                  />
                ))}
              </div>
            )}

          </section>
        )}

        {/* =================================================
            CATEGORÍAS
        ================================================== */}

        <section className="mb-12">

          <div
            className="
              mb-5
              flex items-center
              justify-between
            "
          >
            <h2
              className="
                text-2xl
                font-semibold
                tracking-tight
                sm:text-3xl
              "
            >
              Categorías
            </h2>

            <button
              onClick={() =>
                router.push("/categorias")
              }
              className="
                text-sm
                text-white/45
                transition
                hover:text-white
              "
            >
              Ver todas
            </button>
          </div>

          <div
            className="
              flex gap-3
              overflow-x-auto
              pb-2
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            <button
              onClick={() =>
                setCategoriaSeleccionada(0)
              }
              className={`
                shrink-0
                rounded-full
                border
                px-6 py-3
                text-sm
                font-medium
                transition
                ${
                  categoriaSeleccionada === 0
                    ? "border-white bg-white text-black"
                    : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white"
                }
              `}
            >
              Todos
            </button>

            {categorias.map((categoria) => (
              <button
                key={categoria.id_categoria}
                onClick={() =>
                  setCategoriaSeleccionada(
                    categoria.id_categoria
                  )
                }
                className={`
                  shrink-0
                  rounded-full
                  border
                  px-6 py-3
                  text-sm
                  font-medium
                  transition
                  ${
                    categoriaSeleccionada ===
                    categoria.id_categoria
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/[0.04] text-white/55 hover:border-white/25 hover:text-white"
                  }
                `}
              >
                {categoria.nombre}
              </button>
            ))}
          </div>

        </section>

        {/* =================================================
            MÁS VENDIDOS
        ================================================== */}

        {productosMasVendidos.length > 0 && (
          <section className="mb-14">

            <div className="mb-6">

              <p
                className="
                  mb-2
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-white/30
                "
              >
                Lo más popular
              </p>

              <h2
                className="
                  text-2xl
                  font-semibold
                  tracking-tight
                  sm:text-3xl
                "
              >
                Más vendidos
              </h2>

            </div>

            <div
              className="
                grid
                grid-cols-2
                gap-x-4 gap-y-8
                sm:grid-cols-3
                lg:grid-cols-4
                xl:grid-cols-5
              "
            >
              {productosMasVendidos
                .slice(0, 5)
                .map((producto) => (
                  <ProductoCard
                    key={producto.id_producto}
                    producto={producto}
                    destacado
                    formatearPrecio={
                      formatearPrecio
                    }
                    onClick={() =>
                      abrirProducto(
                        producto.id_producto
                      )
                    }
                  />
                ))}
            </div>

          </section>
        )}

        {/* =================================================
            PRODUCTOS
        ================================================== */}

        <section className="pb-20">

          <div
            className="
              mb-7
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <div>

              <p
                className="
                  mb-2
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-white/30
                "
              >
                Explora
              </p>

              <h2
                className="
                  text-2xl
                  font-semibold
                  tracking-tight
                  sm:text-3xl
                "
              >
                Productos
              </h2>

              {!cargando && (
                <p className="mt-2 text-sm text-white/35">
                  {productosFiltrados.length}{" "}
                  {productosFiltrados.length === 1
                    ? "producto encontrado"
                    : "productos encontrados"}
                </p>
              )}

            </div>

            <button
              onClick={() =>
                router.push("/productos")
              }
              className="
                text-sm
                text-white/45
                transition
                hover:text-white
              "
            >
              Ver todos
            </button>

          </div>

          {/* CARGANDO */}

          {cargando && (
            <div
              className="
                grid
                grid-cols-2
                gap-4
                sm:grid-cols-3
                lg:grid-cols-4
                xl:grid-cols-5
              "
            >
              {Array.from({ length: 10 }).map(
                (_, index) => (
                  <ProductoSkeleton key={index} />
                )
              )}
            </div>
          )}

          {/* SIN PRODUCTOS */}

          {!cargando &&
            productosFiltrados.length === 0 && (

              <div
                className="
                  flex min-h-[320px]
                  flex-col
                  items-center
                  justify-center
                  rounded-3xl
                  border border-white/[0.07]
                  bg-white/[0.025]
                  text-center
                "
              >
                <div
                  className="
                    mb-5
                    flex h-14 w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-white/[0.06]
                    text-white/30
                  "
                >
                  <Search size={25} />
                </div>

                <h3 className="text-lg font-semibold">
                  No encontramos productos
                </h3>

                <p
                  className="
                    mt-2
                    max-w-sm
                    px-5
                    text-sm
                    leading-6
                    text-white/35
                  "
                >
                  Prueba otra búsqueda,
                  selecciona otra categoría o
                  modifica tus filtros.
                </p>

                <button
                  onClick={() => {
                    setBusqueda("");
                    setCategoriaSeleccionada(0);
                    limpiarFiltros();
                  }}
                  className="
                    mt-6
                    rounded-xl
                    border border-white/10
                    px-5 py-2.5
                    text-sm
                    transition
                    hover:bg-white
                    hover:text-black
                  "
                >
                  Limpiar búsqueda
                </button>

              </div>

            )}

          {/* GRID */}

          {!cargando &&
            productosFiltrados.length > 0 && (

              <div
                className="
                  grid
                  grid-cols-2
                  gap-x-4 gap-y-9
                  sm:grid-cols-3
                  lg:grid-cols-4
                  xl:grid-cols-5
                "
              >
                {productosAleatorios.map(
                  (producto) => (
                    <ProductoCard
                      key={producto.id_producto}
                      producto={producto}
                      formatearPrecio={
                        formatearPrecio
                      }
                      onClick={() =>
                        abrirProducto(
                          producto.id_producto
                        )
                      }
                    />
                  )
                )}
              </div>

            )}

        </section>

      </div>

      {/* ===================================================
          MODAL FILTROS
      ==================================================== */}

      {mostrarFiltros && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center
            justify-center
            bg-black/80
            p-4
            backdrop-blur-sm
          "
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setMostrarFiltros(false);
            }
          }}
        >

          <div
            className="
              w-full
              max-w-lg
              rounded-[26px]
              border border-white/10
              bg-[#111]
              p-6
              shadow-2xl
              sm:p-8
            "
          >

            <div
              className="
                mb-8
                flex items-center
                justify-between
              "
            >
              <div>
                <p
                  className="
                    mb-1
                    text-xs
                    uppercase
                    tracking-[0.2em]
                    text-white/30
                  "
                >
                  Personaliza
                </p>

                <h2 className="text-2xl font-semibold">
                  Filtrar productos
                </h2>
              </div>

              <button
                onClick={() =>
                  setMostrarFiltros(false)
                }
                className="
                  flex h-10 w-10
                  items-center justify-center
                  rounded-full
                  bg-white/[0.06]
                  text-white/50
                  transition
                  hover:bg-white
                  hover:text-black
                "
              >
                <X size={19} />
              </button>
            </div>

            {/* PRECIO */}

            <div className="mb-7">

              <label
                htmlFor="precio-maximo"
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-white/70
                "
              >
                Precio máximo
              </label>

              <div className="relative">

                <span
                  className="
                    absolute
                    left-4 top-1/2
                    -translate-y-1/2
                    text-sm
                    text-white/30
                  "
                >
                  $
                </span>

                <input
                  id="precio-maximo"
                  type="number"
                  min="0"
                  value={precioMaximo}
                  onChange={(e) =>
                    setPrecioMaximo(
                      e.target.value
                    )
                  }
                  placeholder="10,000"
                  className="
                    h-12 w-full
                    rounded-xl
                    border border-white/10
                    bg-black
                    pl-9 pr-4
                    text-sm
                    text-white
                    outline-none
                    transition
                    placeholder:text-white/20
                    focus:border-white/30
                  "
                />

              </div>
            </div>

            {/* ORDEN */}

            <div>

              <p
                className="
                  mb-3
                  text-sm
                  font-medium
                  text-white/70
                "
              >
                Ordenar por precio
              </p>

              <div className="grid grid-cols-2 gap-3">

                <button
                  onClick={() =>
                    setOrdenPrecio(
                      ordenPrecio === "menor"
                        ? "ninguno"
                        : "menor"
                    )
                  }
                  className={`
                    flex h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    text-sm
                    font-medium
                    transition
                    ${
                      ordenPrecio === "menor"
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-black text-white/60 hover:border-white/25 hover:text-white"
                    }
                  `}
                >
                  <ArrowDown size={17} />
                  Menor precio
                </button>

                <button
                  onClick={() =>
                    setOrdenPrecio(
                      ordenPrecio === "mayor"
                        ? "ninguno"
                        : "mayor"
                    )
                  }
                  className={`
                    flex h-12
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    text-sm
                    font-medium
                    transition
                    ${
                      ordenPrecio === "mayor"
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-black text-white/60 hover:border-white/25 hover:text-white"
                    }
                  `}
                >
                  <ArrowUp size={17} />
                  Mayor precio
                </button>

              </div>
            </div>

            {/* ACCIONES */}

            <div
              className="
                mt-8
                grid grid-cols-2
                gap-3
              "
            >
              <button
                onClick={limpiarFiltros}
                className="
                  h-12
                  rounded-xl
                  border border-white/10
                  bg-black
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:bg-white/[0.07]
                "
              >
                Limpiar
              </button>

              <button
                onClick={() =>
                  setMostrarFiltros(false)
                }
                className="
                  h-12
                  rounded-xl
                  bg-white
                  text-sm
                  font-semibold
                  text-black
                  transition
                  hover:bg-neutral-200
                "
              >
                Aplicar filtros
              </button>
            </div>

          </div>

        </div>
      )}

    </main>
  );
}

// =========================================================
// PRODUCT CARD
// =========================================================

interface ProductoCardProps {
  producto: Producto;
  destacado?: boolean;
  formatearPrecio: (precio: number) => string;
  onClick: () => void;
}

function ProductoCard({
  producto,
  destacado = false,
  formatearPrecio,
  onClick,
}: ProductoCardProps) {
  const precio =
    producto.precio_oferta ?? producto.precio;

  return (
    <article
      onClick={onClick}
      className="
        group
        min-w-0
        cursor-pointer
      "
    >

      {/* IMAGEN */}

      <div
        className="
          relative
          aspect-square
          overflow-hidden
          rounded-2xl
          border border-white/[0.07]
          bg-[#f5f5f5]
        "
      >

        {destacado && (
          <span
            className="
              absolute left-3 top-3 z-10
              rounded-full
              bg-black
              px-3 py-1.5
              text-[10px]
              font-semibold
              uppercase
              tracking-wider
              text-white
            "
          >
            Más vendido
          </span>
        )}

        {producto.imagen ? (
          <Image
            src={producto.imagen}
            alt={producto.nombre}
            fill
            unoptimized
            className="
              object-contain
              p-5
              transition-transform
              duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div
            className="
              flex h-full
              items-center
              justify-center
              text-black/20
            "
          >
            <ImageIcon size={50} />
          </div>
        )}

        {/* HOVER */}

        <div
          className="
            absolute inset-x-3
            bottom-3
            translate-y-3
            opacity-0
            transition-all
            duration-300
            group-hover:translate-y-0
            group-hover:opacity-100
          "
        >
          <button
            className="
              w-full
              rounded-xl
              bg-black
              py-2.5
              text-xs
              font-semibold
              text-white
              shadow-xl
            "
          >
            Ver producto
          </button>
        </div>

      </div>

      {/* INFORMACIÓN */}

      <div className="px-1 pt-4">

        <h3
          className="
            truncate
            text-sm
            font-semibold
            text-white
            transition
            group-hover:text-white/70
            sm:text-[15px]
          "
        >
          {producto.nombre}
        </h3>

        {producto.modelo && (
          <p
            className="
              mt-1
              truncate
              text-xs
              text-white/35
            "
          >
            {producto.modelo}
          </p>
        )}

        <div
          className="
            mt-3
            flex flex-wrap
            items-center
            gap-x-2 gap-y-1
          "
        >
          <span
            className="
              text-sm
              font-semibold
              text-white
              sm:text-base
            "
          >
            {formatearPrecio(precio)}
          </span>

          {producto.precio_oferta != null && (
            <span
              className="
                text-xs
                text-white/30
                line-through
              "
            >
              {formatearPrecio(
                producto.precio
              )}
            </span>
          )}

        </div>

      </div>

    </article>
  );
}

// =========================================================
// SKELETON
// =========================================================

function ProductoSkeleton() {
  return (
    <div className="animate-pulse">

      <div
        className="
          aspect-square
          rounded-2xl
          bg-white/[0.06]
        "
      />

      <div
        className="
          mt-4 h-4
          w-3/4
          rounded-full
          bg-white/[0.06]
        "
      />

      <div
        className="
          mt-2 h-3
          w-1/2
          rounded-full
          bg-white/[0.04]
        "
      />

      <div
        className="
          mt-3 h-4
          w-1/3
          rounded-full
          bg-white/[0.06]
        "
      />

    </div>
  );
}