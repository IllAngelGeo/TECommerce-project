import React, {
    createContext,
    useState
} from "react";

import { API_URL } from "../../app/cap-presentation/constants/api_url";


export interface ProductoCarrito {

    id_carrito:string;

    id_producto:string;

    nombre:string;

    precio:number;

    imagen:string;

    cantidad:number;

}



interface CartContextType{

    carrito:ProductoCarrito[];

    obtenerCarrito:(idUsuario:string)=>void;

    agregarCarrito:(
        producto:any,
        idUsuario:string
    )=>void;


    eliminarCarrito:(
        idCarrito:string,
        idUsuario:string
    )=>void;


    actualizarCantidad:(
        idCarrito:string,
        cantidad:number,
        idUsuario:string
    )=>void;

}



export const CartContext = createContext<CartContextType>({

    carrito:[],

    obtenerCarrito:()=>{},

    agregarCarrito:()=>{},

    eliminarCarrito:()=>{},

    actualizarCantidad:()=>{}

});





export function CartProvider({children}:any){


    const [carrito,setCarrito] =
    useState<ProductoCarrito[]>([]);




    // ==================================
    // OBTENER CARRITO
    // ==================================
const obtenerCarrito = async(idUsuario:string)=>{

const url =
`${API_URL}/carrito/firebase/${idUsuario}`;


console.log(
 "URL CARRITO:",
 url
);


try{

const response = await fetch(url);


const texto =
await response.text();


console.log(
 "RESPUESTA CARRITO:",
 texto
);


if(!response.ok){
    throw new Error(texto);
}


const data = JSON.parse(texto);

setCarrito(data);


}catch(error){

console.log(
 "Error obteniendo carrito:",
 error
);

}

}




    // ==================================
    // AGREGAR AL CARRITO
    // ==================================

    const agregarCarrito = async(

        producto:any,

        idUsuario:string

    )=>{


        try{


            const response =
            await fetch(

                `${API_URL}/carrito`,

                {

                    method:"POST",

                    headers:{

                        "Content-Type":
                        "application/json"

                    },


                    body:JSON.stringify({

                        id_usuario:idUsuario,

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



            if(!response.ok){

                throw new Error(data);

            }



            // actualizar carrito después de guardar

            obtenerCarrito(idUsuario);



        }catch(error){


            console.log(
                "Error agregando carrito:",
                error
            );


        }


    }





    // ==================================
    // ELIMINAR PRODUCTO
    // ==================================

    const eliminarCarrito = async(

        idCarrito:string,

        idUsuario:string

    )=>{


        try{


            const response =
            await fetch(

                `${API_URL}/carrito/${idCarrito}`,

                {

                    method:"DELETE"

                }

            );



            if(!response.ok){

                throw new Error(
                    "No se pudo eliminar"
                );

            }



            obtenerCarrito(idUsuario);



        }catch(error){


            console.log(
                "Error eliminando carrito:",
                error
            );


        }


    }





    // ==================================
    // ACTUALIZAR CANTIDAD
    // ==================================

    const actualizarCantidad = async(

        idCarrito:string,

        cantidad:number,

        idUsuario:string

    )=>{


        try{


            if(cantidad <= 0){

                return;

            }



            const response =
            await fetch(

                `${API_URL}/carrito/${idCarrito}`,

                {

                    method:"PUT",

                    headers:{

                        "Content-Type":
                        "application/json"

                    },


                    body:JSON.stringify({

                        cantidad

                    })

                }

            );



            if(!response.ok){

                throw new Error(
                    "No se pudo actualizar"
                );

            }



            obtenerCarrito(idUsuario);



        }catch(error){


            console.log(
                "Error actualizando cantidad:",
                error
            );


        }


    }





    return(

        <CartContext.Provider

        value={{

            carrito,

            obtenerCarrito,

            agregarCarrito,

            eliminarCarrito,

            actualizarCantidad

        }}

        >

            {children}

        </CartContext.Provider>

    );


}