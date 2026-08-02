package repository

import (
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/usuarios/models"
)

// CREAR USUARIO
func CreateUser(user *models.User) error {

	query := `
    INSERT INTO usuarios (
        id_firebase,
        email,
        nombre,
        apellido_paterno,
        apellido_materno,
        fecha_nacimiento,
        telefono,
        provider,
        rol
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
`

	_, err := database.DB.Exec(
		query,
		user.IDFirebase,
		user.Email,
		user.Nombre,
		user.ApellidoPaterno,
		user.ApellidoMaterno,
		user.FechaNacimiento,
		user.Telefono,
		user.Provider,
		"cliente",
	)

	return err
}

// OBTENER USUARIO POR ID DE FIREBASE
// OBTENER USUARIO POR ID DE FIREBASE
func GetUserByFirebaseID(idFirebase string) (*models.User, error) {

	user := &models.User{}

	query := `
		SELECT
			id_firebase,
			email,
			nombre,
			apellido_paterno,
			apellido_materno,
			fecha_nacimiento,
			telefono,
			provider,
			rol
		FROM usuarios
		WHERE id_firebase = $1
	`

	err := database.DB.QueryRow(
		query,
		idFirebase,
	).Scan(
		&user.IDFirebase,
		&user.Email,
		&user.Nombre,
		&user.ApellidoPaterno,
		&user.ApellidoMaterno,
		&user.FechaNacimiento,
		&user.Telefono,
		&user.Provider,
		&user.Rol,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

// ACTUALIZAR USUARIO
func UpdateUserByFirebaseID(
	idFirebase string,
	user *models.User,
) error {

	query := `
		UPDATE usuarios
		SET
			nombre = $1,
			apellido_paterno = $2,
			apellido_materno = $3,
			telefono = $4
		WHERE id_firebase = $5
	`

	_, err := database.DB.Exec(
		query,
		user.Nombre,
		user.ApellidoPaterno,
		user.ApellidoMaterno,
		user.Telefono,
		idFirebase,
	)

	return err
}
