package repository

import (
	"errors"
	"fmt"

	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/pedido/models"
)

var (
	ErrCarritoVacio      = errors.New("el carrito está vacío")
	ErrStockInsuficiente = errors.New("stock insuficiente")
	ErrProductoNoExiste  = errors.New("producto no existe")
)

// ==========================================
// OBTENER ID USUARIO POR FIREBASE
// ==========================================

func ObtenerIDUsuarioFirebase(idFirebase string) (string, error) {

	var idUsuario string

	query := `
		SELECT id_usuario
		FROM usuarios
		WHERE id_firebase = $1
	`

	err := database.DB.QueryRow(
		query,
		idFirebase,
	).Scan(&idUsuario)

	return idUsuario, err
}

// ==========================================
// CREAR PEDIDO
// ==========================================

func CrearPedido(
	idUsuario string,
	idDireccion string,
	metodoPago string,
) (*models.Pedido, error) {

	tx, err := database.DB.Begin()
	if err != nil {
		return nil, err
	}

	defer func() {
		if err != nil {
			tx.Rollback()
		}
	}()

	// ======================================
	// OBTENER CARRITO + INVENTARIO
	// ======================================

	queryCarrito := `
		SELECT
			c.id_producto,
			c.cantidad,
			p.precio,
			COALESCE(i.stock, 0)

		FROM carrito c

		INNER JOIN productos p
			ON p.id_producto = c.id_producto

		INNER JOIN inventario i
			ON i.id_producto = c.id_producto

		WHERE c.id_usuario = $1

		FOR UPDATE OF c, i
	`

	rows, err := tx.Query(
		queryCarrito,
		idUsuario,
	)

	if err != nil {
		return nil, err
	}

	type ProductoCompra struct {
		IDProducto string
		Cantidad   int
		Precio     float64
		Stock      int
	}

	var productos []ProductoCompra
	var total float64

	for rows.Next() {

		var producto ProductoCompra

		err := rows.Scan(
			&producto.IDProducto,
			&producto.Cantidad,
			&producto.Precio,
			&producto.Stock,
		)

		if err != nil {
			rows.Close()
			return nil, err
		}

		// ==================================
		// VALIDAR STOCK
		// ==================================

		if producto.Cantidad > producto.Stock {

			rows.Close()

			return nil, fmt.Errorf(
				"%w: producto %s, disponible %d, solicitado %d",
				ErrStockInsuficiente,
				producto.IDProducto,
				producto.Stock,
				producto.Cantidad,
			)
		}

		subtotal :=
			producto.Precio *
				float64(producto.Cantidad)

		total += subtotal

		productos = append(
			productos,
			producto,
		)
	}

	if err := rows.Err(); err != nil {
		rows.Close()
		return nil, err
	}

	rows.Close()

	// ======================================
	// VALIDAR CARRITO VACÍO
	// ======================================

	if len(productos) == 0 {
		return nil, ErrCarritoVacio
	}

	// ======================================
	// CREAR PEDIDO
	// ======================================

	var idPedido string

	queryPedido := `
    INSERT INTO pedidos
    (
        id_usuario,
        id_direccion,
        metodo_pago,
        total,
        estado
    )
    VALUES
    (
        $1,
        $2,
        $3,
        $4,
        'pendiente'
    )
    RETURNING id_pedido
`
	err = tx.QueryRow(
		queryPedido,
		idUsuario,
		idDireccion,
		metodoPago,
		total,
	).Scan(&idPedido)

	if err != nil {
		return nil, err
	}

	// ======================================
	// CREAR DETALLES + DESCONTAR STOCK
	// ======================================

	for _, producto := range productos {

		subtotal :=
			producto.Precio *
				float64(producto.Cantidad)

		// ----------------------------------
		// INSERTAR DETALLE
		// ----------------------------------

		queryDetalle := `
			INSERT INTO pedido_detalles
			(
				id_pedido,
				id_producto,
				cantidad,
				precio,
				subtotal
			)
			VALUES
			(
				$1,
				$2,
				$3,
				$4,
				$5
			)
		`

		_, err = tx.Exec(
			queryDetalle,
			idPedido,
			producto.IDProducto,
			producto.Cantidad,
			producto.Precio,
			subtotal,
		)

		if err != nil {
			return nil, err
		}

		// ----------------------------------
		// DESCONTAR INVENTARIO
		// ----------------------------------

		queryStock := `
			UPDATE inventario
			SET
				stock = stock - $1,
				fecha_actualizacion = now()
			WHERE id_producto = $2
			AND stock >= $1
		`

		result, err := tx.Exec(
			queryStock,
			producto.Cantidad,
			producto.IDProducto,
		)

		if err != nil {
			return nil, err
		}

		filas, err := result.RowsAffected()

		if err != nil {
			return nil, err
		}

		if filas == 0 {
			return nil, ErrStockInsuficiente
		}
	}

	// ======================================
	// VACIAR CARRITO
	// ======================================

	_, err = tx.Exec(
		`
		DELETE FROM carrito
		WHERE id_usuario = $1
		`,
		idUsuario,
	)

	if err != nil {
		return nil, err
	}

	// ======================================
	// COMMIT
	// ======================================

	err = tx.Commit()

	if err != nil {
		return nil, err
	}

	// ======================================
	// RESPUESTA
	// ======================================

	pedido := &models.Pedido{
		IDPedido:    idPedido,
		IDUsuario:   idUsuario,
		IDDireccion: idDireccion,
		MetodoPago:  metodoPago,
		Total:       total,
		Estado:      "pendiente",
		Detalles:    []models.PedidoDetalle{},
	}

	return pedido, nil
}

