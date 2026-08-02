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
	idDireccion string,
	metodoPago string,
) (*models.Pedido, error) {

	// ======================================
	// VALIDAR FIREBASE
	// ======================================

	if idFirebase == "" {
		return nil, errors.New(
			"id firebase obligatorio",
		)
	}

	// ======================================
	// VALIDAR DIRECCIÓN
	// ======================================

	if idDireccion == "" {
		return nil, errors.New(
			"id direccion obligatorio",
		)
	}

	// ======================================
	// VALIDAR MÉTODO DE PAGO
	// ======================================

	if metodoPago == "" {
		return nil, errors.New(
			"metodo de pago obligatorio",
		)
	}

	if metodoPago != "efectivo" &&
		metodoPago != "tarjeta" {

		return nil, errors.New(
			"metodo de pago no válido",
		)
	}

	// ======================================
	// OBTENER USUARIO REAL
	// ======================================

	idUsuario, err :=
		repository.ObtenerIDUsuarioFirebase(
			idFirebase,
		)

	if err != nil {
		return nil, errors.New(
			"usuario no encontrado",
		)
	}

	// ======================================
	// CREAR PEDIDO
	// ======================================

	pedido, err :=
		repository.CrearPedido(
			idUsuario,
			idDireccion,
			metodoPago,
		)

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

	// ======================================
	// OBTENER USUARIO
	// ======================================

	idUsuario, err :=
		repository.ObtenerIDUsuarioFirebase(
			idFirebase,
		)

	if err != nil {
		return nil, errors.New(
			"usuario no encontrado",
		)
	}

	// ======================================
	// OBTENER PEDIDOS
	// ======================================

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
