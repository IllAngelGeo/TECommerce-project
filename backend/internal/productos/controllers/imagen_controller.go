package controllers

import (
	"ecommerce-backend/internal/productos/service"
	"net/http"

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

func GetProductImages(c *gin.Context) {

	productID := c.Param("id")

	if productID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "el id del producto es obligatorio",
		})
		return
	}

	imagenes, err := service.GetProductImages(productID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"imagenes": imagenes,
	})
}

func DeleteProductImage(c *gin.Context) {

	productID := c.Param("id")
	imageID := c.Param("id_imagen")

	if productID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "el id del producto es obligatorio",
		})
		return
	}

	if imageID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "el id de la imagen es obligatorio",
		})
		return
	}

	err := service.DeleteProductImage(productID, imageID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "imagen eliminada correctamente",
	})
}
