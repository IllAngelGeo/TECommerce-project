package repository

import (
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/favoritos/models"
)

// AGREGAR FAVORITO
func AgregarFavorito(favorito *models.Favorito) error {

	query := `
	INSERT INTO favoritos
	(
		id_usuario,
		id_producto
	)
	VALUES
	($1, $2)
	`

	_, err := database.DB.Exec(
		query,
		favorito.IDUsuario,
		favorito.IDProducto,
	)

	return err
}

// OBTENER FAVORITOS DE USUARIO
func ObtenerFavoritos(idUsuario string) ([]models.Favorito, error) {

	query := `
	SELECT
		f.id_favorito,
		f.id_usuario,
		f.id_producto,
		f.fecha_creacion,
		p.nombre,
		p.precio,
		pi.imagen_url

	FROM favoritos f

	INNER JOIN productos p
		ON p.id_producto = f.id_producto

	LEFT JOIN producto_imagenes pi
		ON pi.id_producto = p.id_producto
		AND pi.principal = true

	WHERE f.id_usuario = $1

	ORDER BY f.fecha_creacion DESC
	`

	rows, err := database.DB.Query(
		query,
		idUsuario,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var favoritos []models.Favorito

	for rows.Next() {

		var favorito models.Favorito

		err := rows.Scan(
			&favorito.IDFavorito,
			&favorito.IDUsuario,
			&favorito.IDProducto,
			&favorito.FechaCreacion,
			&favorito.Nombre,
			&favorito.Precio,
			&favorito.Imagen,
		)

		if err != nil {
			return nil, err
		}

		favoritos = append(favoritos, favorito)
	}

	if favoritos == nil {
		favoritos = []models.Favorito{}
	}

	return favoritos, nil
}

// COMPROBAR SI EXISTE FAVORITO
func ExisteFavorito(
	idUsuario string,
	idProducto string,
) (bool, error) {

	var existe bool

	query := `
	SELECT EXISTS (
		SELECT 1
		FROM favoritos
		WHERE id_usuario = $1
		AND id_producto = $2
	)
	`

	err := database.DB.QueryRow(
		query,
		idUsuario,
		idProducto,
	).Scan(&existe)

	return existe, err
}

// ELIMINAR FAVORITO
func EliminarFavorito(idUsuario string, idProducto string) error {

	query := `
	DELETE FROM favoritos
	WHERE id_usuario = $1
	AND id_producto = $2
	`

	_, err := database.DB.Exec(
		query,
		idUsuario,
		idProducto,
	)

	return err
}

// OBTENER ID USUARIO POR FIREBASE
func ObtenerIDUsuarioFirebase(
	idFirebase string,
) (string, error) {

	var id string

	query := `
	SELECT id_usuario
	FROM usuarios
	WHERE id_firebase = $1
	`

	err := database.DB.QueryRow(
		query,
		idFirebase,
	).Scan(&id)

	return id, err
}
