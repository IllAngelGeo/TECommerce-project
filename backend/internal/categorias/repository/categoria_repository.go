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

func CreateCategory(categoria models.Categoria) error {

	query := `
		INSERT INTO categorias
		(
			nombre,
			descripcion,
			activo
		)
		VALUES ($1,$2,$3)
	`

	_, err := database.DB.Exec(
		query,
		categoria.Nombre,
		categoria.Descripcion,
		categoria.Activo,
	)

	return err
}

func UpdateCategory(id int, categoria models.Categoria) error {

	query := `
		UPDATE categorias
		SET
			nombre = $1,
			descripcion = $2,
			activo = $3
		WHERE id_categoria = $4
	`

	_, err := database.DB.Exec(
		query,
		categoria.Nombre,
		categoria.Descripcion,
		categoria.Activo,
		id,
	)

	return err
}

func GetCategoryByID(id int) (models.Categoria, error) {

	var categoria models.Categoria

	query := `
		SELECT
			id_categoria,
			nombre,
			descripcion,
			activo,
			fecha_creacion
		FROM categorias
		WHERE id_categoria = $1
	`

	err := database.DB.QueryRow(
		query,
		id,
	).Scan(
		&categoria.IDCategoria,
		&categoria.Nombre,
		&categoria.Descripcion,
		&categoria.Activo,
		&categoria.FechaCreacion,
	)

	return categoria, err
}

func DeleteCategory(id int) error {

	query := `
		DELETE FROM categorias
		WHERE id_categoria = $1
	`

	_, err := database.DB.Exec(
		query,
		id,
	)

	return err
}
	