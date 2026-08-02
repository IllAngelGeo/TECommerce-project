package service

import (
	"errors"

	"ecommerce-backend/internal/usuarios/models"
	"ecommerce-backend/internal/usuarios/repository"
)

// REGISTRAR USUARIO
func RegisterUser(user *models.User) error {

	if user.Email == "" || user.IDFirebase == "" {
		return errors.New("email e id_firebase son obligatorios")
	}

	return repository.CreateUser(user)
}

// OBTENER USUARIO POR ID DE FIREBASE
func GetUserByFirebaseID(idFirebase string) (*models.User, error) {

	if idFirebase == "" {
		return nil, errors.New("id_firebase es obligatorio")
	}

	return repository.GetUserByFirebaseID(idFirebase)
}

// ACTUALIZAR USUARIO
func UpdateUserByFirebaseID(
	idFirebase string,
	user *models.User,
) error {

	if idFirebase == "" {
		return errors.New("id_firebase es obligatorio")
	}

	if user.Nombre == "" {
		return errors.New("el nombre es obligatorio")
	}

	if user.ApellidoPaterno == "" {
		return errors.New("el apellido paterno es obligatorio")
	}

	if user.ApellidoMaterno == "" {
		return errors.New("el apellido materno es obligatorio")
	}

	if user.Telefono == "" {
		return errors.New("el teléfono es obligatorio")
	}

	return repository.UpdateUserByFirebaseID(
		idFirebase,
		user,
	)
}
