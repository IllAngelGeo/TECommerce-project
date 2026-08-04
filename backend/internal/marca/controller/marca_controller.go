package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"ecommerce-backend/internal/marca/models"
	"ecommerce-backend/internal/marca/service"
)

// ==========================================
// OBTENER TODAS LAS MARCAS
// ==========================================

func GetAllMarcas(c *gin.Context) {

	marcas, err := service.GetAllMarcas()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, marcas)
}

// ==========================================
// CREAR MARCA
// ==========================================

func CreateMarca(c *gin.Context) {

	var marca models.Marca

	if err := c.ShouldBindJSON(&marca); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "datos inválidos",
		})

		return
	}

	err := service.CreateMarca(marca)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "marca creada correctamente",
	})
}

// ==========================================
// OBTENER MARCA POR ID
// ==========================================

func GetMarcaByID(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id inválido",
		})

		return
	}

	marca, err := service.GetMarcaByID(id)

	if err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"error": "marca no encontrada",
		})

		return
	}

	c.JSON(http.StatusOK, marca)
}

// ==========================================
// ACTUALIZAR MARCA
// ==========================================

func UpdateMarca(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id inválido",
		})

		return
	}

	var marca models.Marca

	if err := c.ShouldBindJSON(&marca); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "datos inválidos",
		})

		return
	}

	err = service.UpdateMarca(id, marca)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "marca actualizada correctamente",
	})
}

// ==========================================
// ELIMINAR MARCA
// ==========================================

func DeleteMarca(c *gin.Context) {

	id, err := strconv.Atoi(c.Param("id"))

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"error": "id inválido",
		})

		return
	}

	err = service.DeleteMarca(id)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "marca eliminada correctamente",
	})

}
