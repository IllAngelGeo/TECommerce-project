package controllers

import (
	"net/http"

	"ecommerce-backend/internal/productos/service"

	"github.com/gin-gonic/gin"
)

func UploadProductImage(c *gin.Context) {

	productID := c.Param("id")

	if productID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "el id del producto es obligatorio",
		})

		return
	}

	file, header, err := c.Request.FormFile("imagen")

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "debes enviar una imagen",
		})

		return
	}

	defer file.Close()

	image, err := service.UploadProductImage(
		file,
		header,
		productID,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "imagen subida correctamente",
		"imagen":  image,
	})
}
