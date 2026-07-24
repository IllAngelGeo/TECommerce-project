package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"ecommerce-backend/internal/categorias/service"
)

func GetCategories(c *gin.Context) {

	categorias, err := service.GetCategories()

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, categorias)
}
