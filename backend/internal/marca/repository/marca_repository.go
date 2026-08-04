package repository

import (
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/marca/models"
)

// ==========================================
// OBTENER TODAS LAS MARCAS
// ==========================================

func GetAllMarcas() ([]models.Marca, error) {

	query := `
	SELECT
		id_marca,
		nombre,
		descripcion,
		activo,
		fecha_creacion
	FROM marcas
	ORDER BY id_marca ASC
	`

	rows, err := database.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var marcas []models.Marca

	for rows.Next() {

		var marca models.Marca

		err := rows.Scan(
			&marca.IDMarca,
			&marca.Nombre,
			&marca.Descripcion,
			&marca.Activo,
			&marca.FechaCreacion,
		)

		if err != nil {
			return nil, err
		}

		marcas = append(marcas, marca)
	}

	return marcas, nil
}

// ==========================================
// CREAR MARCA
// ==========================================

func CreateMarca(marca models.Marca) error {

	query := `
	INSERT INTO marcas
	(
		nombre,
		descripcion,
		activo
	)
	VALUES($1,$2,$3)
	`

	_, err := database.DB.Exec(
		query,
		marca.Nombre,
		marca.Descripcion,
		marca.Activo,
	)

	return err
}

// ==========================================
// OBTENER MARCA POR ID
// ==========================================

func GetMarcaByID(id int) (models.Marca, error) {

	var marca models.Marca

	query := `
	SELECT
		id_marca,
		nombre,
		descripcion,
		activo,
		fecha_creacion
	FROM marcas
	WHERE id_marca=$1
	`

	err := database.DB.QueryRow(
		query,
		id,
	).Scan(
		&marca.IDMarca,
		&marca.Nombre,
		&marca.Descripcion,
		&marca.Activo,
		&marca.FechaCreacion,
	)

	return marca, err
}

// ==========================================
// ACTUALIZAR MARCA
// ==========================================

func UpdateMarca(id int, marca models.Marca) error {

	query := `
	UPDATE marcas
	SET
		nombre=$1,
		descripcion=$2,
		activo=$3
	WHERE id_marca=$4
	`

	_, err := database.DB.Exec(
		query,
		marca.Nombre,
		marca.Descripcion,
		marca.Activo,
		id,
	)

	return err
}

// ==========================================
// ELIMINAR MARCA
// ==========================================

func DeleteMarca(id int) error {

	query := `
	DELETE FROM marcas
	WHERE id_marca=$1
	`

	_, err := database.DB.Exec(query, id)

	return err
}
