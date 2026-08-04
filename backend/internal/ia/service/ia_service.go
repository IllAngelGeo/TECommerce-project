package service

import (
	"ecommerce-backend/internal/productos/repository"
)

func AnalizarInventario() (map[string]interface{}, error) {

	productos, err := repository.GetAllProducts()

	if err != nil {
		return nil, err
	}

	productosBajoStock := []string{}

	var categoriaMayor string
	cantidadProductos := 0

	categorias := make(map[string]int)

	// ======================================
	// ANALIZAR PRODUCTOS
	// ======================================

	for _, producto := range productos {

		// STOCK BAJO
		if producto.Stock <= producto.StockMinimo {

			productosBajoStock = append(
				productosBajoStock,
				producto.Nombre,
			)

		}

		// CONTAR CATEGORÍAS
		categorias[producto.Categoria]++
	}

	// ======================================
	// BUSCAR CATEGORÍA CON MÁS PRODUCTOS
	// ======================================

	for categoria, cantidad := range categorias {

		if cantidad > cantidadProductos {

			cantidadProductos = cantidad
			categoriaMayor = categoria

		}
	}

	recomendacion :=
		"Aumentar inventario de productos con poco stock."

	return map[string]interface{}{
		"productos_bajo_stock": len(productosBajoStock),
		"productos":            productosBajoStock,
		"categoria_principal":  categoriaMayor,
		"recomendacion":        recomendacion,
	}, nil
}
