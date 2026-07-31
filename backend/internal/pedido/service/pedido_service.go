package service

import (
	"errors"

	"ecommerce-backend/internal/pedido/models"
	"ecommerce-backend/internal/pedido/repository"
)

// ==========================================
// CREAR PEDIDO
// ==========================================

func CrearPedido(
	idFirebase string,
) (*models.Pedido, error) {

	if idFirebase == "" {
		return nil, errors.New("id firebase obligatorio")
	}

	// Obtener el usuario real de PostgreSQL
	idUsuario, err :=
		repository.ObtenerIDUsuarioFirebase(
			idFirebase,
		)

	if err != nil {
		return nil, errors.New(
			"usuario no encontrado",
		)
	}

	// Crear pedido
	pedido, err :=
		repository.CrearPedido(idUsuario)

	if err != nil {
		return nil, err
	}

	return pedido, nil
}

// ==========================================
// OBTENER PEDIDOS
// ==========================================

func ObtenerPedidos(
	idFirebase string,
) ([]models.Pedido, error) {

	if idFirebase == "" {
		return nil, errors.New(
			"id firebase obligatorio",
		)
	}

	idUsuario, err :=
		repository.ObtenerIDUsuarioFirebase(
			idFirebase,
		)

	if err != nil {
		return nil, errors.New(
			"usuario no encontrado",
		)
	}

	return repository.ObtenerPedidos(
		idUsuario,
	)
}

// ==========================================
// OBTENER DETALLES
// ==========================================

func ObtenerDetallesPedido(
	idPedido string,
) ([]models.PedidoDetalle, error) {

	if idPedido == "" {
		return nil, errors.New(
			"id pedido obligatorio",
		)
	}

	return repository.ObtenerDetallesPedido(
		idPedido,
	)
}
