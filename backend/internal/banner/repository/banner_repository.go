package repository

import (
	"ecommerce-backend/internal/banner/models"
	"ecommerce-backend/internal/database"
)

// ==========================================
// OBTENER TODOS LOS BANNERS
// ==========================================

func GetAllBanners() ([]models.Banner, error) {

	query := `
	SELECT
		id_banner,
		titulo,
		subtitulo,
		texto_boton,
		imagen_url,
		public_id,
		activo,
		fecha_creacion
	FROM banners
	ORDER BY id_banner ASC
	`

	rows, err := database.DB.Query(query)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var banners []models.Banner

	for rows.Next() {

		var banner models.Banner

		err := rows.Scan(
			&banner.IDBanner,
			&banner.Titulo,
			&banner.Subtitulo,
			&banner.TextoBoton,
			&banner.ImagenURL,
			&banner.PublicID,
			&banner.Activo,
			&banner.FechaCreacion,
		)

		if err != nil {
			return nil, err
		}

		banners = append(
			banners,
			banner,
		)

	}

	return banners, nil
}

// ==========================================
// CREAR BANNER
// ==========================================

func CreateBanner(
	banner models.Banner,
) (int, error) {

	query := `
	INSERT INTO banners
	(
		titulo,
		subtitulo,
		texto_boton,
		imagen_url,
		public_id,
		activo
	)
	VALUES
	($1,$2,$3,$4,$5,$6)
	RETURNING id_banner
	`

	var id int

	err := database.DB.QueryRow(
		query,
		banner.Titulo,
		banner.Subtitulo,
		banner.TextoBoton,
		banner.ImagenURL,
		banner.PublicID,
		banner.Activo,
	).Scan(&id)

	return id, err

}

// ==========================================
// OBTENER BANNER POR ID
// ==========================================

func GetBannerByID(
	id int,
) (models.Banner, error) {

	var banner models.Banner

	query := `
	SELECT
		id_banner,
		titulo,
		subtitulo,
		texto_boton,
		imagen_url,
		public_id,
		activo,
		fecha_creacion
	FROM banners
	WHERE id_banner=$1
	`

	err := database.DB.QueryRow(
		query,
		id,
	).Scan(

		&banner.IDBanner,
		&banner.Titulo,
		&banner.Subtitulo,
		&banner.TextoBoton,
		&banner.ImagenURL,
		&banner.PublicID,
		&banner.Activo,
		&banner.FechaCreacion,
	)

	return banner, err

}

// ==========================================
// ACTUALIZAR BANNER
// ==========================================

func UpdateBanner(
	id int,
	banner models.Banner,
) error {

	query := `
	UPDATE banners
	SET
		titulo=$1,
		subtitulo=$2,
		texto_boton=$3,
		imagen_url=$4,
		public_id=$5,
		activo=$6
	WHERE id_banner=$7
	`

	_, err := database.DB.Exec(
		query,
		banner.Titulo,
		banner.Subtitulo,
		banner.TextoBoton,
		banner.ImagenURL,
		banner.PublicID,
		banner.Activo,
		id,
	)

	return err

}

// ==========================================
// ACTUALIZAR IMAGEN CLOUDINARY
// ==========================================

func UpdateBannerImage(
	id string,
	url string,
	publicID string,
) error {

	query := `
	UPDATE banners
	SET
		imagen_url=$1,
		public_id=$2
	WHERE id_banner=$3
	`

	_, err := database.DB.Exec(
		query,
		url,
		publicID,
		id,
	)

	return err

}

// ==========================================
// ELIMINAR BANNER
// ==========================================

func DeleteBanner(
	id int,
) error {

	query := `
	DELETE FROM banners
	WHERE id_banner=$1
	`

	_, err := database.DB.Exec(
		query,
		id,
	)

	return err

}
