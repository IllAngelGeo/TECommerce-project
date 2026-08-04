package mercadopago

import (
	"net/http"


	"github.com/gin-gonic/gin"
)

func CreatePreferenceController(c *gin.Context) {

	var request struct {
		IDFirebase string `json:"id_firebase" binding:"required"`
	}


	if err := c.ShouldBindJSON(&request); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "id_firebase requerido",
		})

		return
	}


	initPoint, err :=
		CrearPreferencia(
			request.IDFirebase,
		)


	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"error": err.Error(),
		})

		return
	}


	c.JSON(http.StatusOK, gin.H{

		"success": true,

		"init_point": initPoint,
	})
}