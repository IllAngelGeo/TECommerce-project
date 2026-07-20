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

	image := &models.ProductoImagen{
		IDProducto: productID,
		ImagenURL:  result.SecureURL,
		Orden:      0,
		Principal:  false,
	}

	err = repository.CreateProductImage(image)

	if err != nil {
		return nil, err
	}

	return image, nil
}