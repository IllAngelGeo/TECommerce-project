package service

import (
	"ecommerce-backend/internal/categorias/models"
	"ecommerce-backend/internal/categorias/repository"
)

func GetCategories() ([]models.Categoria, error) {

	return repository.GetAllCategories()
}