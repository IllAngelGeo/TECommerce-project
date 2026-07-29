package controller

import (
	"ecommerce-backend/internal/carrito/models"
	"ecommerce-backend/internal/carrito/repository"
	carritoService "ecommerce-backend/internal/carrito/service"

	"github.com/gin-gonic/gin"
)

func ObtenerCarrito(c *gin.Context) {

	idFirebase := c.Param("id")

	idUsuario, err := repository.ObtenerIDUsuarioFirebase(idFirebase)

	if err != nil {

		c.JSON(404, gin.H{
			"error": "usuario no encontrado",
		})

		return
	}

	carrito, err := repository.ObtenerCarrito(idUsuario)

	if err != nil {

		c.JSON(500, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(200, carrito)

}

func AgregarCarrito(c *gin.Context) {

	var carrito models.Carrito

	if err := c.ShouldBindJSON(&carrito); err != nil {

		c.JSON(400, gin.H{
			"error": "datos incorrectos",
		})

		return
	}

	idUsuario, err := repository.ObtenerIDUsuarioFirebase(
		carrito.IDUsuario,
	)

	if err != nil {

		c.JSON(500, gin.H{
			"error": "usuario no encontrado",
		})

		return
	}

	carrito.IDUsuario = idUsuario

	err = repository.AgregarProducto(&carrito)

	if err != nil {

		c.JSON(500, gin.H{
			"error": err.Error(),
		})

		return

	}

	c.JSON(200, gin.H{
		"mensaje": "producto agregado",
	})

}

func ActualizarCantidad(c *gin.Context) {

	idCarrito := c.Param("id_carrito")

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

		c.JSON(500, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(200, gin.H{
		"mensaje": "cantidad actualizada",
	})

}

func EliminarCarrito(c *gin.Context) {

	idCarrito := c.Param("id_carrito")

	err := carritoService.EliminarCarrito(
		idCarrito,
	)

	if err != nil {

		c.JSON(500, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(200, gin.H{
		"mensaje": "producto eliminado del carrito",
	})

}
