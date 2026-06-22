package database

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/jackc/pgx/v5/stdlib"
)

var DB *sql.DB

func Connect() {
	dbURL := os.Getenv("DB_URL")
	log.Println("DB_URL =>", dbURL)

	var err error
	DB, err = sql.Open("pgx", dbURL)
	if err != nil {
		log.Fatalf("❌ Error abriendo DB: %v", err)
	}

	DB.SetMaxOpenConns(10)
	DB.SetMaxIdleConns(5)

	if err = DB.Ping(); err != nil {
		log.Fatalf("❌ Error conectando a Supabase: %v", err)
	}

	log.Println("🔥 Conectado a Supabase correctamente")
}
