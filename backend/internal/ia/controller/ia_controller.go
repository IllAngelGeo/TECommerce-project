package controller

import (
	"net/http"

	"ecommerce-backend/internal/ia/service"

	"github.com/gin-gonic/gin"
)

func AnalizarInventario(c *gin.Context) {

	resultado, err := service.AnalizarInventario()

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, resultado)
}
