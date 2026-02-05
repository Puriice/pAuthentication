package authentication

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

type userLogin struct {
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

func getSessionToken(audience []string, expiration *time.Time) (*jwt.Token, error) {
	claims := &jwt.RegisteredClaims {
		Audience: audience,
		ExpiresAt: jwt.NewNumericDate(*expiration),
	}

	token, err := token.Encode(claims)

	return token, err
}

func setSessionCookie(w http.ResponseWriter, username string) {
	expiration := time.Now().Add(24 * time.Hour)

	token, err := getSessionToken([]string { username }, &expiration)

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

func (s *Server) loginHandler(w http.ResponseWriter, r *http.Request) {
	contentType := r.Header.Get("Content-Type")
	var user userLogin

	switch contentType {
		case "application/json":
			json.NewDecoder(r.Body).Decode(&user)
		case "application/x-www-form-urlencoded":
			r.ParseForm()
			user = userLogin{
				username: r.PostFormValue("username"),
				password: r.PostFormValue("password"),
			}	
	}

	if user.username == "" || user.password == "" {
		w.WriteHeader(http.StatusUnprocessableEntity)
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

	setSessionCookie(w, user.username)
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

	setSessionCookie(w, user.username)
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