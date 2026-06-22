package models

type User struct {
	IDFirebase      string `json:"id_firebase"`
	Email           string `json:"email"`
	Nombre          string `json:"nombre"`
	ApellidoPaterno string `json:"apellido_paterno"`
	ApellidoMaterno string `json:"apellido_materno"`
	Telefono        string `json:"telefono"`
	Provider        string `json:"provider"`
}