package controller

import (
	"errors"

	pedidoRepository "ecommerce-backend/internal/pedido/repository"
	pedidoService "ecommerce-backend/internal/pedido/service"

	"github.com/gin-gonic/gin"
)

// ==========================================
// CREAR PEDIDO
// ==========================================

func CrearPedido(c *gin.Context) {

	idFirebase := c.Param("id")

	pedido, err := pedidoService.CrearPedido(
		idFirebase,
	)

	if err != nil {

		if errors.Is(
			err,
			pedidoRepository.ErrCarritoVacio,
		) {
			c.JSON(400, gin.H{
				"error": "el carrito está vacío",
			})
			return
		}

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

	c.JSON(201, gin.H{
		"mensaje": "pedido creado correctamente",
		"pedido":  pedido,
	})
}

// ==========================================
// OBTENER PEDIDOS
// ==========================================

func ObtenerPedidos(c *gin.Context) {

	idFirebase := c.Param("id")

	pedidos, err :=
		pedidoService.ObtenerPedidos(
			idFirebase,
		)

	if err != nil {

		c.JSON(404, gin.H{
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

	idPedido := c.Param("id_pedido")

	detalles, err :=
		pedidoService.ObtenerDetallesPedido(
			idPedido,
		)

	if err != nil {

		c.JSON(400, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(200, detalles)
}
