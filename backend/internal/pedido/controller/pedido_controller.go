package controller

import (
	"errors"
	"net/http"

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
// ESTRUCTURA PARA ACTUALIZAR ESTADO
// ==========================================

type ActualizarEstadoPedidoRequest struct {
	Estado string `json:"estado"`
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

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "datos del pedido inválidos",
		})

		return
	}

	// ======================================
	// VALIDAR DIRECCIÓN
	// ======================================

	if request.IDDireccion == "" {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id direccion obligatorio",
		})

		return
	}

	// ======================================
	// VALIDAR MÉTODO DE PAGO
	// ======================================

	if request.MetodoPago == "" {

		c.JSON(http.StatusBadRequest, gin.H{
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

			c.JSON(http.StatusBadRequest, gin.H{
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

			c.JSON(http.StatusConflict, gin.H{
				"error":   "stock insuficiente",
				"detalle": err.Error(),
			})

			return
		}

		// ==================================
		// USUARIO NO ENCONTRADO
		// ==================================

		if err.Error() == "usuario no encontrado" {

			c.JSON(http.StatusNotFound, gin.H{
				"error": "usuario no encontrado",
			})

			return
		}

		// ==================================
		// ERROR DE DATOS
		// ==================================

		if err.Error() == "id firebase obligatorio" ||
			err.Error() == "id direccion obligatorio" ||
			err.Error() == "metodo de pago obligatorio" ||
			err.Error() == "metodo de pago no válido" {

			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

			return
		}

		// ==================================
		// ERROR INTERNO
		// ==================================

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	// ======================================
	// RESPUESTA EXITOSA
	// ======================================

	c.JSON(http.StatusCreated, gin.H{
		"mensaje": "pedido creado correctamente",
		"pedido":  pedido,
	})
}

// ==========================================
// OBTENER PEDIDOS DEL USUARIO
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

			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

			return
		}

		if err.Error() == "usuario no encontrado" {

			c.JSON(http.StatusNotFound, gin.H{
				"error": "usuario no encontrado",
			})

			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, pedidos)
}

// ==========================================
// OBTENER TODOS LOS PEDIDOS PARA ADMIN
// ==========================================

func ObtenerTodosLosPedidos(c *gin.Context) {

	pedidos, err :=
		pedidoService.ObtenerTodosLosPedidos()

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "no fue posible obtener los pedidos",
		})

		return
	}

	c.JSON(http.StatusOK, pedidos)
}

// ==========================================
// OBTENER PEDIDO POR ID PARA ADMIN
// ==========================================

func ObtenerPedidoPorID(c *gin.Context) {

	idPedido := c.Param("id_pedido")

	pedido, err :=
		pedidoService.ObtenerPedidoPorID(
			idPedido,
		)

	if err != nil {

		if err.Error() == "id pedido obligatorio" {

			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

			return
		}

		if errors.Is(
			err,
			pedidoRepository.ErrPedidoNoExiste,
		) {

			c.JSON(http.StatusNotFound, gin.H{
				"error": "pedido no encontrado",
			})

			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, pedido)
}

// ==========================================
// ACTUALIZAR ESTADO DEL PEDIDO
// ==========================================

func ActualizarEstadoPedido(c *gin.Context) {

	// ======================================
	// OBTENER ID DEL PEDIDO
	// ======================================

	idPedido := c.Param("id_pedido")

	// ======================================
	// LEER BODY
	// ======================================

	var request ActualizarEstadoPedidoRequest

	if err := c.ShouldBindJSON(&request); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "datos inválidos",
		})

		return
	}

	if request.Estado == "" {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "estado obligatorio",
		})

		return
	}

	// ======================================
	// ACTUALIZAR ESTADO
	// ======================================

	pedido, err :=
		pedidoService.ActualizarEstadoPedido(
			idPedido,
			request.Estado,
		)

	if err != nil {

		if err.Error() == "id pedido obligatorio" {

			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

			return
		}

		if errors.Is(
			err,
			pedidoRepository.ErrPedidoNoExiste,
		) {

			c.JSON(http.StatusNotFound, gin.H{
				"error": "pedido no encontrado",
			})

			return
		}

		if errors.Is(
			err,
			pedidoService.ErrEstadoNoValido,
		) {

			c.JSON(http.StatusBadRequest, gin.H{
				"error": "estado de pedido no válido",
				"estados_permitidos": []string{
					pedidoService.EstadoPendiente,
					pedidoService.EstadoEnProceso,
					pedidoService.EstadoEntregado,
				},
			})

			return
		}

		if errors.Is(
			err,
			pedidoService.ErrTransicionNoValida,
		) {

			c.JSON(http.StatusConflict, gin.H{
				"error": "transición de estado no permitida",
			})

			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"mensaje": "estado actualizado correctamente",
		"pedido":  pedido,
	})
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
	// OBTENER PEDIDO
	// ======================================

	pedido, err :=
		pedidoService.ObtenerPedidoPorID(
			idPedido,
		)

	if err != nil {

		if err.Error() == "id pedido obligatorio" {

			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})

			return
		}

		if errors.Is(
			err,
			pedidoRepository.ErrPedidoNoExiste,
		) {

			c.JSON(http.StatusNotFound, gin.H{
				"error": "pedido no encontrado",
			})

			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	// ======================================
	// OBTENER DETALLES
	// ======================================

	detalles, err :=
		pedidoService.ObtenerDetallesPedido(
			idPedido,
		)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	// ======================================
	// RESPUESTA CON ESTADO DEL ENVÍO
	// ======================================

	c.JSON(http.StatusOK, gin.H{
		"estado_envio": pedido.Estado,
		"detalles":     detalles,
	})
}
