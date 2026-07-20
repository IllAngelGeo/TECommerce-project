package routes

import (
	"github.com/gin-gonic/gin"

	productosControllers "ecommerce-backend/internal/productos/controllers"
	usuariosControllers "ecommerce-backend/internal/usuarios/controllers"
)

func SetupRoutes(r *gin.Engine) {

	auth := r.Group("/auth")
	{
		auth.POST("/register", usuariosControllers.Register)
	}

	productos := r.Group("/productos")
	{
		productos.POST("", productosControllers.CreateProduct)
		productos.GET("", productosControllers.GetProducts)
		productos.GET("/:id", productosControllers.GetProduct)
		productos.PUT("/:id", productosControllers.UpdateProduct)
		productos.DELETE("/:id", productosControllers.DeleteProduct)
	}

	inventario := r.Group("/productos/:id/inventario")
	{
		inventario.POST("", productosControllers.CreateInventory)
		inventario.GET("", productosControllers.GetInventory)
		inventario.PUT("", productosControllers.UpdateInventory)
		inventario.DELETE("", productosControllers.DeleteInventory)
	}

	imagenes := r.Group("/productos/:id/imagenes")
	{
		imagenes.POST("", productosControllers.UploadProductImage)
	}
}
