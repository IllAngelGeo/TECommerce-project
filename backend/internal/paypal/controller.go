package paypal

import (
	carritoRepository "ecommerce-backend/internal/carrito/repository"
	"fmt"
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
		IDFirebase string `json:"id_firebase" binding:"required"`
	}

	// Leer JSON

	if err := c.ShouldBindJSON(&request); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "id_firebase obligatorio",
		})

		return
	}

	// Obtener usuario real

	idUsuario, err :=
		carritoRepository.ObtenerIDUsuarioFirebase(
			request.IDFirebase,
		)

	if err != nil {

		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "usuario no encontrado",
		})

		return
	}

	// Obtener total del carrito

	total, err :=
		carritoRepository.ObtenerTotalCarrito(
			idUsuario,
		)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "no se pudo obtener el total",
			"error":   err.Error(),
		})

		return
	}

	// Convertir total a string

	monto :=
		fmt.Sprintf(
			"%.2f",
			total,
		)

	// Crear orden PayPal

	order, err :=
		CreateOrder(
			monto,
		)

	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "no se pudo crear la orden PayPal",
			"error":   err.Error(),
		})

		return
	}

	c.JSON(http.StatusOK, gin.H{

		"success": true,

		"order_id": order.ID,

		"status": order.Status,

		"links": order.Links,

		"total": total,
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
