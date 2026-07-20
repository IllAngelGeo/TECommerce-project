package repository

import (
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/productos/models"
)

func CreateProductImage(
	image *models.ProductoImagen,
) error {

	query := `
		INSERT INTO producto_imagenes
		(
			id_producto,
			imagen_url,
			orden,
			principal
		)
		VALUES ($1, $2, $3, $4)
		RETURNING id_imagen
	`

	return database.DB.QueryRow(
		query,
		image.IDProducto,
		image.ImagenURL,
		image.Orden,
		image.Principal,
	).Scan(&image.IDImagen)
}