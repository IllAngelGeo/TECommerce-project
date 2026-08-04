package models

import "time"

type Marca struct {
	IDMarca        int        `json:"id_marca"`
	Nombre         string     `json:"nombre"`
	Descripcion    *string    `json:"descripcion,omitempty"`
	Activo         bool       `json:"activo"`
	FechaCreacion  time.Time  `json:"fecha_creacion"`
}