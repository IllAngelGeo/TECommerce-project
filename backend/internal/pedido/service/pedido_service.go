package service

import (
	"errors"
	"strings"

	"ecommerce-backend/internal/pedido/models"
	"ecommerce-backend/internal/pedido/repository"
)

// ==========================================
// ESTADOS PERMITIDOS
// ==========================================

const (
	EstadoPendiente = "pendiente"
	EstadoEnProceso = "en_proceso"
	EstadoEntregado = "entregado"
)

var (
	ErrEstadoNoValido = errors.New(
		"estado de pedido no válido",
	)

	ErrTransicionNoValida = errors.New(
		"transición de estado no permitida",
	)
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

	if strings.TrimSpace(idFirebase) == "" {
		return nil, errors.New(
			"id firebase obligatorio",
		)
	}

	// ======================================
	// VALIDAR DIRECCIÓN
	// ======================================

	if strings.TrimSpace(idDireccion) == "" {
		return nil, errors.New(
			"id direccion obligatorio",
		)
	}

	// ======================================
	// VALIDAR MÉTODO DE PAGO
	// ======================================

	metodoPago = strings.ToLower(
		strings.TrimSpace(metodoPago),
	)

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
// OBTENER PEDIDOS DEL USUARIO
// ==========================================

func ObtenerPedidos(
	idFirebase string,
) ([]models.Pedido, error) {

	if strings.TrimSpace(idFirebase) == "" {
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
// OBTENER TODOS LOS PEDIDOS PARA ADMIN
// ==========================================

func ObtenerTodosLosPedidos() (
	[]models.Pedido,
	error,
) {

	pedidos, err :=
		repository.ObtenerTodosLosPedidos()

	if err != nil {
		return nil, err
	}

	return pedidos, nil
}

// ==========================================
// OBTENER PEDIDO POR ID
// ==========================================

func ObtenerPedidoPorID(
	idPedido string,
) (*models.Pedido, error) {

	idPedido = strings.TrimSpace(idPedido)

	if idPedido == "" {
		return nil, errors.New(
			"id pedido obligatorio",
		)
	}

	pedido, err :=
		repository.ObtenerPedidoPorID(
			idPedido,
		)

	if err != nil {
		return nil, err
	}

	return pedido, nil
}

// ==========================================
// ACTUALIZAR ESTADO DEL PEDIDO
// ==========================================

func ActualizarEstadoPedido(
	idPedido string,
	nuevoEstado string,
) (*models.Pedido, error) {

	idPedido = strings.TrimSpace(idPedido)

	if idPedido == "" {
		return nil, errors.New(
			"id pedido obligatorio",
		)
	}

	nuevoEstado = NormalizarEstado(
		nuevoEstado,
	)

	if nuevoEstado == "" {
		return nil, ErrEstadoNoValido
	}

	// ======================================
	// OBTENER PEDIDO ACTUAL
	// ======================================

	pedidoActual, err :=
		repository.ObtenerPedidoPorID(
			idPedido,
		)

	if err != nil {
		return nil, err
	}

	// ======================================
	// VALIDAR SI YA TIENE EL MISMO ESTADO
	// ======================================

	if pedidoActual.Estado == nuevoEstado {
		return pedidoActual, nil
	}

	// ======================================
	// VALIDAR TRANSICIÓN
	// ======================================

	if !EsTransicionValida(
		pedidoActual.Estado,
		nuevoEstado,
	) {
		return nil, ErrTransicionNoValida
	}

	// ======================================
	// ACTUALIZAR EN BASE DE DATOS
	// ======================================

	pedidoActualizado, err :=
		repository.ActualizarEstadoPedido(
			idPedido,
			nuevoEstado,
		)

	if err != nil {
		return nil, err
	}

	return pedidoActualizado, nil
}

// ==========================================
// NORMALIZAR ESTADO
// ==========================================

func NormalizarEstado(
	estado string,
) string {

	estado = strings.ToLower(
		strings.TrimSpace(estado),
	)

	switch estado {

	case "pendiente":
		return EstadoPendiente

	case "en_proceso",
		"en proceso",
		"proceso",
		"procesando":

		return EstadoEnProceso

	case "entregado",
		"completado",
		"finalizado":

		return EstadoEntregado

	default:
		return ""
	}
}

// ==========================================
// VALIDAR ESTADO
// ==========================================

func EsEstadoValido(
	estado string,
) bool {

	estado = NormalizarEstado(
		estado,
	)

	return estado == EstadoPendiente ||
		estado == EstadoEnProceso ||
		estado == EstadoEntregado
}

// ==========================================
// VALIDAR TRANSICIÓN ENTRE ESTADOS
// ==========================================

func EsTransicionValida(
	estadoActual string,
	nuevoEstado string,
) bool {

	estadoActual = NormalizarEstado(
		estadoActual,
	)

	nuevoEstado = NormalizarEstado(
		nuevoEstado,
	)

	switch estadoActual {

	case EstadoPendiente:

		// Un pedido pendiente solamente puede
		// avanzar a en proceso.
		return nuevoEstado == EstadoEnProceso

	case EstadoEnProceso:

		// Se permite regresar a pendiente
		// o avanzar a entregado.
		return nuevoEstado == EstadoPendiente ||
			nuevoEstado == EstadoEntregado

	case EstadoEntregado:

		// Un pedido entregado se considera finalizado
		// y ya no puede modificarse.
		return false

	default:
		return false
	}
}

// ==========================================
// OBTENER DETALLES
// ==========================================

func ObtenerDetallesPedido(
	idPedido string,
) ([]models.PedidoDetalle, error) {

	idPedido = strings.TrimSpace(idPedido)

	if idPedido == "" {
		return nil, errors.New(
			"id pedido obligatorio",
		)
	}

	return repository.ObtenerDetallesPedido(
		idPedido,
	)
}
