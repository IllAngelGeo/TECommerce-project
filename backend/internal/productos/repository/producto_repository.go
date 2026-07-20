package repository

import (
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/productos/models"
)

// CREAR PRODUCTO
func CreateProduct(product *models.Producto) error {

	query := `
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

	err := database.DB.QueryRow(
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
	).Scan(&product.IDProducto)

	if err != nil {
		return err
	}

	// Crear inventario automáticamente
	inventoryQuery := `
		INSERT INTO inventario
		(id_producto, stock, stock_minimo)
		VALUES ($1, $2, $3)
	`

	_, err = database.DB.Exec(
		inventoryQuery,
		product.IDProducto,
		product.Stock,
		product.StockMinimo,
	)

	return err
}

// OBTENER TODOS LOS PRODUCTOS
func GetAllProducts() ([]models.Producto, error) {

	query := `
		SELECT
			id_producto,
			id_categoria,
			id_marca,
			nombre,
			descripcion,
			modelo,
			precio,
			precio_oferta,
			activo,
			destacado
		FROM productos
		ORDER BY fecha_creacion DESC
	`

	rows, err := database.DB.Query(query)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var products []models.Producto

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
		)

		if err != nil {
			return nil, err
		}

		products = append(products, product)
	}

	return products, nil
}

// OBTENER PRODUCTO POR ID
func GetProductByID(id string) (*models.Producto, error) {

	query := `
		SELECT
			id_producto,
			id_categoria,
			id_marca,
			nombre,
			descripcion,
			modelo,
			precio,
			precio_oferta,
			activo,
			destacado
		FROM productos
		WHERE id_producto = $1
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
