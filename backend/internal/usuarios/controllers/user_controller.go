package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"ecommerce-backend/internal/usuarios/models"
	"ecommerce-backend/internal/usuarios/service"
)

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
