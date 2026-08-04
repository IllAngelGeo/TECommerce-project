package models

import "time"

type Banner struct {
	IDBanner int `json:"id_banner"`

	Titulo string `json:"titulo"`

	Subtitulo *string `json:"subtitulo,omitempty"`

	TextoBoton *string `json:"texto_boton,omitempty"`

	ImagenURL string `json:"imagen_url"`

	PublicID string `json:"public_id"`

	Activo bool `json:"activo"`

	FechaCreacion time.Time `json:"fecha_creacion"`
}
