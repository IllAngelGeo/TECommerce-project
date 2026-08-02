package controller

import (
	"errors"

	"ecommerce-backend/internal/carrito/models"
	"ecommerce-backend/internal/carrito/repository"
	carritoService "ecommerce-backend/internal/carrito/service"

	"github.com/gin-gonic/gin"
)

// ==========================================
// OBTENER CARRITO
// ==========================================

func ObtenerCarrito(c *gin.Context) {

	idFirebase := c.Param("id")

	if idFirebase == "" {
		c.JSON(400, gin.H{
			"error": "id firebase obligatorio",
		})

		return
	}

	idUsuario, err := repository.ObtenerIDUsuarioFirebase(
		idFirebase,
	)

	if err != nil {

		c.JSON(404, gin.H{
			"error": "usuario no encontrado",
		})

		return
	}

	carrito, err := carritoService.ObtenerCarrito(
		idUsuario,
	)

	if err != nil {

		c.JSON(500, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(200, carrito)
}

// ==========================================
// AGREGAR AL CARRITO
// ==========================================

func AgregarCarrito(c *gin.Context) {

	var carrito models.Carrito

	if err := c.ShouldBindJSON(&carrito); err != nil {

		c.JSON(400, gin.H{
			"error": "datos incorrectos",
		})

		return
	}

	// El frontend manda Firebase UID.
	// Primero obtenemos el UUID real de PostgreSQL.

	idUsuario, err := repository.ObtenerIDUsuarioFirebase(
		carrito.IDUsuario,
	)

	if err != nil {

		c.JSON(404, gin.H{
			"error": "usuario no encontrado",
		})

		return
	}

	carrito.IDUsuario = idUsuario

	// Pasamos por SERVICE.

	err = carritoService.AgregarCarrito(
		&carrito,
	)

	if err != nil {

		if errors.Is(
			err,
			repository.ErrStockInsuficiente,
		) {

			c.JSON(409, gin.H{
				"error": "stock insuficiente",
			})

			return
		}

		if errors.Is(
			err,
			repository.ErrProductoNoExiste,
		) {

			c.JSON(404, gin.H{
				"error": "producto no existe",
			})

			return
		}

		c.JSON(500, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(200, gin.H{
		"mensaje": "producto agregado al carrito",
	})
}

// ==========================================
// ACTUALIZAR CANTIDAD
// ==========================================

func ActualizarCantidad(c *gin.Context) {

	idCarrito := c.Param("id_carrito")

	if idCarrito == "" {

		c.JSON(400, gin.H{
			"error": "id carrito obligatorio",
		})

		return
	}

	var datos struct {
		Cantidad int `json:"cantidad"`
	}

	if err := c.ShouldBindJSON(&datos); err != nil {

		c.JSON(400, gin.H{
			"error": "datos incorrectos",
		})

		return
	}

	err := carritoService.ActualizarCantidad(
		idCarrito,
		datos.Cantidad,
	)

	if err != nil {

		if errors.Is(
			err,
			repository.ErrStockInsuficiente,
		) {

			c.JSON(409, gin.H{
				"error": "stock insuficiente",
			})

			return
		}

		if errors.Is(
			err,
			repository.ErrCarritoNoExiste,
		) {

			c.JSON(404, gin.H{
				"error": "producto no existe en el carrito",
			})

			return
		}

		c.JSON(400, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(200, gin.H{
		"mensaje": "cantidad actualizada",
	})
}

// ==========================================
// ELIMINAR DEL CARRITO
// ==========================================

func EliminarCarrito(c *gin.Context) {

	idCarrito := c.Param("id_carrito")

	if idCarrito == "" {

		c.JSON(400, gin.H{
			"error": "id carrito obligatorio",
		})

		return
	}

	err := carritoService.EliminarCarrito(
		idCarrito,
	)

	if err != nil {

		if errors.Is(
			err,
			repository.ErrCarritoNoExiste,
		) {

			c.JSON(404, gin.H{
				"error": "producto no existe en el carrito",
			})

			return
		}

		c.JSON(500, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(200, gin.H{
		"mensaje": "producto eliminado del carrito",
	})
}