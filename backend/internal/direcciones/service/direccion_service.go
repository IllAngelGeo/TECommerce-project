package service

import (
	"errors"
	"strings"

	"ecommerce-backend/internal/direcciones/models"
	"ecommerce-backend/internal/direcciones/repository"
)

// ==========================================
// CREAR DIRECCIÓN
// ==========================================

func CrearDireccion(
	idFirebase string,
	direccion models.Direccion,
) (*models.Direccion, error) {

	if strings.TrimSpace(idFirebase) == "" {
		return nil, errors.New("id firebase obligatorio")
	}

	// ==============================
	// VALIDAR CAMPOS
	// ==============================

	if strings.TrimSpace(direccion.Calle) == "" {
		return nil, errors.New("calle obligatoria")
	}

	if strings.TrimSpace(direccion.NumeroExterior) == "" {
		return nil, errors.New("numero exterior obligatorio")
	}

	if strings.TrimSpace(direccion.Colonia) == "" {
		return nil, errors.New("colonia obligatoria")
	}

	if strings.TrimSpace(direccion.CodigoPostal) == "" {
		return nil, errors.New("codigo postal obligatorio")
	}

	if strings.TrimSpace(direccion.Ciudad) == "" {
		return nil, errors.New("ciudad obligatoria")
	}

	if strings.TrimSpace(direccion.Estado) == "" {
		return nil, errors.New("estado obligatorio")
	}

	// ==============================
	// OBTENER USUARIO
	// ==============================

	idUsuario, err :=
		repository.ObtenerIDUsuarioFirebase(
			idFirebase,
		)

	if err != nil {
		return nil, errors.New(
			"usuario no encontrado",
		)
	}

	direccion.IDUsuario = idUsuario

	// ==============================
	// CREAR DIRECCIÓN
	// ==============================

	return repository.CrearDireccion(
		direccion,
	)
}

// ==========================================
// OBTENER DIRECCIONES
// ==========================================

func ObtenerDirecciones(
	idFirebase string,
) ([]models.Direccion, error) {

	if strings.TrimSpace(idFirebase) == "" {
		return nil, errors.New(
			"id firebase obligatorio",
		)
	}

	idUsuario, err :=
		repository.ObtenerIDUsuarioFirebase(
			idFirebase,
		)

	if err != nil {
		return nil, errors.New(
			"usuario no encontrado",
		)
	}

	return repository.ObtenerDirecciones(
		idUsuario,
	)
}

// ==========================================
// ACTUALIZAR DIRECCIÓN
// ==========================================

func ActualizarDireccion(
	idFirebase string,
	idDireccion string,
	direccion models.Direccion,
) (*models.Direccion, error) {

	if strings.TrimSpace(idFirebase) == "" {
		return nil, errors.New(
			"id firebase obligatorio",
		)
	}

	if strings.TrimSpace(idDireccion) == "" {
		return nil, errors.New(
			"id direccion obligatorio",
		)
	}

	if strings.TrimSpace(direccion.Calle) == "" {
		return nil, errors.New(
			"calle obligatoria",
		)
	}

	if strings.TrimSpace(direccion.NumeroExterior) == "" {
		return nil, errors.New(
			"numero exterior obligatorio",
		)
	}

	if strings.TrimSpace(direccion.Colonia) == "" {
		return nil, errors.New(
			"colonia obligatoria",
		)
	}

	if strings.TrimSpace(direccion.CodigoPostal) == "" {
		return nil, errors.New(
			"codigo postal obligatorio",
		)
	}

	if strings.TrimSpace(direccion.Ciudad) == "" {
		return nil, errors.New(
			"ciudad obligatoria",
		)
	}

	if strings.TrimSpace(direccion.Estado) == "" {
		return nil, errors.New(
			"estado obligatorio",
		)
	}

	// Verificar usuario
	idUsuario, err :=
		repository.ObtenerIDUsuarioFirebase(
			idFirebase,
		)

	if err != nil {
		return nil, errors.New(
			"usuario no encontrado",
		)
	}

	// ==========================================
	// IMPORTANTE
	// ==========================================
	// Aquí comprobamos que la dirección
	// realmente pertenece al usuario.

	direcciones, err :=
		repository.ObtenerDirecciones(
			idUsuario,
		)

	if err != nil {
		return nil, err
	}

	pertenece := false

	for _, d := range direcciones {

		if d.IDDireccion == idDireccion {
			pertenece = true
			break
		}
	}

	if !pertenece {
		return nil, errors.New(
			"direccion no pertenece al usuario",
		)
	}

	return repository.ActualizarDireccion(
		idDireccion,
		direccion,
	)
}

// ==========================================
// ELIMINAR DIRECCIÓN
// ==========================================

func EliminarDireccion(
	idFirebase string,
	idDireccion string,
) error {

	if strings.TrimSpace(idFirebase) == "" {
		return errors.New(
			"id firebase obligatorio",
		)
	}

	if strings.TrimSpace(idDireccion) == "" {
		return errors.New(
			"id direccion obligatorio",
		)
	}

	idUsuario, err :=
		repository.ObtenerIDUsuarioFirebase(
			idFirebase,
		)

	if err != nil {
		return errors.New(
			"usuario no encontrado",
		)
	}

	// ==========================================
	// COMPROBAR QUE PERTENECE AL USUARIO
	// ==========================================

	direcciones, err :=
		repository.ObtenerDirecciones(
			idUsuario,
		)

	if err != nil {
		return err
	}

	pertenece := false

	for _, d := range direcciones {

		if d.IDDireccion == idDireccion {
			pertenece = true
			break
		}
	}

	if !pertenece {
		return errors.New(
			"direccion no pertenece al usuario",
		)
	}

	return repository.EliminarDireccion(
		idDireccion,
	)
}

// ==========================================
// MARCAR COMO PRINCIPAL
// ==========================================

func MarcarPrincipal(
	idFirebase string,
	idDireccion string,
) (*models.Direccion, error) {

	if strings.TrimSpace(idFirebase) == "" {
		return nil, errors.New(
			"id firebase obligatorio",
		)
	}

	if strings.TrimSpace(idDireccion) == "" {
		return nil, errors.New(
			"id direccion obligatorio",
		)
	}

	// Obtener usuario
	idUsuario, err :=
		repository.ObtenerIDUsuarioFirebase(
			idFirebase,
		)

	if err != nil {
		return nil, errors.New(
			"usuario no encontrado",
		)
	}

	// Marcar dirección
	return repository.MarcarPrincipal(
		idDireccion,
		idUsuario,
	)
}
