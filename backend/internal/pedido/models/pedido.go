package models

type Pedido struct {
	IDPedido      string  `json:"id_pedido"`
	IDUsuario     string  `json:"id_usuario"`
	Total         float64 `json:"total"`
	Estado        string  `json:"estado"`
	FechaCreacion string  `json:"fecha_creacion"`

	Detalles []PedidoDetalle `json:"detalles"`
}

type PedidoDetalle struct {
	IDDetalle  string  `json:"id_detalle"`
	IDPedido   string  `json:"id_pedido"`
	IDProducto string  `json:"id_producto"`
	Cantidad   int     `json:"cantidad"`
	Precio     float64 `json:"precio"`
	Subtotal   float64 `json:"subtotal"`

	Nombre string `json:"nombre"`
	Imagen string `json:"imagen"`
}
