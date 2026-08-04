	package service

	import (
		"context"
		"errors"
		"fmt"
		"mime/multipart"

		"ecommerce-backend/internal/banner/models"
		"ecommerce-backend/internal/banner/repository"
		"ecommerce-backend/internal/cloudinary"

		"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	)

	// ==========================================
	// OBTENER TODOS
	// ==========================================

	func GetAllBanners() ([]models.Banner, error) {

		return repository.GetAllBanners()

	}

	// ==========================================
	// CREAR
	// ==========================================

	func CreateBanner(
		banner models.Banner,
	) (int, error) {

		if banner.Titulo == "" {

			return 0, errors.New(
				"el titulo es obligatorio",
			)

		}

		return repository.CreateBanner(
			banner,
		)

	}

	// ==========================================
	// OBTENER POR ID
	// ==========================================

	func GetBannerByID(
		id int,
	) (models.Banner, error) {

		if id <= 0 {

			return models.Banner{},
				errors.New(
					"id invalido",
				)

		}

		return repository.GetBannerByID(
			id,
		)

	}

	// ==========================================
	// ACTUALIZAR
	// ==========================================

	func UpdateBanner(
		id int,
		banner models.Banner,
	) error {

		if id <= 0 {

			return errors.New(
				"id invalido",
			)

		}

		return repository.UpdateBanner(
			id,
			banner,
		)

	}

	// ==========================================
	// ELIMINAR
	// ==========================================

	func DeleteBanner(
		id int,
	) error {

		if id <= 0 {

			return errors.New(
				"id invalido",
			)

		}

		return repository.DeleteBanner(
			id,
		)

	}

	// ==========================================
	// SUBIR IMAGEN CLOUDINARY
	// ==========================================

	func UploadBannerImage(
		file multipart.File,
		header *multipart.FileHeader,
		bannerID string,
	) (string, error) {

		cld, err := cloudinary.GetCloudinary()

		if err != nil {

			return "", err

		}

		ctx := context.Background()

		result, err := cld.Upload.Upload(
			ctx,
			file,
			uploader.UploadParams{

				Folder: fmt.Sprintf(
					"tecommerce/banners/%s",
					bannerID,
				),
			},
		)

		if err != nil {

			return "", err

		}

		err = repository.UpdateBannerImage(
			bannerID,
			result.SecureURL,
			result.PublicID,
		)

		if err != nil {

			return "", err

		}

		return result.SecureURL, nil

	}
