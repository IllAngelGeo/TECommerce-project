package models

type Direccion struct {
	IDDireccion        string `json:"id_direccion"`
	IDUsuario          string `json:"id_usuario"`
	Calle              string `json:"calle"`
	NumeroExterior     string `json:"numero_exterior"`
	NumeroInterior     string `json:"numero_interior"`
	Colonia            string `json:"colonia"`
	CodigoPostal       string `json:"codigo_postal"`
	Ciudad             string `json:"ciudad"`
	Estado             string `json:"estado"`
	Referencias        string `json:"referencias"`
	Principal          bool   `json:"principal"`
	FechaCreacion      string `json:"fecha_creacion"`
	FechaActualizacion string `json:"fecha_actualizacion"`
}