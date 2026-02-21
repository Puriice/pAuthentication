package handler

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"slices"
	"time"

	token "github.com/Puriice/pAuthentication/internal/jwt"
	"github.com/Puriice/pAuthentication/internal/middleware"
	"github.com/Puriice/pAuthentication/pkg/password"
	"github.com/cristalhq/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type userCredential struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func getSessionToken(audience []string, expiration *time.Time) (*jwt.Token, error) {
	claims := &jwt.RegisteredClaims{
		Audience:  audience,
		ExpiresAt: jwt.NewNumericDate(*expiration),
	}

	token, err := token.Encode(claims)

	return token, err
}

func getAndAppendAudiences(r *http.Request, user *userCredential) []string {
	claims, ok := r.Context().Value("token").(jwt.RegisteredClaims)
	var audience []string

	if !ok {
		audience = []string{user.Username}
	} else {
		audience = claims.Audience
		audience = append(audience, user.Username)
	}

	return audience
}

func setSessionCookie(w http.ResponseWriter, usernames []string) {
	expiration := time.Now().Add(24 * time.Hour)

	token, err := getSessionToken(usernames, &expiration)

	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	cookie := &http.Cookie{
		Name:     "session_token",
		Value:    token.String(),
		Path:     "/",
		Expires:  expiration,
		SameSite: http.SameSiteLaxMode,
		HttpOnly: true,
	}

	http.SetCookie(w, cookie)
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

			var claims jwt.RegisteredClaims

			err = json.Unmarshal(token.Claims(), &claims)

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

	setSessionCookie(w, getAndAppendAudiences(r, &user))
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

	setSessionCookie(w, getAndAppendAudiences(r, &user))
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
