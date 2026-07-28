package repository

import (
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/productos/models"
	"fmt"
)

func CreateProductImage(
	image *models.ProductoImagen,
) error {

	query := `
		INSERT INTO producto_imagenes
		(
			id_producto,
			imagen_url,
			public_id,
			orden,
			principal
		)
		VALUES (
			$1,
			$2,
			$3,
			COALESCE(
				(
					SELECT MAX(orden) + 1
					FROM producto_imagenes
					WHERE id_producto = $1
				),
				1
			),
			$4
		)
		RETURNING id_imagen, orden
	`

	return database.DB.QueryRow(
		query,
		image.IDProducto,
		image.ImagenURL,
		image.PublicID,
		image.Principal,
	).Scan(
		&image.IDImagen,
		&image.Orden,
	)
}

func ProductHasImages(productID string) (bool, error) {

	query := `
		SELECT EXISTS(
			SELECT 1
			FROM producto_imagenes
			WHERE id_producto = $1
		)
	`

	var existe bool

	err := database.DB.QueryRow(
		query,
		productID,
	).Scan(&existe)

	if err != nil {
		return false, err
	}

	return existe, nil
}

func GetProductImages(productID string) ([]models.ProductoImagen, error) {

	query := `
		SELECT
			id_imagen,
			id_producto,
			imagen_url,
			public_id,
			orden,
			principal
		FROM producto_imagenes
		WHERE id_producto = $1
		ORDER BY orden ASC
	`

	rows, err := database.DB.Query(
		query,
		productID,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	imagenes := make([]models.ProductoImagen, 0)

	for rows.Next() {

		var imagen models.ProductoImagen

		err := rows.Scan(
			&imagen.IDImagen,
			&imagen.IDProducto,
			&imagen.ImagenURL,
			&imagen.PublicID,
			&imagen.Orden,
			&imagen.Principal,
		)

		if err != nil {
			return nil, err
		}

		imagenes = append(imagenes, imagen)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return imagenes, nil
}

func GetProductImageByID(
	productID string,
	imageID string,
) (*models.ProductoImagen, error) {

	query := `
		SELECT
			id_imagen,
			id_producto,
			imagen_url,
			public_id,
			orden,
			principal
		FROM producto_imagenes
		WHERE id_imagen = $1
		AND id_producto = $2
	`

	var image models.ProductoImagen

	err := database.DB.QueryRow(
		query,
		imageID,
		productID,
	).Scan(
		&image.IDImagen,
		&image.IDProducto,
		&image.ImagenURL,
		&image.PublicID,
		&image.Orden,
		&image.Principal,
	)

	if err != nil {
		return nil, err
	}

	return &image, nil
}

func DeleteProductImage(
	productID string,
	imageID string,
) error {

	query := `
		DELETE FROM producto_imagenes
		WHERE id_imagen = $1
		AND id_producto = $2
	`

	result, err := database.DB.Exec(
		query,
		imageID,
		productID,
	)

	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()

	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("imagen no encontrada")
	}

	return nil
}
