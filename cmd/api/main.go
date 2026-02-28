package main

import (
	"context"
	"log"
	"os"

	"github.com/Puriice/pAuthentication/internal/server"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func getHost() string {
	host := os.Getenv("HOST")

	return host
}

func getPort() string {
	port := os.Getenv("PORT")

	if port == "" {
		return "8080"
	}

	return port
}

var Port string

func main() {
	err := godotenv.Load()

	if err != nil {
		log.Fatal("Error loading .env file")
	}

	Port = getPort()

	var connectionString = os.Getenv("DB_URL")

	if connectionString == "" {
		log.Fatal("Invalid connection string.")
		return
	}

	db, err := pgxpool.New(context.Background(), connectionString)

	if err != nil {
		log.Fatal(err)
		return
	}

	defer db.Close()

	server := server.NewServer(getHost(), getPort(), db)
	server.Start()
}
