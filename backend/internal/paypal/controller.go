package paypal

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func TestConnection(c *gin.Context) {

	_, err := GetAccessToken()

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "No se pudo conectar con PayPal",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Conexión con PayPal Sandbox exitosa",
	})
}

func CreateOrderController(c *gin.Context) {

	var request struct {
		Amount string `json:"amount" binding:"required"`
	}

	// Leer JSON enviado por el cliente
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "El monto es obligatorio",
		})
		return
	}

	// Crear orden en PayPal
	order, err := CreateOrder(request.Amount)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "No se pudo crear la orden de PayPal",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":  true,
		"order_id": order.ID,
		"status":   order.Status,
		"links":    order.Links,
	})
}

func CaptureOrderController(c *gin.Context) {

	var request struct {
		OrderID string `json:"order_id" binding:"required"`
	}

	// Leer JSON
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "El order_id es obligatorio",
		})
		return
	}

	// Capturar orden
	result, err := CaptureOrder(request.OrderID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "No se pudo capturar la orden",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pago capturado correctamente",
		"paypal":  result,
	})
}

func Success(c *gin.Context) {

	orderID := c.Query("token")

	if orderID == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "PayPal no devolvió el token de la orden",
		})
		return
	}

	result, err := CaptureOrder(orderID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "No se pudo capturar el pago",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Pago capturado correctamente",
		"paypal":  result,
	})
}
