package server

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/Puriice/pAuthentication/internal/handler/authentication"
	"github.com/Puriice/pAuthentication/internal/handler/users"
	"github.com/Puriice/pAuthentication/internal/repository/postgres"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/puriice/httplibs/pkg/middleware"
)

type Server struct {
	Host string
	Port string
	db   *pgxpool.Pool
}

func NewServer(host string, port string, db *pgxpool.Pool) *Server {
	return &Server{
		Host: host,
		Port: port,
		db:   db,
	}
}

func (s *Server) Start() {
	address := fmt.Sprintf("%s:%s", s.Host, s.Port)

	router := http.NewServeMux()
	v1Router := http.NewServeMux()

	authModel := postgres.NewAuthRepository(s.db)
	authHandler := authentication.NewHandler(authModel)
	authHandler.RegisterRouter(v1Router)

	userModel := postgres.NewRepository(s.db)
	userHandler := users.NewHandler(userModel)
	userHandler.RegisterRoute(v1Router)

	router.Handle("/api/v1/", http.StripPrefix("/api/v1", v1Router))

	server := http.Server{
		Addr:    address,
		Handler: middleware.Logger(router),
	}

	go server.ListenAndServe()
	log.Printf("Server listening at %s", server.Addr)

	quit := make(chan os.Signal, 1)

	signal.Notify(quit, os.Interrupt, syscall.SIGTERM)

	<-quit

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	server.Shutdown(ctx)
}
