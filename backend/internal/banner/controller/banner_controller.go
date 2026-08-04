package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"ecommerce-backend/internal/banner/models"
	service "ecommerce-backend/internal/banner/services"
)

// ==========================================
// OBTENER TODOS LOS BANNERS
// ==========================================

func GetAllBanners(c *gin.Context) {

	banners, err := service.GetAllBanners()

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": err.Error(),
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		banners,
	)

}

// ==========================================
// CREAR BANNER
// ==========================================

func CreateBanner(c *gin.Context) {

	var banner models.Banner

	if err := c.ShouldBindJSON(&banner); err != nil {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "datos inválidos",
			},
		)

		return
	}

	id, err := service.CreateBanner(
		banner,
	)

	if err != nil {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": err.Error(),
			},
		)

		return
	}

	c.JSON(
		http.StatusCreated,
		gin.H{

			"message": "banner creado correctamente",

			"id_banner": id,
		},
	)

}

// ==========================================
// OBTENER BANNER POR ID
// ==========================================

func GetBannerByID(c *gin.Context) {

	id, err := strconv.Atoi(
		c.Param("id"),
	)

	if err != nil {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "id inválido",
			},
		)

		return
	}

	banner, err := service.GetBannerByID(
		id,
	)

	if err != nil {

		c.JSON(
			http.StatusNotFound,
			gin.H{
				"error": "banner no encontrado",
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		banner,
	)

}

// ==========================================
// ACTUALIZAR BANNER
// ==========================================

func UpdateBanner(c *gin.Context) {

	id, err := strconv.Atoi(
		c.Param("id"),
	)

	if err != nil {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "id inválido",
			},
		)

		return
	}

	var banner models.Banner

	if err := c.ShouldBindJSON(&banner); err != nil {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "datos inválidos",
			},
		)

		return
	}

	err = service.UpdateBanner(
		id,
		banner,
	)

	if err != nil {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": err.Error(),
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		gin.H{
			"message": "banner actualizado correctamente",
		},
	)

}

// ==========================================
// ELIMINAR BANNER
// ==========================================

func DeleteBanner(c *gin.Context) {

	id, err := strconv.Atoi(
		c.Param("id"),
	)

	if err != nil {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "id inválido",
			},
		)

		return
	}

	err = service.DeleteBanner(
		id,
	)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": err.Error(),
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		gin.H{
			"message": "banner eliminado correctamente",
		},
	)

}

// ==========================================
// SUBIR IMAGEN DEL BANNER
// ==========================================

func UploadBannerImage(c *gin.Context) {

	idBanner := c.Param("id")

	file, header, err := c.Request.FormFile("imagen")

	if err != nil {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "imagen requerida",
			},
		)

		return
	}

	defer file.Close()

	url, err := service.UploadBannerImage(
		file,
		header,
		idBanner,
	)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": err.Error(),
			},
		)

		return
	}

	c.JSON(
		http.StatusOK,
		gin.H{
			"message": "imagen subida correctamente",
			"url":     url,
		},
	)

}
