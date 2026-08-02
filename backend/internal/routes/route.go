package routes

import (
	"github.com/gin-gonic/gin"

	carritoControllers "ecommerce-backend/internal/carrito/controller"
	categoriasControllers "ecommerce-backend/internal/categorias/controller"
	direccionesControllers "ecommerce-backend/internal/direcciones/controller"
	favoritosControllers "ecommerce-backend/internal/favoritos/controller"
	pedidoControllers "ecommerce-backend/internal/pedido/controller"
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

	// ==========================================
	// CARRITO
	// ==========================================

	carrito := r.Group("/carrito")
	{
		carrito.GET("/test", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"mensaje": "carrito test funciona",
			})
		})

		carrito.POST(
			"",
			carritoControllers.AgregarCarrito,
		)

		carrito.GET(
			"/firebase/:id",
			carritoControllers.ObtenerCarrito,
		)

		carrito.PUT(
			"/:id_carrito",
			carritoControllers.ActualizarCantidad,
		)

		carrito.DELETE(
			"/:id_carrito",
			carritoControllers.EliminarCarrito,
		)
	}

	// ==========================================
	// PEDIDOS
	// ==========================================

	pedidos := r.Group("/pedidos")
	{
		pedidos.POST(
			"/firebase/:id",
			pedidoControllers.CrearPedido,
		)

		pedidos.GET(
			"/firebase/:id",
			pedidoControllers.ObtenerPedidos,
		)

		pedidos.GET(
			"/:id_pedido/detalles",
			pedidoControllers.ObtenerDetallesPedido,
		)
	}

	// FAVORITOS

	favoritos := r.Group("/favoritos")
	{
		favoritos.POST(
			"",
			favoritosControllers.AgregarFavorito,
		)

		favoritos.GET(
			"/firebase/:id",
			favoritosControllers.ObtenerFavoritos,
		)

		favoritos.GET(
			"/firebase/:id/producto/:id_producto",
			favoritosControllers.ExisteFavorito,
		)

		favoritos.DELETE(
			"/firebase/:id/producto/:id_producto",
			favoritosControllers.EliminarFavorito,
		)

		// ==========================================
		// DIRECCIONES
		// ==========================================

		direcciones := r.Group("/direcciones")
		{
			direcciones.GET(
				"/firebase/:id",
				direccionesControllers.ObtenerDirecciones,
			)

			direcciones.POST(
				"/firebase/:id",
				direccionesControllers.CrearDireccion,
			)

			direcciones.PUT(
				"/:id_direccion",
				direccionesControllers.ActualizarDireccion,
			)

			direcciones.DELETE(
				"/:id_direccion",
				direccionesControllers.EliminarDireccion,
			)
		}

	}

}
