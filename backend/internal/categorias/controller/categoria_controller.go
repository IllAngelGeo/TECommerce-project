package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"ecommerce-backend/internal/categorias/models"
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



func GetCategory(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})
		return
	}


	categoria, err := service.GetCategory(id)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}


	c.JSON(http.StatusOK, categoria)
}



func CreateCategory(c *gin.Context) {

	var categoria models.Categoria


	if err := c.ShouldBindJSON(&categoria); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}


	err := service.CreateCategory(categoria)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}


	c.JSON(http.StatusCreated, gin.H{
		"message": "Categoría creada correctamente",
	})
}



func UpdateCategory(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})

		return
	}


	var categoria models.Categoria


	if err := c.ShouldBindJSON(&categoria); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}


	err = service.UpdateCategory(id, categoria)


	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}


	c.JSON(http.StatusOK, gin.H{
		"message": "Categoría actualizada correctamente",
	})
}



func DeleteCategory(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "ID inválido",
		})

		return
	}


	err = service.DeleteCategory(id)


	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}


	c.JSON(http.StatusOK, gin.H{
		"message": "Categoría eliminada correctamente",
	})
}