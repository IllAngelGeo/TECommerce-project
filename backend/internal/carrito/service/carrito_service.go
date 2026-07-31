package service

import (
	"errors"

	"ecommerce-backend/internal/carrito/models"
	"ecommerce-backend/internal/carrito/repository"
)

// ==========================================
// AGREGAR PRODUCTO AL CARRITO
// ==========================================

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

	err := repository.AgregarProducto(carrito)

	if err != nil {

		if errors.Is(err, repository.ErrStockInsuficiente) {
			return errors.New("no hay suficiente stock")
		}

		return err
	}

	return nil
}

// ==========================================
// OBTENER CARRITO
// ==========================================

func ObtenerCarrito(idUsuario string) ([]models.Carrito, error) {

	if idUsuario == "" {
		return nil, errors.New("usuario inválido")
	}

	return repository.ObtenerCarrito(idUsuario)
}

// ==========================================
// ACTUALIZAR CANTIDAD
// ==========================================

func ActualizarCantidad(
	idCarrito string,
	cantidad int,
) error {

	if idCarrito == "" {
		return errors.New("id carrito vacío")
	}

	if cantidad <= 0 {
		return errors.New("la cantidad debe ser mayor a cero")
	}

	err := repository.ActualizarCantidad(
		idCarrito,
		cantidad,
	)

	if err != nil {

		if errors.Is(err, repository.ErrStockInsuficiente) {
			return errors.New("la cantidad supera el stock disponible")
		}

		return err
	}

	return nil
}

// ==========================================
// ELIMINAR PRODUCTO
// ==========================================

func EliminarCarrito(
	idCarrito string,
) error {

	if idCarrito == "" {
		return errors.New("id carrito vacío")
	}

	return repository.EliminarCarrito(
		idCarrito,
	)
}
