package routes

import (
	"github.com/gin-gonic/gin"

	"ecommerce-backend/internal/usuarios/controllers"
)

func SetupRoutes(r *gin.Engine) {

	auth := r.Group("/auth")
	{
		auth.POST("/register", controllers.Register)
	}

}
