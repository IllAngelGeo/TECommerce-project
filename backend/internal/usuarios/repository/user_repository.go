package repository

import (
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/usuarios/models"
)

func CreateUser(user *models.User) error {

	query := `
		INSERT INTO usuarios (id_firebase,email,nombre,apellido_paterno,apellido_materno,telefono,provider)
		VALUES ($1,$2,$3,$4,$5,$6,$7)
	`

	_, err := database.DB.Exec(
		query,
		user.IDFirebase,
		user.Email,
		user.Nombre,
		user.ApellidoPaterno,
		user.ApellidoMaterno,
		user.Telefono,
		user.Provider,
	)

	return err
}
