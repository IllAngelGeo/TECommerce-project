package repository

import (
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/productos/models"
)

// CREAR PRODUCTO
// CREAR PRODUCTO
func CreateProduct(product *models.Producto) error {

	tx, err := database.DB.Begin()

	if err != nil {
		return err
	}

	// Si ocurre cualquier error, hacemos rollback
	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// =========================
	// CREAR PRODUCTO
	// =========================

	productQuery := `
	INSERT INTO productos
	(
		id_categoria,
		id_marca,
		nombre,
		descripcion,
		modelo,
		precio,
		precio_oferta,
		activo,
		destacado
	)
	VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
	RETURNING id_producto
	`

	err = tx.QueryRow(
		productQuery,
		product.IDCategoria,
		product.IDMarca,
		product.Nombre,
		product.Descripcion,
		product.Modelo,
		product.Precio,
		product.PrecioOferta,
		product.Activo,
		product.Destacado,
	).Scan(&product.IDProducto)

	if err != nil {
		return err
	}

	// =========================
	// CREAR INVENTARIO
	// =========================

	inventoryQuery := `
	INSERT INTO inventario
	(
		id_producto,
		stock,
		stock_minimo
	)
	VALUES ($1, $2, $3)
	`

	_, err = tx.Exec(
		inventoryQuery,
		product.IDProducto,
		product.Stock,
		product.StockMinimo,
	)

	if err != nil {
		return err
	}

	// =========================
	// CONFIRMAR TRANSACCIÓN
	// =========================

	err = tx.Commit()

	if err != nil {
		return err
	}

	return nil
}

// OBTENER TODOS LOS PRODUCTOS

// OBTENER TODOS LOS PRODUCTOS
func GetAllProducts() ([]models.Producto, error) {

	query := `
	SELECT
		p.id_producto,
		p.id_categoria,
		p.id_marca,
		p.nombre,
		p.descripcion,
		p.modelo,
		p.precio,
		p.precio_oferta,
		p.activo,
		p.destacado,

		-- NOMBRE DE LA CATEGORÍA
		c.nombre AS categoria,

		-- IMAGEN PRINCIPAL
		COALESCE(
			(
				SELECT pi.imagen_url
				FROM producto_imagenes pi
				WHERE pi.id_producto = p.id_producto
				AND pi.principal = true
				LIMIT 1
			),
			''
		) AS imagen,

		-- INVENTARIO
		COALESCE(i.stock, 0) AS stock,
		COALESCE(i.stock_minimo, 0) AS stock_minimo

	FROM productos p

	LEFT JOIN categorias c
		ON c.id_categoria = p.id_categoria

	LEFT JOIN inventario i
		ON i.id_producto = p.id_producto

	WHERE p.activo = true

	ORDER BY p.fecha_creacion DESC
	`

	rows, err := database.DB.Query(query)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	products := make([]models.Producto, 0)

	for rows.Next() {

		var product models.Producto

		err := rows.Scan(
			&product.IDProducto,
			&product.IDCategoria,
			&product.IDMarca,
			&product.Nombre,
			&product.Descripcion,
			&product.Modelo,
			&product.Precio,
			&product.PrecioOferta,
			&product.Activo,
			&product.Destacado,

			// CATEGORÍA
			&product.Categoria,

			// IMAGEN
			&product.Imagen,

			// INVENTARIO
			&product.Stock,
			&product.StockMinimo,
		)

		if err != nil {
			return nil, err
		}

		products = append(products, product)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return products, nil
}

// OBTENER PRODUCTO POR ID
func GetProductByID(id string) (*models.Producto, error) {

	query := `
	SELECT
		p.id_producto,
		p.id_categoria,
		p.id_marca,
		p.nombre,
		p.descripcion,
		p.modelo,
		p.precio,
		p.precio_oferta,
		p.activo,
		p.destacado,

		-- NOMBRE DE LA CATEGORÍA
		c.nombre AS categoria,

		-- IMAGEN PRINCIPAL
		COALESCE(
			(
				SELECT pi.imagen_url
				FROM producto_imagenes pi
				WHERE pi.id_producto = p.id_producto
				AND pi.principal = true
				LIMIT 1
			),
			''
		) AS imagen,

		-- INVENTARIO
		COALESCE(i.stock, 0) AS stock,
		COALESCE(i.stock_minimo, 0) AS stock_minimo

	FROM productos p

	LEFT JOIN categorias c
		ON c.id_categoria = p.id_categoria

	LEFT JOIN inventario i
		ON i.id_producto = p.id_producto

	WHERE p.id_producto = $1
	`

	var product models.Producto

	err := database.DB.QueryRow(
		query,
		id,
	).Scan(
		&product.IDProducto,
		&product.IDCategoria,
		&product.IDMarca,
		&product.Nombre,
		&product.Descripcion,
		&product.Modelo,
		&product.Precio,
		&product.PrecioOferta,
		&product.Activo,
		&product.Destacado,

		// CATEGORÍA
		&product.Categoria,

		// IMAGEN
		&product.Imagen,

		// INVENTARIO
		&product.Stock,
		&product.StockMinimo,
	)

	if err != nil {
		return nil, err
	}

	return &product, nil
}

// ACTUALIZAR PRODUCTO
func UpdateProduct(id string, product *models.Producto) error {

	query := `
	UPDATE productos
	SET
		id_categoria = $1,
		id_marca = $2,
		nombre = $3,
		descripcion = $4,
		modelo = $5,
		precio = $6,
		precio_oferta = $7,
		activo = $8,
		destacado = $9,
		fecha_actualizacion = now()
	WHERE id_producto = $10
`

	_, err := database.DB.Exec(
		query,
		product.IDCategoria,
		product.IDMarca,
		product.Nombre,
		product.Descripcion,
		product.Modelo,
		product.Precio,
		product.PrecioOferta,
		product.Activo,
		product.Destacado,
		id,
	)

	if err != nil {
		return err
	}

	// Actualizar inventario
	inventoryQuery := `
	UPDATE inventario
	SET
		stock = $1,
		stock_minimo = $2,
		fecha_actualizacion = now()
	WHERE id_producto = $3
`

	_, err = database.DB.Exec(
		inventoryQuery,
		product.Stock,
		product.StockMinimo,
		id,
	)

	return err

}

// ELIMINAR PRODUCTO
func DeleteProduct(id string) error {

	query := `
	DELETE FROM productos
	WHERE id_producto = $1
`

	_, err := database.DB.Exec(
		query,
		id,
	)

	return err

}

func DeleteAllProductImages(
	productID string,
) error {

	query := `
	DELETE FROM producto_imagenes
	WHERE id_producto = $1
	`

	_, err := database.DB.Exec(
		query,
		productID,
	)

	return err
}
