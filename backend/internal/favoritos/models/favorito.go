package models

type Favorito struct {
	IDFavorito string `json:"id_favorito"`

	IDUsuario string `json:"id_usuario"`

	IDProducto string `json:"id_producto"`

	FechaCreacion string `json:"fecha_creacion"`

	// Datos del producto

	Nombre string `json:"nombre"`

	Precio float64 `json:"precio"`

	Imagen string `json:"imagen"`
}
