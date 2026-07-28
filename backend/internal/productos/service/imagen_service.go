package service

import (
	"context"
	"fmt"
	"mime/multipart"

	"ecommerce-backend/internal/cloudinary"
	"ecommerce-backend/internal/productos/models"
	"ecommerce-backend/internal/productos/repository"

	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
)

func UploadProductImage(
	file multipart.File,
	header *multipart.FileHeader,
	productID string,
) (*models.ProductoImagen, error) {

	cld, err := cloudinary.GetCloudinary()

	if err != nil {
		return nil, err
	}

	ctx := context.Background()

	result, err := cld.Upload.Upload(
		ctx,
		file,
		uploader.UploadParams{
			Folder: fmt.Sprintf(
				"tecommerce/productos/%s",
				productID,
			),
		},
	)

	if err != nil {
		return nil, err
	}

	tieneImagenes, err := repository.ProductHasImages(productID)

	if err != nil {
		return nil, err
	}

	image := &models.ProductoImagen{
		IDProducto: productID,
		ImagenURL:  result.SecureURL,
		PublicID:   result.PublicID,
		Principal:  !tieneImagenes,
	}
	err = repository.CreateProductImage(image)

	if err != nil {
		return nil, err
	}

	return image, nil
}

// OBTENER TODAS LAS IMÁGENES DEL PRODUCTO
func GetProductImages(
	productID string,
) ([]models.ProductoImagen, error) {

	return repository.GetProductImages(productID)
}

func DeleteProductImage(
	productID string,
	imageID string,
) error {

	cld, err := cloudinary.GetCloudinary()

	if err != nil {
		return err
	}

	// Obtener la imagen de PostgreSQL
	image, err := repository.GetProductImageByID(
		productID,
		imageID,
	)

	if err != nil {
		return err
	}

	ctx := context.Background()

	// Eliminar de Cloudinary
	if image.PublicID != "" {

		_, err = cld.Upload.Destroy(
			ctx,
			uploader.DestroyParams{
				PublicID: image.PublicID,
			},
		)

		if err != nil {
			return err
		}
	}

	// Eliminar registro de PostgreSQL
	err = repository.DeleteProductImage(
		productID,
		imageID,
	)

	if err != nil {
		return err
	}

	return nil
}
