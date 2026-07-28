package routes

import (
	"github.com/gin-gonic/gin"

	categoriasControllers "ecommerce-backend/internal/categorias/controller"
	productosControllers "ecommerce-backend/internal/productos/controllers"
	usuariosControllers "ecommerce-backend/internal/usuarios/controllers"
)

func SetupRoutes(r *gin.Engine) {

	// ==========================================
	// AUTENTICACIÓN
	// ==========================================

	auth := r.Group("/auth")
	{
		auth.POST("/register", usuariosControllers.Register)
	}

	// ==========================================
	// USUARIOS
	// ==========================================

	usuarios := r.Group("/usuarios")
	{
		usuarios.GET(
			"/firebase/:id",
			usuariosControllers.GetUserByFirebaseID,
		)

		usuarios.PUT(
			"/firebase/:id",
			usuariosControllers.UpdateUserByFirebaseID,
		)

	}

	// ==========================================
	// CATEGORÍAS
	// ==========================================

	categorias := r.Group("/categorias")
	{
		categorias.GET(
			"",
			categoriasControllers.GetCategories,
		)
	}

	// ==========================================
	// PRODUCTOS
	// ==========================================

	productos := r.Group("/productos")
	{
		productos.POST(
			"",
			productosControllers.CreateProduct,
		)

		productos.GET(
			"",
			productosControllers.GetProducts,
		)

		productos.GET(
			"/:id",
			productosControllers.GetProduct,
		)

		productos.PUT(
			"/:id",
			productosControllers.UpdateProduct,
		)

		productos.DELETE(
			"/:id",
			productosControllers.DeleteProduct,
		)
	}

	// ==========================================
	// INVENTARIO
	// ==========================================

	inventario := r.Group(
		"/productos/:id/inventario",
	)
	{
		inventario.POST(
			"",
			productosControllers.CreateInventory,
		)

		inventario.GET(
			"",
			productosControllers.GetInventory,
		)

		inventario.PUT(
			"",
			productosControllers.UpdateInventory,
		)

		inventario.DELETE(
			"",
			productosControllers.DeleteInventory,
		)
	}

	// ==========================================
	// IMÁGENES DE PRODUCTOS
	// ==========================================

	imagenes := r.Group(
		"/productos/:id/imagenes",
	)
	{
		// SUBIR UNA IMAGEN
		imagenes.POST(
			"",
			productosControllers.UploadProductImage,
		)

		// OBTENER TODAS LAS IMÁGENES
		imagenes.GET(
			"",
			productosControllers.GetProductImages,
		)

		// ELIMINAR UNA IMAGEN
		imagenes.DELETE(
			"/:id_imagen",
			productosControllers.DeleteProductImage,
		)
	}
}
