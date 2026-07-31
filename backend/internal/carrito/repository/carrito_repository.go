package repository

import (
	"errors"

	"ecommerce-backend/internal/carrito/models"
	"ecommerce-backend/internal/database"
)

// ==========================================
// ERRORES
// ==========================================

var (
	ErrStockInsuficiente = errors.New("stock insuficiente")
	ErrProductoNoExiste  = errors.New("producto no existe")
	ErrCarritoNoExiste   = errors.New("producto no existe en el carrito")
)

// ==========================================
// AGREGAR PRODUCTO AL CARRITO
// ==========================================

func AgregarProducto(carrito *models.Carrito) error {

	// Primero verificamos que el producto exista
	// y obtenemos su stock actual.

	var stock int

	err := database.DB.QueryRow(`
		SELECT i.stock
		FROM inventario i
		WHERE i.id_producto = $1
	`,
		carrito.IDProducto,
	).Scan(&stock)

	if err != nil {

		// Si no existe inventario para ese producto
		// consideramos que el producto no existe.

		return ErrProductoNoExiste
	}

	// Verificar que la cantidad solicitada
	// no sea mayor al stock disponible.

	if carrito.Cantidad > stock {
		return ErrStockInsuficiente
	}

	// ==========================================
	// INSERTAR O AUMENTAR CANTIDAD
	// ==========================================

	query := `
		INSERT INTO carrito
		(
			id_usuario,
			id_producto,
			cantidad
		)
		VALUES ($1, $2, $3)

		ON CONFLICT (id_usuario, id_producto)
		DO UPDATE SET
			cantidad = carrito.cantidad + EXCLUDED.cantidad

		WHERE carrito.cantidad + EXCLUDED.cantidad <= $4
	`

	result, err := database.DB.Exec(
		query,
		carrito.IDUsuario,
		carrito.IDProducto,
		carrito.Cantidad,
		stock,
	)

	if err != nil {
		return err
	}

	filas, err := result.RowsAffected()

	if err != nil {
		return err
	}

	if filas == 0 {
		return ErrStockInsuficiente
	}

	return nil
}

// ==========================================
// OBTENER CARRITO DE USUARIO
// ==========================================

func ObtenerCarrito(idUsuario string) ([]models.Carrito, error) {

	query := `
		SELECT
			c.id_carrito,
			c.id_usuario,
			c.id_producto,
			c.cantidad,
			p.nombre,
			p.precio,
			pi.imagen_url,
			COALESCE(i.stock, 0)

		FROM carrito c

		INNER JOIN productos p
			ON p.id_producto = c.id_producto

		LEFT JOIN inventario i
			ON i.id_producto = p.id_producto

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
			&producto.Stock,
		)

		if err != nil {
			return nil, err
		}

		carrito = append(carrito, producto)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if carrito == nil {
		carrito = []models.Carrito{}
	}

	return carrito, nil
}

// ==========================================
// ACTUALIZAR CANTIDAD
// ==========================================

func ActualizarCantidad(
	idCarrito string,
	cantidad int,
) error {

	query := `
		UPDATE carrito c

		SET cantidad = $1

		FROM inventario i

		WHERE c.id_carrito = $2

		AND i.id_producto = c.id_producto

		AND $1 <= i.stock
	`

	result, err := database.DB.Exec(
		query,
		cantidad,
		idCarrito,
	)

	if err != nil {
		return err
	}

	filas, err := result.RowsAffected()

	if err != nil {
		return err
	}

	if filas == 0 {

		// Verificamos si el carrito existe.

		var existe bool

		err := database.DB.QueryRow(`
			SELECT EXISTS(
				SELECT 1
				FROM carrito
				WHERE id_carrito = $1
			)
		`,
			idCarrito,
		).Scan(&existe)

		if err != nil {
			return err
		}

		if !existe {
			return ErrCarritoNoExiste
		}

		return ErrStockInsuficiente
	}

	return nil
}

// ==========================================
// OBTENER ID USUARIO POR FIREBASE
// ==========================================

func ObtenerIDUsuarioFirebase(
	idFirebase string,
) (string, error) {

	var id string

	query := `
		SELECT id_usuario
		FROM usuarios
		WHERE id_firebase = $1
	`

	err := database.DB.QueryRow(
		query,
		idFirebase,
	).Scan(&id)

	return id, err
}

// ==========================================
// ELIMINAR PRODUCTO DEL CARRITO
// ==========================================

func EliminarCarrito(
	idCarrito string,
) error {

	query := `
		DELETE FROM carrito
		WHERE id_carrito = $1
	`

	result, err := database.DB.Exec(
		query,
		idCarrito,
	)

	if err != nil {
		return err
	}

	filas, err := result.RowsAffected()

	if err != nil {
		return err
	}

	if filas == 0 {
		return ErrCarritoNoExiste
	}

	return nil
}