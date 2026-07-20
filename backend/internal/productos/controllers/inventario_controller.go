package controllers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"ecommerce-backend/internal/productos/models"
	"ecommerce-backend/internal/productos/service"
)

func CreateInventory(c *gin.Context) {

	var inventory models.Inventario

	if err := c.ShouldBindJSON(&inventory); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "JSON inválido",
		})

		return
	}

	err := service.CreateInventory(&inventory)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "inventario creado correctamente",
		"inventario": inventory,
	})
}

func GetInventory(c *gin.Context) {

	productID := c.Param("id")

	inventory, err := service.GetInventory(productID)

	if err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "inventario no encontrado",
		})

		return
	}

	c.JSON(http.StatusOK, inventory)
}

func UpdateInventory(c *gin.Context) {

	productID := c.Param("id")

	var inventory models.Inventario

	if err := c.ShouldBindJSON(&inventory); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "JSON inválido",
		})

		return
	}

	err := service.UpdateInventory(
		productID,
		&inventory,
	)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "inventario actualizado correctamente",
	})
}

func DeleteInventory(c *gin.Context) {

	productID := c.Param("id")

	err := service.DeleteInventory(productID)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "inventario eliminado correctamente",
	})
}
