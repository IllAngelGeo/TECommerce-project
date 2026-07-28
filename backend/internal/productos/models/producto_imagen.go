package models

type ProductoImagen struct {
	IDImagen   string `json:"id_imagen"`
	IDProducto string `json:"id_producto"`
	ImagenURL  string `json:"imagen_url"`
	PublicID   string `json:"public_id"`
	Orden      int    `json:"orden"`
	Principal  bool   `json:"principal"`
}
