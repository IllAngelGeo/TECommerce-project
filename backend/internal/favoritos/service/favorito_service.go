package service

import (
	"errors"

	"ecommerce-backend/internal/favoritos/models"
	"ecommerce-backend/internal/favoritos/repository"
)

// AGREGAR FAVORITO
func AgregarFavorito(favorito *models.Favorito) error {

	if favorito.IDUsuario == "" {
		return errors.New("el usuario es obligatorio")
	}

	if favorito.IDProducto == "" {
		return errors.New("el producto es obligatorio")
	}

	// Verificar si ya existe
	existe, err := repository.ExisteFavorito(
		favorito.IDUsuario,
		favorito.IDProducto,
	)

	if err != nil {
		return err
	}

	if existe {
		return errors.New("el producto ya está en favoritos")
	}

	return repository.AgregarFavorito(favorito)
}

// OBTENER FAVORITOS
func ObtenerFavoritos(idUsuario string) ([]models.Favorito, error) {

	if idUsuario == "" {
		return nil, errors.New("usuario inválido")
	}

	return repository.ObtenerFavoritos(idUsuario)
}

// COMPROBAR FAVORITO
func ExisteFavorito(
	idUsuario string,
	idProducto string,
) (bool, error) {

	if idUsuario == "" {
		return false, errors.New("usuario inválido")
	}

	if idProducto == "" {
		return false, errors.New("producto inválido")
	}

	return repository.ExisteFavorito(
		idUsuario,
		idProducto,
	)
}

// ELIMINAR FAVORITO
func EliminarFavorito(
	idUsuario string,
	idProducto string,
) error {

	if idUsuario == "" {
		return errors.New("usuario inválido")
	}

	if idProducto == "" {
		return errors.New("producto inválido")
	}

	return repository.EliminarFavorito(
		idUsuario,
		idProducto,
	)
}
