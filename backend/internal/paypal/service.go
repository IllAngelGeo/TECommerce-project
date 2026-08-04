package paypal

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

type AccessTokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}

func GetAccessToken() (string, error) {

	clientID := os.Getenv("PAYPAL_CLIENT_ID")
	clientSecret := os.Getenv("PAYPAL_CLIENT_SECRET")
	baseURL := os.Getenv("PAYPAL_BASE_URL")

	if clientID == "" {
		return "", fmt.Errorf("PAYPAL_CLIENT_ID no está configurado")
	}

	if clientSecret == "" {
		return "", fmt.Errorf("PAYPAL_CLIENT_SECRET no está configurado")
	}

	if baseURL == "" {
		return "", fmt.Errorf("PAYPAL_BASE_URL no está configurado")
	}

	url := baseURL + "/v1/oauth2/token"

	body := strings.NewReader(
		"grant_type=client_credentials",
	)

	req, err := http.NewRequest(
		http.MethodPost,
		url,
		body,
	)

	if err != nil {
		return "", fmt.Errorf(
			"error creando petición PayPal: %w",
			err,
		)
	}

	req.SetBasicAuth(clientID, clientSecret)

	req.Header.Set(
		"Content-Type",
		"application/x-www-form-urlencoded",
	)

	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	response, err := client.Do(req)

	if err != nil {
		return "", fmt.Errorf(
			"error conectando con PayPal: %w",
			err,
		)
	}

	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {

		var errorBody map[string]interface{}

		json.NewDecoder(response.Body).Decode(&errorBody)

		return "", fmt.Errorf(
			"PayPal respondió con status %d: %v",
			response.StatusCode,
			errorBody,
		)
	}

	var tokenResponse AccessTokenResponse

	if err := json.NewDecoder(
		response.Body,
	).Decode(&tokenResponse); err != nil {

		return "", fmt.Errorf(
			"error leyendo respuesta de PayPal: %w",
			err,
		)
	}

	if tokenResponse.AccessToken == "" {
		return "", fmt.Errorf(
			"PayPal no devolvió access token",
		)
	}

	return tokenResponse.AccessToken, nil
}

type CreateOrderRequest struct {
	Amount   string `json:"amount"`
	Currency string `json:"currency"`
}

type CreateOrderResponse struct {
	ID     string       `json:"id"`
	Status string       `json:"status"`
	Links  []PayPalLink `json:"links"`
}

type PayPalLink struct {
	Href   string `json:"href"`
	Rel    string `json:"rel"`
	Method string `json:"method"`
}

func CreateOrder(amount string) (*CreateOrderResponse, error) {

	// Obtener Access Token
	accessToken, err := GetAccessToken()

	if err != nil {
		return nil, err
	}

	baseURL := os.Getenv("PAYPAL_BASE_URL")

	if baseURL == "" {
		return nil, fmt.Errorf(
			"PAYPAL_BASE_URL no está configurado",
		)
	}

	url := baseURL + "/v2/checkout/orders"

	// Datos de la orden
	order := map[string]interface{}{
		"intent": "CAPTURE",

		"purchase_units": []map[string]interface{}{
			{
				"amount": map[string]string{
					"currency_code": "MXN",
					"value":         amount,
				},
			},
		},

		"application_context": map[string]interface{}{
			"brand_name":   "TeCommerce",
			"landing_page": "LOGIN",
			"user_action":  "PAY_NOW",
			"return_url":   "tecommerce://paypal-success",
			"cancel_url":   "tecommerce://paypal-cancel",
		},
	}

	jsonBody, err := json.Marshal(order)

	if err != nil {
		return nil, fmt.Errorf(
			"error convirtiendo orden a JSON: %w",
			err,
		)
	}

	req, err := http.NewRequest(
		http.MethodPost,
		url,
		strings.NewReader(string(jsonBody)),
	)

	if err != nil {
		return nil, fmt.Errorf(
			"error creando petición de orden PayPal: %w",
			err,
		)
	}

	// Autenticación
	req.Header.Set(
		"Authorization",
		"Bearer "+accessToken,
	)

	req.Header.Set(
		"Content-Type",
		"application/json",
	)

	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	response, err := client.Do(req)

	if err != nil {
		return nil, fmt.Errorf(
			"error conectando con PayPal: %w",
			err,
		)
	}

	defer response.Body.Close()

	// Verificar respuesta
	if response.StatusCode < 200 || response.StatusCode >= 300 {

		var errorBody map[string]interface{}

		json.NewDecoder(
			response.Body,
		).Decode(&errorBody)

		return nil, fmt.Errorf(
			"PayPal respondió con status %d: %v",
			response.StatusCode,
			errorBody,
		)
	}

	// Leer respuesta
	var orderResponse CreateOrderResponse

	if err := json.NewDecoder(
		response.Body,
	).Decode(&orderResponse); err != nil {

		return nil, fmt.Errorf(
			"error leyendo respuesta de PayPal: %w",
			err,
		)
	}

	if orderResponse.ID == "" {
		return nil, fmt.Errorf(
			"PayPal no devolvió ID de la orden",
		)
	}

	return &orderResponse, nil
}

func CaptureOrder(orderID string) (map[string]interface{}, error) {

	// Obtener Access Token
	accessToken, err := GetAccessToken()

	if err != nil {
		return nil, err
	}

	baseURL := os.Getenv("PAYPAL_BASE_URL")

	if baseURL == "" {
		return nil, fmt.Errorf(
			"PAYPAL_BASE_URL no está configurado",
		)
	}

	url := baseURL + "/v2/checkout/orders/" + orderID + "/capture"

	// Crear petición
	req, err := http.NewRequest(
		http.MethodPost,
		url,
		nil,
	)

	if err != nil {
		return nil, fmt.Errorf(
			"error creando petición de captura: %w",
			err,
		)
	}

	// Autenticación
	req.Header.Set(
		"Authorization",
		"Bearer "+accessToken,
	)

	req.Header.Set(
		"Content-Type",
		"application/json",
	)

	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	response, err := client.Do(req)

	if err != nil {
		return nil, fmt.Errorf(
			"error conectando con PayPal: %w",
			err,
		)
	}

	defer response.Body.Close()

	// Leer respuesta
	var responseBody map[string]interface{}

	if err := json.NewDecoder(
		response.Body,
	).Decode(&responseBody); err != nil {

		return nil, fmt.Errorf(
			"error leyendo respuesta de PayPal: %w",
			err,
		)
	}

	// Verificar error
	if response.StatusCode < 200 || response.StatusCode >= 300 {

		return nil, fmt.Errorf(
			"PayPal respondió con status %d: %v",
			response.StatusCode,
			responseBody,
		)
	}

	return responseBody, nil
}
