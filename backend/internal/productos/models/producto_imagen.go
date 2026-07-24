package models

type ProductoImagen struct {
	IDImagen   string `json:"id_imagen"`
	IDProducto string `json:"id_producto"`
	ImagenURL  string `json:"imagen_url"`
	Orden      int    `json:"orden"`
	Principal  bool   `json:"principal"`
}