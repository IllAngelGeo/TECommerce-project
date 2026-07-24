package service

import (
	"errors"

	"ecommerce-backend/internal/productos/models"
	"ecommerce-backend/internal/productos/repository"
)

func CreateInventory(inventory *models.Inventario) error {

	if inventory.IDProducto == "" {
		return errors.New("el id del producto es obligatorio")
	}

	if inventory.Stock < 0 {
		return errors.New("el stock no puede ser negativo")
	}

	if inventory.StockMinimo < 0 {
		return errors.New("el stock mínimo no puede ser negativo")
	}

	return repository.CreateInventory(inventory)
}

func GetInventory(productID string) (*models.Inventario, error) {

	if productID == "" {
		return nil, errors.New("el id del producto es obligatorio")
	}

	return repository.GetInventoryByProductID(productID)
}

func UpdateInventory(
	productID string,
	inventory *models.Inventario,
) error {

	if productID == "" {
		return errors.New("el id del producto es obligatorio")
	}

	if inventory.Stock < 0 {
		return errors.New("el stock no puede ser negativo")
	}

	if inventory.StockMinimo < 0 {
		return errors.New("el stock mínimo no puede ser negativo")
	}

	return repository.UpdateInventory(
		productID,
		inventory,
	)
}

func DeleteInventory(productID string) error {

	if productID == "" {
		return errors.New("el id del producto es obligatorio")
	}

	return repository.DeleteInventory(productID)
}