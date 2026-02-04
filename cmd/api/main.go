package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/Puriice/pAuthentication/internal/handler"
	"github.com/Puriice/pAuthentication/internal/middleware"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func getPort() string {
	port := os.Getenv("PORT");

	if (port == "") {
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

	var connectionString = os.Getenv("DB_URL");

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

	auth := handler.Server { DB: db }

	router := http.NewServeMux()

	router.HandleFunc("POST /api/v1/login", auth.LoginHandler)
	router.HandleFunc("POST /api/v1/register", auth.RegisterHandler)

	server := http.Server{
		Addr: fmt.Sprintf(":%s", Port),
		Handler: middleware.Logger(router),
	}

	log.Printf("Listening on port %s", Port)
	log.Fatal(server.ListenAndServe())
}