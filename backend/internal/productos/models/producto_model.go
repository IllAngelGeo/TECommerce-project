package models

type Producto struct {
	IDProducto  string `json:"id_producto"`
	IDCategoria int    `json:"id_categoria"`
	IDMarca     *int   `json:"id_marca,omitempty"`
	Categoria   string `json:"categoria"`
	Nombre      string `json:"nombre"`
	Descripcion string `json:"descripcion"`
	Modelo      string `json:"modelo"`

	Precio       float64  `json:"precio"`
	PrecioOferta *float64 `json:"precio_oferta,omitempty"`

	Activo    bool `json:"activo"`
	Destacado bool `json:"destacado"`

	Stock       int `json:"stock"`
	StockMinimo int `json:"stock_minimo"`

	Imagen string `json:"imagen"`
}
