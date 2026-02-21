package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"slices"

	"github.com/Puriice/pAuthentication/internal/cookies/session"
	"github.com/Puriice/pAuthentication/internal/middleware"
	"github.com/Puriice/pAuthentication/internal/token"
	"github.com/Puriice/pAuthentication/pkg/password"
	"github.com/jackc/pgx/v5/pgxpool"
)

type userCredential struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func parseBody(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		contentType := r.Header.Get("Content-Type")
		var user userCredential

		switch contentType {
		case "application/json":
			err := json.NewDecoder(r.Body).Decode(&user)

			if err != nil {
				log.Println(err)
				http.Error(w, "Invalid Body", http.StatusUnprocessableEntity)
				return
			}
		case "application/x-www-form-urlencoded":
			r.ParseForm()
			user = userCredential{
				Username: r.PostFormValue("username"),
				Password: r.PostFormValue("password"),
			}
		}

		if user.Username == "" || user.Password == "" {
			w.WriteHeader(http.StatusUnprocessableEntity)
			return
		}

		ctx := context.WithValue(r.Context(), "user", user)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func deReAuthenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		user, ok := r.Context().Value("user").(userCredential)

		if !ok {
			log.Println("User not found in context")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		cookie, err := r.Cookie("session_token")
		ctx := r.Context()

		if err == nil {
			token, err := token.Decode(cookie.Value, nil)

			if err != nil {
				log.Println("Error decoding token", err)
			}

			var claims session.SessionClaims

			err = json.Unmarshal(token.Claims(), &claims)

			log.Println(claims)
			log.Println(user)

			if err != nil {
				log.Println("Error decoding claims", err)
			} else if slices.Contains(claims.Audience, user.Username) {
				log.Println("Already authenticated")
				w.WriteHeader(http.StatusOK)
				return
			}

			if err == nil {
				ctx = context.WithValue(r.Context(), "token", claims)
			}
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (s *Server) loginHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(userCredential)

	if !ok {
		log.Println("User not found in context")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	row := s.DB.QueryRow(r.Context(), "SELECT password FROM users WHERE username = $1", user.Username)

	var hashedPassword string

	err := row.Scan(&hashedPassword)

	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	valid := password.ComparePassword(hashedPassword, user.Password)

	if !valid {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	session.AddActiveAccount(user.Username, w, r)
}

func (s *Server) registerHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(userCredential)

	if !ok {
		log.Println("User not found in context")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	password, err := password.HashPassword(user.Password)

	if err != nil {
		log.Println("Error hashing password.", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	cmdTag, err := s.DB.Exec(
		r.Context(),
		"INSERT INTO users (username, password) VALUES ($1, $2)",
		user.Username,
		password,
	)

	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if cmdTag.RowsAffected() != 1 {
		log.Println("Insert failted")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	session.AddActiveAccount(user.Username, w, r)
}

func AuthRouter(router *http.ServeMux, DB *pgxpool.Pool) {
	server := &Server{
		DB: DB,
	}

	authRouter := http.NewServeMux()

	authRouter.HandleFunc("POST /login", server.loginHandler)
	authRouter.HandleFunc("POST /register", server.registerHandler)

	router.Handle("/auths/", http.StripPrefix("/auths", middleware.Pipe(
		parseBody,
		deReAuthenticate,
	)(authRouter)))
}
