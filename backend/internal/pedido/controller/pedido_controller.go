package controller

import (
	"errors"

	pedidoRepository "ecommerce-backend/internal/pedido/repository"
	pedidoService "ecommerce-backend/internal/pedido/service"

	"github.com/gin-gonic/gin"
)

// ==========================================
// ESTRUCTURA PARA CREAR PEDIDO
// ==========================================

type CrearPedidoRequest struct {
	IDDireccion string `json:"id_direccion"`
	MetodoPago  string `json:"metodo_pago"`
}

// ==========================================
// CREAR PEDIDO
// ==========================================

func CrearPedido(c *gin.Context) {

	// ======================================
	// OBTENER FIREBASE UID
	// ======================================

	idFirebase := c.Param("id")

	// ======================================
	// LEER BODY JSON
	// ======================================

	var request CrearPedidoRequest

	if err := c.ShouldBindJSON(&request); err != nil {

		c.JSON(400, gin.H{
			"error": "datos del pedido inválidos",
		})

		return
	}

	// ======================================
	// VALIDAR DIRECCIÓN
	// ======================================

	if request.IDDireccion == "" {

		c.JSON(400, gin.H{
			"error": "id direccion obligatorio",
		})

		return
	}

	// ======================================
	// VALIDAR MÉTODO DE PAGO
	// ======================================

	if request.MetodoPago == "" {

		c.JSON(400, gin.H{
			"error": "metodo de pago obligatorio",
		})

		return
	}

	// ======================================
	// CREAR PEDIDO
	// ======================================

	pedido, err := pedidoService.CrearPedido(
		idFirebase,
		request.IDDireccion,
		request.MetodoPago,
	)

	if err != nil {

		// ==================================
		// CARRITO VACÍO
		// ==================================

		if errors.Is(
			err,
			pedidoRepository.ErrCarritoVacio,
		) {

			c.JSON(400, gin.H{
				"error": "el carrito está vacío",
			})

			return
		}

		// ==================================
		// STOCK INSUFICIENTE
		// ==================================

		if errors.Is(
			err,
			pedidoRepository.ErrStockInsuficiente,
		) {

			c.JSON(409, gin.H{
				"error":   "stock insuficiente",
				"detalle": err.Error(),
			})

			return
		}

		// ==================================
		// USUARIO NO ENCONTRADO
		// ==================================

		if err.Error() == "usuario no encontrado" {

			c.JSON(404, gin.H{
				"error": "usuario no encontrado",
			})

			return
		}

		// ==================================
		// ERROR DE DATOS
		// ==================================

		if err.Error() == "id firebase obligatorio" ||
			err.Error() == "id direccion obligatorio" ||
			err.Error() == "metodo de pago obligatorio" {

			c.JSON(400, gin.H{
				"error": err.Error(),
			})

			return
		}

		// ==================================
		// ERROR INTERNO
		// ==================================

		c.JSON(500, gin.H{
			"error": err.Error(),
		})

		return
	}

	// ======================================
	// RESPUESTA EXITOSA
	// ======================================

	c.JSON(201, gin.H{
		"mensaje": "pedido creado correctamente",
		"pedido":  pedido,
	})
}

// ==========================================
// OBTENER PEDIDOS
// ==========================================

func ObtenerPedidos(c *gin.Context) {

	// ======================================
	// OBTENER FIREBASE UID
	// ======================================

	idFirebase := c.Param("id")

	// ======================================
	// OBTENER PEDIDOS
	// ======================================

	pedidos, err :=
		pedidoService.ObtenerPedidos(
			idFirebase,
		)

	if err != nil {

		if err.Error() == "id firebase obligatorio" {

			c.JSON(400, gin.H{
				"error": err.Error(),
			})

			return
		}

		if err.Error() == "usuario no encontrado" {

			c.JSON(404, gin.H{
				"error": "usuario no encontrado",
			})

			return
		}

		c.JSON(500, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(200, pedidos)
}

// ==========================================
// OBTENER DETALLES DEL PEDIDO
// ==========================================

func ObtenerDetallesPedido(c *gin.Context) {

	// ======================================
	// OBTENER ID PEDIDO
	// ======================================

	idPedido := c.Param("id_pedido")

	// ======================================
	// OBTENER DETALLES
	// ======================================

	detalles, err :=
		pedidoService.ObtenerDetallesPedido(
			idPedido,
		)

	if err != nil {

		if err.Error() == "id pedido obligatorio" {

			c.JSON(400, gin.H{
				"error": err.Error(),
			})

			return
		}

		c.JSON(500, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(200, detalles)
}
