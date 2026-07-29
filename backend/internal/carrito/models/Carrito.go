package models

type Carrito struct {
	IDCarrito string `json:"id_carrito"`

	IDUsuario string `json:"id_usuario"`

	IDProducto string `json:"id_producto"`

	Cantidad int `json:"cantidad"`

	// datos del producto

	Nombre string `json:"nombre"`

	Precio float64 `json:"precio"`

	Imagen string `json:"imagen"`
}
