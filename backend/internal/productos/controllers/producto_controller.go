package controllers

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"

	"ecommerce-backend/internal/productos/models"
	"ecommerce-backend/internal/productos/service"
)

func CreateProduct(c *gin.Context) {

	var product models.Producto

	if err := c.ShouldBindJSON(&product); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "JSON inválido",
		})

		return
	}

	err := service.CreateProduct(&product)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "producto creado correctamente",
		"producto": product,
	})
}

func GetProducts(c *gin.Context) {

	products, err := service.GetProducts()

	if err != nil {

		fmt.Println("ERROR REAL AL OBTENER PRODUCTOS:", err)

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, products)
}

func GetProduct(c *gin.Context) {

	id := c.Param("id")

	product, err := service.GetProduct(id)

	if err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "producto no encontrado",
		})

		return
	}

	c.JSON(http.StatusOK, product)
}

func UpdateProduct(c *gin.Context) {

	id := c.Param("id")

	var product models.Producto

	if err := c.ShouldBindJSON(&product); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "JSON inválido",
		})

		return
	}

	err := service.UpdateProduct(id, &product)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "producto actualizado correctamente",
	})
}

func DeleteProduct(c *gin.Context) {

	id := c.Param("id")

	err := service.DeleteProduct(id)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "producto eliminado correctamente",
	})
}


