package auth

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	token "github.com/Puriice/pAuthentication/internal/jwt"
	"github.com/Puriice/pAuthentication/pkg/password"
	"github.com/cristalhq/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Server struct {
	DB *pgxpool.Pool
}

type user struct {
	username string
	password string
}

type userRegistry struct {
	username string
	password string
	firstname string
	lastname string
	birthday string 
}

func (s *Server) loginHandler(w http.ResponseWriter, r *http.Request) {
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
				birthday: r.PostFormValue("birthday"),
			}	
	}

	if user.username == "" || user.password == "" || user.firstname == "" || user.lastname == "" {
		w.WriteHeader(http.StatusUnprocessableEntity)
		return
	}

	password, err := password.HashPassword(user.password)

	if err != nil {
		log.Println("Error hashing password.", err)
		w.WriteHeader(http.StatusInternalServerError)
		return;
	}

	var birthday *time.Time


	if user.birthday != "" {
		t, err := time.Parse(time.RFC3339, user.birthday)

		if err == nil {
			birthday = &t
		}
	} else {
		birthday = nil
	}

	cmdTag, err := s.DB.Exec(
		r.Context(), 
		"INSERT INTO users (username, password, firstname, lastname, birthday) VALUES ($1, $2, $3, $4, $5)",
		user.username,
		password,
		user.firstname,
		user.lastname,
		birthday,
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

	expiration := time.Now().Add(24 * time.Hour)

	claims := &jwt.RegisteredClaims {
		Audience: []string {user.username},
		ExpiresAt: jwt.NewNumericDate(expiration),
	}

	token, err := token.Encode(claims)

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

func Router(DB *pgxpool.Pool) (*http.ServeMux) {
	router := http.NewServeMux()

	server := &Server{
		DB: DB,
	}
	
	router.HandleFunc("POST /auth/login", server.loginHandler)
	router.HandleFunc("POST /auth/register", server.registerHandler)

	return router
}