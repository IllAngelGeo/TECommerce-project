package service

import (
	"context"
	"errors"

	"ecommerce-backend/internal/cloudinary"
	"ecommerce-backend/internal/productos/models"
	"ecommerce-backend/internal/productos/repository"

	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
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

	cld, err := cloudinary.GetCloudinary()

	if err != nil {
		return err
	}

	// 1. Obtener imágenes
	imagenes, err := repository.GetProductImages(id)

	if err != nil {
		return err
	}

	ctx := context.Background()

	// 2. Borrar imágenes de Cloudinary
	for _, imagen := range imagenes {

		if imagen.PublicID != "" {

			_, err := cld.Upload.Destroy(
				ctx,
				uploader.DestroyParams{
					PublicID: imagen.PublicID,
				},
			)

			if err != nil {
				return err
			}
		}
	}

	// 3. Borrar imágenes de PostgreSQL
	err = repository.DeleteAllProductImages(id)

	if err != nil {
		return err
	}

	// 4. Borrar inventario
	err = repository.DeleteInventory(id)

	if err != nil {
		return err
	}

	// 5. Borrar producto
	err = repository.DeleteProduct(id)

	return err
}
