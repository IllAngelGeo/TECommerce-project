package service

import (
	"errors"

	"ecommerce-backend/internal/usuarios/models"
	"ecommerce-backend/internal/usuarios/repository"
)

func RegisterUser(user *models.User) error {

	if user.Email == "" || user.IDFirebase == "" {
		return errors.New("email e id_firebase son obligatorios")
	}

	return repository.CreateUser(user)
}
