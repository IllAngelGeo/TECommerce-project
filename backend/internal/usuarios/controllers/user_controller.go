package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"ecommerce-backend/internal/usuarios/models"
	"ecommerce-backend/internal/usuarios/service"
)

// REGISTRAR USUARIO
func Register(c *gin.Context) {

	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "JSON inválido",
		})
		return
	}

	err := service.RegisterUser(&user)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "usuario creado correctamente",
	})
}

// OBTENER USUARIO POR ID DE FIREBASE
func GetUserByFirebaseID(c *gin.Context) {

	idFirebase := c.Param("id")

	user, err := service.GetUserByFirebaseID(idFirebase)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "usuario no encontrado",
		})
		return
	}

	c.JSON(http.StatusOK, user)
}

// ACTUALIZAR USUARIO
func UpdateUserByFirebaseID(c *gin.Context) {

	idFirebase := c.Param("id")

	var user models.User

	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "JSON inválido",
		})
		return
	}

	err := service.UpdateUserByFirebaseID(
		idFirebase,
		&user,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "usuario actualizado correctamente",
	})
}
