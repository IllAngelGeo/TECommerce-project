package repository

import (
	"ecommerce-backend/internal/database"
)


func CalcularTotalCarrito(
	idUsuario string,
)(float64,error){

	var total float64


	query := `
	SELECT
		COALESCE(
			SUM(p.precio * c.cantidad),
			0
		)

	FROM carrito c

	INNER JOIN productos p
	ON p.id_producto = c.id_producto

	WHERE c.id_usuario = $1
	`


	err := database.DB.QueryRow(
		query,
		idUsuario,
	).Scan(&total)


	return total,err
}