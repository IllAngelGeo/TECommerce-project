package service

import (
	"errors"

	"ecommerce-backend/internal/carrito/models"
	"ecommerce-backend/internal/carrito/repository"
)

func AgregarCarrito(carrito *models.Carrito) error {

	if carrito.IDUsuario == "" {
		return errors.New("el usuario es obligatorio")
	}

	if carrito.IDProducto == "" {
		return errors.New("el producto es obligatorio")
	}

	if carrito.Cantidad <= 0 {
		return errors.New("la cantidad debe ser mayor a cero")
	}

	return repository.AgregarProducto(carrito)

}

func ObtenerCarrito(idUsuario string) ([]models.Carrito, error) {

	if idUsuario == "" {
		return nil, errors.New("usuario inválido")
	}

	return repository.ObtenerCarrito(idUsuario)

}

func ActualizarCantidad(idCarrito string, cantidad int) error {

	if cantidad <= 0 {
		return errors.New("la cantidad debe ser mayor a cero")
	}

	return repository.ActualizarCantidad(
		idCarrito,
		cantidad,
	)

}

func EliminarCarrito(idCarrito string) error {

	if idCarrito == "" {
		return errors.New("id carrito vacío")
	}

	return repository.EliminarCarrito(
		idCarrito,
	)

}

