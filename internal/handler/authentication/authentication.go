package authentication

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"slices"
	"time"

	token "github.com/Puriice/pAuthentication/internal/jwt"
	"github.com/Puriice/pAuthentication/pkg/password"
	"github.com/cristalhq/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	DB *pgxpool.Pool
}

type User struct {
	username string
	password string
}

type userRegistry struct {
	username string
	password string
	firstname string
	lastname string
}

type TokenClaim struct {
	aud string
}

func getSessionToken(audience []string, expiration *time.Time) (*jwt.Token, error) {
	claims := &jwt.RegisteredClaims {
		Audience: audience,
		ExpiresAt: jwt.NewNumericDate(*expiration),
	}

	token, err := token.Encode(claims)

	return token, err
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
		Name: "session_token",
		Value: token.String(),
		Path: "/",
		Expires: expiration,
		SameSite: http.SameSiteLaxMode,
		HttpOnly: true,
	}

	http.SetCookie(w, cookie)
}

func DeReAuthenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func (w http.ResponseWriter, r *http.Request) {
		contentType := r.Header.Get("Content-Type")
		var user User

		switch contentType {
			case "application/json":
				json.NewDecoder(r.Body).Decode(&user)
			case "application/x-www-form-urlencoded":
				r.ParseForm()
				user = User{
					username: r.PostFormValue("username"),
					password: r.PostFormValue("password"),
				}	
		}

		if user.username == "" || user.password == "" {
			w.WriteHeader(http.StatusUnprocessableEntity)
			return
		}

		ctx := context.WithValue(r.Context(), "user", user)

		cookie, err := r.Cookie("session_token")

		if err == nil {
			token, err := token.Decode(cookie.Value, nil)

			if err != nil {
				log.Println("Error decoding token", err)
			}

			var claims jwt.RegisteredClaims

			err = json.Unmarshal(token.Claims(), &claims)

			if err != nil {
				log.Println("Error decoding claims", err)
			} else if slices.Contains(claims.Audience, user.username) {
				log.Println("Already authenticated")
				w.WriteHeader(http.StatusOK)
				return
			}

			if err == nil {
				ctx = context.WithValue(ctx, "token", claims)
			}
		}
		
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (s *Server) loginHandler(w http.ResponseWriter, r *http.Request) {
	user, ok := r.Context().Value("user").(User)

	if !ok {
		log.Println("User not found in context")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	row := s.DB.QueryRow(r.Context(), "SELECT password FROM users WHERE username = $1", user.username)

	var hashedPassword string

	err := row.Scan(&hashedPassword)

	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}


	valid := password.ComparePassword(hashedPassword, user.password)

	if !valid {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}

	claims, ok := r.Context().Value("token").(jwt.RegisteredClaims)
	var audience []string

	if !ok {
		audience = []string { user.username }
	} else {
		audience = claims.Audience
		audience = append(audience, user.username)
	}

	setSessionCookie(w, audience)
}

func (s *Server) registerHandler(w http.ResponseWriter, r *http.Request) {
	contentType := r.Header.Get("Content-Type")
	var user userRegistry

	switch contentType {
		case "application/json":
			json.NewDecoder(r.Body).Decode(&user)
		case "application/x-www-form-urlencoded":
			r.ParseForm()
			user = userRegistry{
				username: r.PostFormValue("username"),
				password: r.PostFormValue("password"),
				firstname: r.PostFormValue("firstname"),
				lastname: r.PostFormValue("lastname"),
			}	
	}

	if user.username == "" || user.password == "" || user.firstname == "" {
		w.WriteHeader(http.StatusUnprocessableEntity)
		return
	}

	password, err := password.HashPassword(user.password)

	if err != nil {
		log.Println("Error hashing password.", err)
		w.WriteHeader(http.StatusInternalServerError)
		return;
	}

	cmdTag, err := s.DB.Exec(
		r.Context(), 
		"INSERT INTO users (username, password, firstname, lastname) VALUES ($1, $2, $3, $4)",
		user.username,
		password,
		user.firstname,
		user.lastname,
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

	claims, ok := r.Context().Value("token").(jwt.RegisteredClaims)
	var audience []string

	if !ok {
		audience = []string { user.username }
	} else {
		audience = claims.Audience
		audience = append(audience, user.username)
	}

	setSessionCookie(w, audience)
}

func Router(DB *pgxpool.Pool) (http.Handler) {
	router := http.NewServeMux()

	server := &Server{
		DB: DB,
	}
	
	router.HandleFunc("POST /auth/login", server.loginHandler)
	router.HandleFunc("POST /auth/register", server.registerHandler)

	return DeReAuthenticate(router)
}