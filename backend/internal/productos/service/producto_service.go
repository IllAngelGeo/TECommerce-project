package service

import (
	"errors"

	"ecommerce-backend/internal/productos/models"
	"ecommerce-backend/internal/productos/repository"
)

func CreateProduct(product *models.Producto) error {

	if product.Nombre == "" {
		return errors.New("el nombre del producto es obligatorio")
	}

	if product.IDCategoria <= 0 {
		return errors.New("la categoría es obligatoria")
	}

	if product.Precio < 0 {
		return errors.New("el precio no puede ser negativo")
	}

	if product.Stock < 0 {
		return errors.New("el stock no puede ser negativo")
	}

	if product.StockMinimo < 0 {
		return errors.New("el stock mínimo no puede ser negativo")
	}

	return repository.CreateProduct(product)
}

func GetProducts() ([]models.Producto, error) {

	return repository.GetAllProducts()
}

func GetProduct(id string) (*models.Producto, error) {

	if id == "" {
		return nil, errors.New("el id del producto es obligatorio")
	}

	return repository.GetProductByID(id)
}

func UpdateProduct(id string, product *models.Producto) error {

	if id == "" {
		return errors.New("el id del producto es obligatorio")
	}

	if product.Nombre == "" {
		return errors.New("el nombre del producto es obligatorio")
	}

	if product.IDCategoria <= 0 {
		return errors.New("la categoría es obligatoria")
	}

	if product.Precio < 0 {
		return errors.New("el precio no puede ser negativo")
	}

	if product.Stock < 0 {
		return errors.New("el stock no puede ser negativo")
	}

	if product.StockMinimo < 0 {
		return errors.New("el stock mínimo no puede ser negativo")
	}

	return repository.UpdateProduct(id, product)
}

func DeleteProduct(id string) error {

	if id == "" {
		return errors.New("el id del producto es obligatorio")
	}

	return repository.DeleteProduct(id)
}
