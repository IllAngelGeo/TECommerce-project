package service

import (
	"errors"

	"ecommerce-backend/internal/marca/models"
	"ecommerce-backend/internal/marca/repository"
)

// ==========================================
// OBTENER TODAS LAS MARCAS
// ==========================================

func GetAllMarcas() ([]models.Marca, error) {

	return repository.GetAllMarcas()

}

// ==========================================
// CREAR MARCA
// ==========================================

func CreateMarca(marca models.Marca) error {

	if marca.Nombre == "" {
		return errors.New("el nombre de la marca es obligatorio")
	}

	return repository.CreateMarca(marca)

}

// ==========================================
// OBTENER MARCA POR ID
// ==========================================

func GetMarcaByID(id int) (models.Marca, error) {

	if id <= 0 {
		return models.Marca{}, errors.New("id inválido")
	}

	return repository.GetMarcaByID(id)

}

// ==========================================
// ACTUALIZAR MARCA
// ==========================================

func UpdateMarca(id int, marca models.Marca) error {

	if id <= 0 {
		return errors.New("id inválido")
	}

	if marca.Nombre == "" {
		return errors.New("el nombre es obligatorio")
	}

	return repository.UpdateMarca(id, marca)

}

// ==========================================
// ELIMINAR MARCA
// ==========================================

func DeleteMarca(id int) error {

	if id <= 0 {
		return errors.New("id inválido")
	}

	return repository.DeleteMarca(id)

}
