import React, {
    createContext,
    useState
} from "react";

import { API_URL } from "../../app/cap-presentation/constants/api_url";


// ==========================================
// PRODUCTO DEL CARRITO
// ==========================================

export interface ProductoCarrito {
    id_carrito: string;
    id_producto: string;
    nombre: string;
    precio: number;
    imagen: string;
    cantidad: number;
    stock: number;
}


// ==========================================
// PEDIDO
// ==========================================

export interface Pedido {
    id_pedido: string;
    id_usuario: string;
    total: number;
    estado: string;
    fecha_creacion: string;
    detalles: any[];
}


// ==========================================
// TIPO DEL CONTEXT
// ==========================================

interface CartContextType {

    carrito: ProductoCarrito[];

    obtenerCarrito: (
        idUsuario: string
    ) => void;

    agregarCarrito: (
        producto: any,
        idUsuario: string
    ) => void;

    eliminarCarrito: (
        idCarrito: string,
        idUsuario: string
    ) => void;

    actualizarCantidad: (
        idCarrito: string,
        cantidad: number,
        idUsuario: string
    ) => void;

    crearPedido: (
        idUsuario: string
    ) => Promise<Pedido | null>;
}


// ==========================================
// CONTEXT
// ==========================================

export const CartContext =
    createContext<CartContextType>({

        carrito: [],

        obtenerCarrito: () => {},

        agregarCarrito: () => {},

        eliminarCarrito: () => {},

        actualizarCantidad: () => {},

        crearPedido: async () => null

    });


// ==========================================
// PROVIDER
// ==========================================

export function CartProvider({ children }: any) {

    const [
        carrito,
        setCarrito
    ] = useState<ProductoCarrito[]>([]);


    // ==========================================
    // OBTENER CARRITO
    // ==========================================

    const obtenerCarrito = async (
        idUsuario: string
    ) => {

        const url =
            `${API_URL}/carrito/firebase/${idUsuario}`;

        console.log(
            "URL CARRITO:",
            url
        );

        try {

            const response =
                await fetch(url);

            const texto =
                await response.text();

            console.log(
                "RESPUESTA CARRITO:",
                texto
            );

            if (!response.ok) {

                throw new Error(texto);

            }

            const data =
                JSON.parse(texto);

            setCarrito(data);

        } catch (error) {

            console.log(
                "Error obteniendo carrito:",
                error
            );

        }

    };


    // ==========================================
    // AGREGAR AL CARRITO
    // ==========================================

    const agregarCarrito = async (

        producto: any,

        idUsuario: string

    ) => {

        try {

            const response =
                await fetch(

                    `${API_URL}/carrito`,

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            id_usuario:
                                idUsuario,

                            id_producto:
                                producto.id_producto,

                            cantidad:
                                producto.cantidad || 1

                        })

                    }

                );


            const data =
                await response.text();


            console.log(
                "AGREGAR CARRITO:",
                data
            );


            if (!response.ok) {

                throw new Error(data);

            }


            // Actualizar carrito

            await obtenerCarrito(
                idUsuario
            );


        } catch (error) {

            console.log(
                "Error agregando carrito:",
                error
            );

        }

    };


    // ==========================================
    // ELIMINAR PRODUCTO
    // ==========================================

    const eliminarCarrito = async (

        idCarrito: string,

        idUsuario: string

    ) => {

        try {

            const response =
                await fetch(

                    `${API_URL}/carrito/${idCarrito}`,

                    {

                        method: "DELETE"

                    }

                );


            if (!response.ok) {

                throw new Error(
                    "No se pudo eliminar"
                );

            }


            await obtenerCarrito(
                idUsuario
            );


        } catch (error) {

            console.log(
                "Error eliminando carrito:",
                error
            );

        }

    };


    // ==========================================
    // ACTUALIZAR CANTIDAD
    // ==========================================

    const actualizarCantidad = async (

        idCarrito: string,

        cantidad: number,

        idUsuario: string

    ) => {

        try {

            if (cantidad <= 0) {

                return;

            }


            const response =
                await fetch(

                    `${API_URL}/carrito/${idCarrito}`,

                    {

                        method: "PUT",

                        headers: {

                            "Content-Type":
                                "application/json"

                        },

                        body: JSON.stringify({

                            cantidad

                        })

                    }

                );


            if (!response.ok) {

                throw new Error(
                    "No se pudo actualizar"
                );

            }


            await obtenerCarrito(
                idUsuario
            );


        } catch (error) {

            console.log(
                "Error actualizando cantidad:",
                error
            );

        }

    };


    // ==========================================
    // CREAR PEDIDO / COMPRAR
    // ==========================================

    const crearPedido = async (

        idUsuario: string

    ): Promise<Pedido | null> => {

        try {

            console.log(
                "CREANDO PEDIDO:",
                idUsuario
            );


            const response =
                await fetch(

                    `${API_URL}/pedidos/firebase/${idUsuario}`,

                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json"

                        }

                    }

                );


            const texto =
                await response.text();


            console.log(
                "RESPUESTA CREAR PEDIDO:",
                texto
            );


            if (!response.ok) {

                throw new Error(texto);

            }


            const data =
                JSON.parse(texto);


            console.log(
                "PEDIDO CREADO:",
                data
            );


            // El backend ya eliminó el carrito.
            // Actualizamos la información en React Native.

            await obtenerCarrito(
                idUsuario
            );


            return data.pedido;


        } catch (error) {

            console.log(
                "Error creando pedido:",
                error
            );

            return null;

        }

    };


    // ==========================================
    // PROVIDER
    // ==========================================

    return (

        <CartContext.Provider

            value={{

                carrito,

                obtenerCarrito,

                agregarCarrito,

                eliminarCarrito,

                actualizarCantidad,

                crearPedido

            }}

        >

            {children}

        </CartContext.Provider>

    );

}
