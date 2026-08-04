package routes

import (
	"github.com/gin-gonic/gin"

	iaController "ecommerce-backend/internal/IA/controller"
	bannersControllers "ecommerce-backend/internal/banner/controller"
	carritoControllers "ecommerce-backend/internal/carrito/controller"
	categoriasControllers "ecommerce-backend/internal/categorias/controller"
	direccionesControllers "ecommerce-backend/internal/direcciones/controller"
	favoritosControllers "ecommerce-backend/internal/favoritos/controller"
	marcasControllers "ecommerce-backend/internal/marca/controller"
	mercadopagoControllers "ecommerce-backend/internal/mercadopago"
	paypalControllers "ecommerce-backend/internal/paypal"
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

	// ==========================================
	// CATEGORÍAS
	// ==========================================

	categorias := r.Group("/categorias")
	{
		categorias.POST(
			"",
			categoriasControllers.CreateCategory,
		)

		categorias.GET(
			"",
			categoriasControllers.GetCategories,
		)

		categorias.GET(
			"/:id",
			categoriasControllers.GetCategory,
		)

		categorias.PUT(
			"/:id",
			categoriasControllers.UpdateCategory,
		)

		categorias.DELETE(
			"/:id",
			categoriasControllers.DeleteCategory,
		)
	}

	// ==========================================
	// MARCAS
	// ==========================================

	marcas := r.Group("/marcas")
	{
		marcas.POST(
			"",
			marcasControllers.CreateMarca,
		)

		marcas.GET(
			"",
			marcasControllers.GetAllMarcas,
		)

		marcas.GET(
			"/:id",
			marcasControllers.GetMarcaByID,
		)

		marcas.PUT(
			"/:id",
			marcasControllers.UpdateMarca,
		)

		marcas.DELETE(
			"/:id",
			marcasControllers.DeleteMarca,
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
	// ==========================================
	// PEDIDOS
	// ==========================================

	pedidos := r.Group("/pedidos")
	{
		// --------------------------------------
		// CLIENTE: CREAR PEDIDO
		// --------------------------------------

		pedidos.POST(
			"/firebase/:id",
			pedidoControllers.CrearPedido,
		)

		// --------------------------------------
		// CLIENTE: OBTENER SUS PEDIDOS
		// --------------------------------------

		pedidos.GET(
			"/firebase/:id",
			pedidoControllers.ObtenerPedidos,
		)

		// --------------------------------------
		// CLIENTE: OBTENER DETALLES Y ESTADO
		// --------------------------------------

		pedidos.GET(
			"/:id_pedido/detalles",
			pedidoControllers.ObtenerDetallesPedido,
		)

		// --------------------------------------
		// ADMIN: OBTENER TODOS LOS PEDIDOS
		// --------------------------------------

		pedidos.GET(
			"/admin/todos",
			pedidoControllers.ObtenerTodosLosPedidos,
		)

		// --------------------------------------
		// ADMIN: OBTENER UN PEDIDO POR ID
		// --------------------------------------

		pedidos.GET(
			"/admin/:id_pedido",
			pedidoControllers.ObtenerPedidoPorID,
		)

		// --------------------------------------
		// ADMIN: ACTUALIZAR ESTADO
		// --------------------------------------

		pedidos.PATCH(
			"/admin/:id_pedido/estado",
			pedidoControllers.ActualizarEstadoPedido,
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

	}

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
			"/firebase/:id/:id_direccion",
			direccionesControllers.EliminarDireccion,
		)
	}

	// Paypal
	paypal := r.Group("/paypal")
	{
		paypal.GET(
			"/test",
			paypalControllers.TestConnection,
		)

		paypal.POST(
			"/create-order",
			paypalControllers.CreateOrderController,
		)

		paypal.POST(
			"/capture-order",
			paypalControllers.CaptureOrderController,
		)

		paypal.GET(
			"/success",
			paypalControllers.Success,
		)

	}

	// ==========================================
	// MERCADO PAGO
	// ==========================================

	mercadoPago := r.Group("/mercadopago")
	{
		mercadoPago.POST(
			"/create-preference",
			mercadopagoControllers.CreatePreferenceController,
		)
	}

	// ==========================================
	// BANNERS
	// ==========================================

	banners := r.Group("/banners")
	{
		banners.POST(
			"",
			bannersControllers.CreateBanner,
		)

		banners.GET(
			"",
			bannersControllers.GetAllBanners,
		)

		banners.GET(
			"/:id",
			bannersControllers.GetBannerByID,
		)

		banners.PUT(
			"/:id",
			bannersControllers.UpdateBanner,
		)

		banners.DELETE(
			"/:id",
			bannersControllers.DeleteBanner,
		)
	}

	// ==========================================
	// IMAGEN DEL BANNER
	// ==========================================

	banners.POST(
		"/:id/imagen",
		bannersControllers.UploadBannerImage,
	)

	ia := r.Group("/ia")
	{
		ia.GET(
			"/analizar-inventario",
			iaController.AnalizarInventario,
		)
	}

}
