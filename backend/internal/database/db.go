package database

import (
	"database/sql"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/stdlib"
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

	// Usar protocolo simple para evitar conflictos
	// con prepared statements / stmtcache
	config.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	// Crear conexión usando la configuración de pgx
	DB = stdlib.OpenDB(*config)

	// =========================
	// CONFIGURACIÓN DEL POOL
	// =========================

	DB.SetMaxOpenConns(10)
	DB.SetMaxIdleConns(5)

	DB.SetConnMaxLifetime(30 * time.Minute)
	DB.SetConnMaxIdleTime(5 * time.Minute)

	// =========================
	// COMPROBAR CONEXIÓN
	// =========================

	if err = DB.Ping(); err != nil {
		log.Fatalf("Error conectando a Supabase: %v", err)
	}

	log.Println("✅ Conectado a Supabase correctamente")
}