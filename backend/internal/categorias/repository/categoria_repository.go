package repository

import (
	"ecommerce-backend/internal/categorias/models"
	"ecommerce-backend/internal/database"
)

func GetAllCategories() ([]models.Categoria, error) {

	query := `
		SELECT
			id_categoria,
			nombre,
			descripcion,
			imagen_url,
			activo,
			fecha_creacion
		FROM categorias
		WHERE activo = true
		ORDER BY id_categoria ASC
	`

	rows, err := database.DB.Query(query)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var categorias []models.Categoria

	for rows.Next() {

		var categoria models.Categoria

		err := rows.Scan(
			&categoria.IDCategoria,
			&categoria.Nombre,
			&categoria.Descripcion,
			&categoria.ImagenURL,
			&categoria.Activo,
			&categoria.FechaCreacion,
		)

		if err != nil {
			return nil, err
		}

		categorias = append(categorias, categoria)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return categorias, nil
}
