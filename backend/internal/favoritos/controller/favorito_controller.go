package controller

import (
	"net/http"

	"ecommerce-backend/internal/favoritos/models"
	"ecommerce-backend/internal/favoritos/repository"
	favoritoService "ecommerce-backend/internal/favoritos/service"

	"github.com/gin-gonic/gin"
)

// ========================================
// OBTENER FAVORITOS DE USUARIO
// GET /favoritos/firebase/:id
// ========================================

func ObtenerFavoritos(c *gin.Context) {

	idFirebase := c.Param("id")

	idUsuario, err := repository.ObtenerIDUsuarioFirebase(
		idFirebase,
	)

	if err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "usuario no encontrado",
		})

		return
	}

	favoritos, err := favoritoService.ObtenerFavoritos(
		idUsuario,
	)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, favoritos)
}

// ========================================
// AGREGAR FAVORITO
// POST /favoritos
// ========================================

func AgregarFavorito(c *gin.Context) {

	var favorito models.Favorito

	if err := c.ShouldBindJSON(&favorito); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "datos incorrectos",
		})

		return
	}

	// El IDUsuario que llega aquí será el Firebase UID
	idUsuario, err := repository.ObtenerIDUsuarioFirebase(
		favorito.IDUsuario,
	)

	if err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "usuario no encontrado",
		})

		return
	}

	// Convertimos Firebase UID → UUID de PostgreSQL
	favorito.IDUsuario = idUsuario

	err = favoritoService.AgregarFavorito(
		&favorito,
	)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"mensaje": "producto agregado a favoritos",
	})
}

// ========================================
// COMPROBAR FAVORITO
// GET /favoritos/firebase/:id/producto/:id_producto
// ========================================

func ExisteFavorito(c *gin.Context) {

	idFirebase := c.Param("id")

	idProducto := c.Param("id_producto")

	idUsuario, err := repository.ObtenerIDUsuarioFirebase(
		idFirebase,
	)

	if err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "usuario no encontrado",
		})

		return
	}

	existe, err := favoritoService.ExisteFavorito(
		idUsuario,
		idProducto,
	)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"favorito": existe,
	})
}

// ========================================
// ELIMINAR FAVORITO
// DELETE /favoritos/firebase/:id/producto/:id_producto
// ========================================

func EliminarFavorito(c *gin.Context) {

	idFirebase := c.Param("id")

	idProducto := c.Param("id_producto")

	idUsuario, err := repository.ObtenerIDUsuarioFirebase(
		idFirebase,
	)

	if err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "usuario no encontrado",
		})

		return
	}

	err = favoritoService.EliminarFavorito(
		idUsuario,
		idProducto,
	)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"mensaje": "producto eliminado de favoritos",
	})
}