// ==========================================
// OBTENER PEDIDOS DEL USUARIO
// ==========================================

func ObtenerPedidos(idUsuario string) ([]models.Pedido, error) {

	query := `
    SELECT
        id_pedido,
        id_usuario,
        id_direccion,
        metodo_pago,
        total,
        estado,
        fecha_creacion
    FROM pedidos
    WHERE id_usuario = $1
    ORDER BY fecha_creacion DESC
`
	rows, err := database.DB.Query(
		query,
		idUsuario,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var pedidos []models.Pedido

	for rows.Next() {

		var pedido models.Pedido

		err := rows.Scan(
			&pedido.IDPedido,
			&pedido.IDUsuario,
			&pedido.IDDireccion,
			&pedido.MetodoPago,
			&pedido.Total,
			&pedido.Estado,
			&pedido.FechaCreacion,
		)
		if err != nil {
			return nil, err
		}

		pedido.Detalles = []models.PedidoDetalle{}

		pedidos = append(
			pedidos,
			pedido,
		)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if pedidos == nil {
		pedidos = []models.Pedido{}
	}

	return pedidos, nil
}

// ==========================================
// OBTENER DETALLES DE UN PEDIDO
// ==========================================

func ObtenerDetallesPedido(
	idPedido string,
) ([]models.PedidoDetalle, error) {

	query := `
		SELECT
			d.id_detalle,
			d.id_pedido,
			d.id_producto,
			d.cantidad,
			d.precio,
			d.subtotal,
			p.nombre,
			COALESCE(pi.imagen_url, '')

		FROM pedido_detalles d

		INNER JOIN productos p
			ON p.id_producto = d.id_producto

		LEFT JOIN producto_imagenes pi
			ON pi.id_producto = p.id_producto
			AND pi.principal = true

		WHERE d.id_pedido = $1
	`

	rows, err := database.DB.Query(
		query,
		idPedido,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var detalles []models.PedidoDetalle

	for rows.Next() {

		var detalle models.PedidoDetalle

		err := rows.Scan(
			&detalle.IDDetalle,
			&detalle.IDPedido,
			&detalle.IDProducto,
			&detalle.Cantidad,
			&detalle.Precio,
			&detalle.Subtotal,
			&detalle.Nombre,
			&detalle.Imagen,
		)

		if err != nil {
			return nil, err
		}

		detalles = append(
			detalles,
			detalle,
		)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if detalles == nil {
		detalles = []models.PedidoDetalle{}
	}

	return detalles, nil
}
