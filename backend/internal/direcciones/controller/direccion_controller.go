package controller

import (
	"net/http"

	"ecommerce-backend/internal/direcciones/models"
	direccionService "ecommerce-backend/internal/direcciones/service"

	"github.com/gin-gonic/gin"
)

// ==========================================
// CREAR DIRECCIÓN
// ==========================================

func CrearDireccion(c *gin.Context) {

	idFirebase := c.Param("id")

	var direccion models.Direccion

	if err := c.ShouldBindJSON(&direccion); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "datos de dirección inválidos",
		})

		return
	}

	resultado, err :=
		direccionService.CrearDireccion(
			idFirebase,
			direccion,
		)

	if err != nil {

		if err.Error() == "usuario no encontrado" {

			c.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})

			return
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"mensaje":   "dirección creada correctamente",
		"direccion": resultado,
	})
}

// ==========================================
// OBTENER DIRECCIONES
// ==========================================

func ObtenerDirecciones(c *gin.Context) {

	idFirebase := c.Param("id")

	direcciones, err :=
		direccionService.ObtenerDirecciones(
			idFirebase,
		)

	if err != nil {

		if err.Error() == "usuario no encontrado" {

			c.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})

			return
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, direcciones)
}

// ==========================================
// ACTUALIZAR DIRECCIÓN
// ==========================================

func ActualizarDireccion(c *gin.Context) {

	idFirebase := c.Param("id")
	idDireccion := c.Param("id_direccion")

	var direccion models.Direccion

	if err := c.ShouldBindJSON(&direccion); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "datos de dirección inválidos",
		})

		return
	}

	resultado, err :=
		direccionService.ActualizarDireccion(
			idFirebase,
			idDireccion,
			direccion,
		)

	if err != nil {

		switch err.Error() {

		case "usuario no encontrado":

			c.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})

		case "direccion no pertenece al usuario":

			c.JSON(http.StatusForbidden, gin.H{
				"error": err.Error(),
			})

		default:

			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		}

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"mensaje":   "dirección actualizada correctamente",
		"direccion": resultado,
	})
}

// ==========================================
// ELIMINAR DIRECCIÓN
// ==========================================

func EliminarDireccion(c *gin.Context) {

	idFirebase := c.Param("id")
	idDireccion := c.Param("id_direccion")

	err :=
		direccionService.EliminarDireccion(
			idFirebase,
			idDireccion,
		)

	if err != nil {

		switch err.Error() {

		case "usuario no encontrado":

			c.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})

		case "direccion no pertenece al usuario":

			c.JSON(http.StatusForbidden, gin.H{
				"error": err.Error(),
			})

		default:

			c.JSON(http.StatusBadRequest, gin.H{
				"error": err.Error(),
			})
		}

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"mensaje": "dirección eliminada correctamente",
	})
}

// ==========================================
// MARCAR COMO PRINCIPAL
// ==========================================

func MarcarPrincipal(c *gin.Context) {

	idFirebase := c.Param("id")
	idDireccion := c.Param("id_direccion")

	direccion, err :=
		direccionService.MarcarPrincipal(
			idFirebase,
			idDireccion,
		)

	if err != nil {

		if err.Error() == "usuario no encontrado" {

			c.JSON(http.StatusNotFound, gin.H{
				"error": err.Error(),
			})

			return
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"mensaje":   "dirección principal actualizada",
		"direccion": direccion,
	})
}
