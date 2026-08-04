package mercadopago

import (
	"context"
	"fmt"
	"os"

	carritoRepository "ecommerce-backend/internal/carrito/repository"

	"github.com/mercadopago/sdk-go/pkg/config"
	"github.com/mercadopago/sdk-go/pkg/preference"
)

func CrearPreferencia(idFirebase string) (string, error) {

	idUsuario, err := carritoRepository.ObtenerIDUsuarioFirebase(idFirebase)

	if err != nil {
		return "", err
	}

	productos, err := carritoRepository.ObtenerCarrito(idUsuario)

	if err != nil {
		return "", err
	}

	accessToken := os.Getenv("MERCADOPAGO_ACCESS_TOKEN")

	if accessToken == "" {
		return "", fmt.Errorf(
			"MERCADOPAGO_ACCESS_TOKEN no configurado",
		)
	}

	cfg, err := config.New(accessToken)

	if err != nil {
		return "", err
	}

	client := preference.NewClient(cfg)

	items := make([]preference.ItemRequest, 0)

	for _, producto := range productos {

		item := preference.ItemRequest{

			ID: producto.IDProducto,

			Title: producto.Nombre,

			Description: "Producto tecnológico TeCommerce",

			Quantity: producto.Cantidad,

			CurrencyID: "MXN",

			UnitPrice: producto.Precio,
		}

		items = append(items, item)
	}

	preferenceRequest := preference.Request{

		Items: items,

		BackURLs: &preference.BackURLsRequest{

			Success: "tecommerce://payment-success",

			Failure: "tecommerce://payment-failure",

			Pending: "tecommerce://payment-pending",
		},

		AutoReturn: "approved",
	}

	result, err := client.Create(
		context.Background(),
		preferenceRequest,
	)

	if err != nil {
		return "", err
	}

	return result.InitPoint, nil
}
