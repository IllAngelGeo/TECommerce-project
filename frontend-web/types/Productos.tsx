export type Productos = {
    id_producto: string;
    id_categoria: number;
    nombre: string;
    descripcion: string;
    modelo: string;
    precio: number;
    precio_oferta: number;
    activo: boolean;
    destacado: boolean;
    stock: number;
    stock_minimo: number;
    imagen: string; 
};
  