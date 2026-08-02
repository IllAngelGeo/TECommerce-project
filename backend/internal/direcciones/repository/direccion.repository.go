package repository

import (
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/direcciones/models"
)

// ==========================================
// OBTENER ID USUARIO POR FIREBASE
// ==========================================

func ObtenerIDUsuarioFirebase(idFirebase string) (string, error) {

	var idUsuario string

	query := `
		SELECT id_usuario
		FROM usuarios
		WHERE id_firebase = $1
	`

	err := database.DB.QueryRow(
		query,
		idFirebase,
	).Scan(&idUsuario)

	return idUsuario, err
}

// ==========================================
// CREAR DIRECCIÓN
// ==========================================

func CrearDireccion(
	direccion models.Direccion,
) (*models.Direccion, error) {

	query := `
		INSERT INTO direcciones
		(
			id_usuario,
			calle,
			numero_exterior,
			numero_interior,
			colonia,
			codigo_postal,
			ciudad,
			estado,
			referencias,
			principal
		)
		VALUES
		(
			$1,
			$2,
			$3,
			$4,
			$5,
			$6,
			$7,
			$8,
			$9,
			$10
		)
		RETURNING
			id_direccion,
			fecha_creacion,
			fecha_actualizacion
	`

	err := database.DB.QueryRow(
		query,
		direccion.IDUsuario,
		direccion.Calle,
		direccion.NumeroExterior,
		direccion.NumeroInterior,
		direccion.Colonia,
		direccion.CodigoPostal,
		direccion.Ciudad,
		direccion.Estado,
		direccion.Referencias,
		direccion.Principal,
	).Scan(
		&direccion.IDDireccion,
		&direccion.FechaCreacion,
		&direccion.FechaActualizacion,
	)

	if err != nil {
		return nil, err
	}

	return &direccion, nil
}

// ==========================================
// OBTENER DIRECCIONES
// ==========================================

func ObtenerDirecciones(
	idUsuario string,
) ([]models.Direccion, error) {

	query := `
		SELECT
			id_direccion,
			id_usuario,
			calle,
			numero_exterior,
			COALESCE(numero_interior, ''),
			colonia,
			codigo_postal,
			ciudad,
			estado,
			COALESCE(referencias, ''),
			principal,
			fecha_creacion,
			fecha_actualizacion
		FROM direcciones
		WHERE id_usuario = $1
		ORDER BY principal DESC, fecha_creacion DESC
	`

	rows, err := database.DB.Query(
		query,
		idUsuario,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var direcciones []models.Direccion

	for rows.Next() {

		var direccion models.Direccion

		err := rows.Scan(
			&direccion.IDDireccion,
			&direccion.IDUsuario,
			&direccion.Calle,
			&direccion.NumeroExterior,
			&direccion.NumeroInterior,
			&direccion.Colonia,
			&direccion.CodigoPostal,
			&direccion.Ciudad,
			&direccion.Estado,
			&direccion.Referencias,
			&direccion.Principal,
			&direccion.FechaCreacion,
			&direccion.FechaActualizacion,
		)

		if err != nil {
			return nil, err
		}

		direcciones = append(
			direcciones,
			direccion,
		)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if direcciones == nil {
		direcciones = []models.Direccion{}

	}

	return direcciones, nil
}

// ==========================================
// ACTUALIZAR DIRECCIÓN
// ==========================================

func ActualizarDireccion(
	idDireccion string,
	direccion models.Direccion,
) (*models.Direccion, error) {

	query := `
		UPDATE direcciones
		SET
			calle = $1,
			numero_exterior = $2,
			numero_interior = $3,
			colonia = $4,
			codigo_postal = $5,
			ciudad = $6,
			estado = $7,
			referencias = $8,
			fecha_actualizacion = now()
		WHERE id_direccion = $9
		RETURNING
			id_direccion,
			id_usuario,
			calle,
			numero_exterior,
			COALESCE(numero_interior, ''),
			colonia,
			codigo_postal,
			ciudad,
			estado,
			COALESCE(referencias, ''),
			principal,
			fecha_creacion,
			fecha_actualizacion
	`

	var resultado models.Direccion

	err := database.DB.QueryRow(
		query,
		direccion.Calle,
		direccion.NumeroExterior,
		direccion.NumeroInterior,
		direccion.Colonia,
		direccion.CodigoPostal,
		direccion.Ciudad,
		direccion.Estado,
		direccion.Referencias,
		idDireccion,
	).Scan(
		&resultado.IDDireccion,
		&resultado.IDUsuario,
		&resultado.Calle,
		&resultado.NumeroExterior,
		&resultado.NumeroInterior,
		&resultado.Colonia,
		&resultado.CodigoPostal,
		&resultado.Ciudad,
		&resultado.Estado,
		&resultado.Referencias,
		&resultado.Principal,
		&resultado.FechaCreacion,
		&resultado.FechaActualizacion,
	)

	if err != nil {
		return nil, err
	}

	return &resultado, nil
}

// ==========================================
// ELIMINAR DIRECCIÓN
// ==========================================

func EliminarDireccion(
	idDireccion string,
) error {

	query := `
		DELETE FROM direcciones
		WHERE id_direccion = $1
	`

	result, err := database.DB.Exec(
		query,
		idDireccion,
	)

	if err != nil {
		return err
	}

	filas, err := result.RowsAffected()

	if err != nil {
		return err
	}

	if filas == 0 {
		return ErrDireccionNoExiste
	}

	return nil
}

// ==========================================
// MARCAR COMO PRINCIPAL
// ==========================================

func MarcarPrincipal(
	idDireccion string,
	idUsuario string,
) (*models.Direccion, error) {

	tx, err := database.DB.Begin()

	if err != nil {
		return nil, err
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// Primero quitamos la dirección principal actual
	_, err = tx.Exec(
		`
		UPDATE direcciones
		SET
			principal = false,
			fecha_actualizacion = now()
		WHERE id_usuario = $1
		AND principal = true
		`,
		idUsuario,
	)

	if err != nil {
		return nil, err
	}

	// Ahora ponemos la nueva como principal
	var direccion models.Direccion

	err = tx.QueryRow(
		`
		UPDATE direcciones
		SET
			principal = true,
			fecha_actualizacion = now()
		WHERE id_direccion = $1
		AND id_usuario = $2
		RETURNING
			id_direccion,
			id_usuario,
			calle,
			numero_exterior,
			COALESCE(numero_interior, ''),
			colonia,
			codigo_postal,
			ciudad,
			estado,
			COALESCE(referencias, ''),
			principal,
			fecha_creacion,
			fecha_actualizacion
		`,
		idDireccion,
		idUsuario,
	).Scan(
		&direccion.IDDireccion,
		&direccion.IDUsuario,
		&direccion.Calle,
		&direccion.NumeroExterior,
		&direccion.NumeroInterior,
		&direccion.Colonia,
		&direccion.CodigoPostal,
		&direccion.Ciudad,
		&direccion.Estado,
		&direccion.Referencias,
		&direccion.Principal,
		&direccion.FechaCreacion,
		&direccion.FechaActualizacion,
	)

	if err != nil {
		tx.Rollback()
		return nil, err
	}

	err = tx.Commit()

	if err != nil {
		return nil, err
	}

	return &direccion, nil
}

// ==========================================
// ERRORES
// ==========================================

var ErrDireccionNoExiste = errorDireccionNoExiste{}

type errorDireccionNoExiste struct{}

func (errorDireccionNoExiste) Error() string {
	return "direccion no existe"
}
