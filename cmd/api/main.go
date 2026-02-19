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

	v1Router := http.NewServeMux()

	v1Router.Handle("/api/v1/", http.StripPrefix("/api/v1", handler.AuthRouter(db)))

	server := http.Server{
		Addr: fmt.Sprintf(":%s", Port),
		Handler: middleware.Logger(v1Router),
	}

	log.Printf("Listening on port %s", Port)
	log.Fatal(server.ListenAndServe())
}