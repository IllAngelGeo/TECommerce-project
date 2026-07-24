package database

import (
	"database/sql"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	_ "github.com/jackc/pgx/v5/stdlib"
)

var DB *sql.DB

func Connect() {

	dbURL := os.Getenv("DB_URL")

	if dbURL == "" {
		log.Fatal("DB_URL no está configurada")
	}

	log.Println("🔌 Configurando conexión a PostgreSQL...")

	// Parsear configuración de pgx
	config, err := pgx.ParseConfig(dbURL)

	if err != nil {
		log.Fatalf("Error configurando DB: %v", err)
	}

	config.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	// Crear connection string
	connString := config.ConnString()

	// Abrir pool
	DB, err = sql.Open("pgx", connString)

	if err != nil {
		log.Fatalf("Error abriendo conexión: %v", err)
	}

	// =========================
	// CONFIGURACIÓN DEL POOL
	// =========================

	// Máximo de conexiones abiertas
	DB.SetMaxOpenConns(10)

	// Conexiones que pueden mantenerse inactivas
	DB.SetMaxIdleConns(5)

	// Tiempo máximo que una conexión puede estar viva
	DB.SetConnMaxLifetime(30 * time.Minute)

	// Tiempo máximo que una conexión puede estar inactiva
	DB.SetConnMaxIdleTime(5 * time.Minute)

	// =========================
	// COMPROBAR CONEXIÓN
	// =========================

	if err = DB.Ping(); err != nil {
		log.Fatalf("Error conectando a Supabase: %v", err)
	}

	log.Println("Conectado a Supabase correctamente")

}
