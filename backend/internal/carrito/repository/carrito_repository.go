package repository

import (
	"ecommerce-backend/internal/carrito/models"
	"ecommerce-backend/internal/database"
)

func AgregarProducto(carrito *models.Carrito) error {

	query := `

INSERT INTO carrito
(
id_usuario,
id_producto,
cantidad
)

VALUES
($1,$2,$3)

`

	_, err := database.DB.Exec(
		query,
		carrito.IDUsuario,
		carrito.IDProducto,
		carrito.Cantidad,
	)

	return err

}

// OBTENER CARRITO DE USUARIO
// OBTENER CARRITO DE USUARIO
func ObtenerCarrito(idUsuario string) ([]models.Carrito, error) {

	query := `
SELECT
c.id_carrito,
c.id_usuario,
c.id_producto,
c.cantidad,
p.nombre,
p.precio,
pi.imagen_url

FROM carrito c

INNER JOIN productos p
ON p.id_producto = c.id_producto

LEFT JOIN producto_imagenes pi
ON pi.id_producto = p.id_producto
AND pi.principal = true

WHERE c.id_usuario = $1
`

	rows, err := database.DB.Query(
		query,
		idUsuario,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var carrito []models.Carrito

	for rows.Next() {

		var producto models.Carrito

		err := rows.Scan(
			&producto.IDCarrito,
			&producto.IDUsuario,
			&producto.IDProducto,
			&producto.Cantidad,
			&producto.Nombre,
			&producto.Precio,
			&producto.Imagen,
		)

		if err != nil {
			return nil, err
		}

		carrito = append(carrito, producto)
	}

	if carrito == nil {
		carrito = []models.Carrito{}
	}

	return carrito, nil

}

func ActualizarCantidad(idCarrito string, cantidad int) error {

	query := `
	UPDATE carrito
	SET cantidad = $1
	WHERE id_carrito = $2
	`

	_, err := database.DB.Exec(
		query,
		cantidad,
		idCarrito,
	)

	return err
}

func ObtenerIDUsuarioFirebase(
	idFirebase string,
) (string, error) {

	var id string

	query := `
SELECT id_usuario
FROM usuarios
WHERE id_firebase=$1
`

	err := database.DB.QueryRow(
		query,
		idFirebase,
	).Scan(&id)

	return id, err

}

func EliminarCarrito(idCarrito string) error {

	query := `
	DELETE FROM carrito
	WHERE id_carrito = $1
	`

	_, err := database.DB.Exec(
		query,
		idCarrito,
	)

	return err
}
