package main

import (
	"log"
	"time"

	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {

	// Cargar variables de entorno sin matar el servidor
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️ No se encontró .env, continuando...")
	}

	// Conexión a base de datos
	database.Connect()

	r := gin.Default()

	// Seguridad proxy (correcto para producción y evita warning)
	r.SetTrustedProxies(nil)

	// CORS (IMPORTANTE si usas frontend)
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Rutas
	routes.SetupRoutes(r)

	// Health check
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "ok"})
	})

	log.Println("Servidor corriendo en http://localhost:8080")

	// Levantar servidor (y capturar error)
	if err := r.Run(":8080"); err != nil {
		log.Fatal("❌ Error al iniciar servidor:", err)
	}
}
