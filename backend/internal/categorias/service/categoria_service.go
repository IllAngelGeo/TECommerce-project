package service

import (
	"ecommerce-backend/internal/categorias/models"
	"ecommerce-backend/internal/categorias/repository"
)

func GetCategories() ([]models.Categoria, error) {

	return repository.GetAllCategories()
}

func GetCategory(id int) (models.Categoria, error) {

	return repository.GetCategoryByID(id)
}

func CreateCategory(categoria models.Categoria) error {

	return repository.CreateCategory(categoria)
}

func UpdateCategory(id int, categoria models.Categoria) error {

	return repository.UpdateCategory(id, categoria)
}

func DeleteCategory(id int) error {

	return repository.DeleteCategory(id)
}
