package repository

import (
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/productos/models"
)

func CreateInventory(inventory *models.Inventario) error {

	query := `
		INSERT INTO inventario
		(id_producto, stock, stock_minimo)
		VALUES ($1, $2, $3)
		RETURNING id_inventario
	`

	return database.DB.QueryRow(
		query,
		inventory.IDProducto,
		inventory.Stock,
		inventory.StockMinimo,
	).Scan(&inventory.IDInventario)
}

func GetInventoryByProductID(productID string) (*models.Inventario, error) {

	query := `
		SELECT
			id_inventario,
			id_producto,
			stock,
			stock_minimo
		FROM inventario
		WHERE id_producto = $1
	`

	var inventory models.Inventario

	err := database.DB.QueryRow(
		query,
		productID,
	).Scan(
		&inventory.IDInventario,
		&inventory.IDProducto,
		&inventory.Stock,
		&inventory.StockMinimo,
	)

	if err != nil {
		return nil, err
	}

	return &inventory, nil
}

func UpdateInventory(productID string, inventory *models.Inventario) error {

	query := `
		UPDATE inventario
		SET
			stock = $1,
			stock_minimo = $2,
			fecha_actualizacion = now()
		WHERE id_producto = $3
	`

	_, err := database.DB.Exec(
		query,
		inventory.Stock,
		inventory.StockMinimo,
		productID,
	)

	return err
}

func DeleteInventory(productID string) error {

	query := `
		DELETE FROM inventario
		WHERE id_producto = $1
	`

	_, err := database.DB.Exec(
		query,
		productID,
	)

	return err
}
