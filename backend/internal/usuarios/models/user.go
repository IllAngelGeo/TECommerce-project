package models

type User struct {
	IDFirebase      string `json:"id_firebase"`
	Email           string `json:"email"`
	Nombre          string `json:"nombre"`
	ApellidoPaterno string `json:"apellido_paterno"`
	ApellidoMaterno string `json:"apellido_materno"`
	Telefono        string `json:"telefono"`
	FechaNacimiento string `json:"fecha_nacimiento"`
	Provider        string `json:"provider"`
	Rol             string `json:"rol"`
}
