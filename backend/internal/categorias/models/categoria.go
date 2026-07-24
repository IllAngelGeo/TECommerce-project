package models

import "time"

type Categoria struct {
	IDCategoria   int       `json:"id_categoria"`
	Nombre        string    `json:"nombre"`
	Descripcion   *string   `json:"descripcion,omitempty"`
	ImagenURL     *string   `json:"imagen_url,omitempty"`
	Activo        bool      `json:"activo"`
	FechaCreacion time.Time `json:"fecha_creacion"`
}