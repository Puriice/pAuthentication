package handler

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/Puriice/pAuthentication/internal/middleware"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const DEFAULT_LANGUAGE_TAG = "en"

type user struct {
	Identifier *string `json:"id"`
	Language   *string `json:"language"`
	Username   *string `json:"username"`
	Firstname  *string `json:"firstname"`
	Middlename *string `json:"middlename"`
	Lastname   *string `json:"lastname"`
	Nickname   *string `json:"nickname"`
	Profile    *string `json:"profile"`
	Picture    *string `json:"picture"`
	Website    *string `json:"website"`
	Gender     *string `json:"gender"`
	Birthday   *string `json:"birthday"`
	Zoneinfo   *string `json:"zoneinfo"`
	Locale     *string `json:"locale"`
}

func parseUserBody(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		contentType := r.Header.Get("Content-Type")

		if !strings.HasPrefix(contentType, "application/json") {
			next.ServeHTTP(w, r)
			return
		}

		var userInfo user

		err := json.NewDecoder(r.Body).Decode(&userInfo)

		if err != nil {
			log.Println(err)
			log.Println(r.ContentLength)
			if err == io.EOF {
				http.Error(w, "Body Required", http.StatusBadRequest)
			} else {
				http.Error(w, "Invalid Body", http.StatusUnprocessableEntity)
			}
			return
		}

		ctx := context.WithValue(r.Context(), "user", userInfo)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (s *Server) queryID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userInfo, ok := r.Context().Value("user").(user)

		var id string

		username := userInfo.Username

		if !ok {
			_username := r.PathValue("username")
			username = &_username
		}

		if username == nil || *username == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		err := s.DB.QueryRow(r.Context(), "SELECT id FROM users WHERE username = $1;", *username).Scan(&id)

		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				http.Error(w, "ID not found", http.StatusNotFound)
				return
			}
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		userInfo.Identifier = &id

		ctx := context.WithValue(r.Context(), "user", userInfo)
		ctx = context.WithValue(ctx, "id", id)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func isEmpty(fields ...*string) bool {
	for _, f := range fields {
		if f == nil || *f == "" {
			return true
		}
	}

	return false
}

func (s *Server) createUser(w http.ResponseWriter, r *http.Request) {
	userInfo, ok := r.Context().Value("user").(user)

	if !ok {
		log.Println("User or id not found in context")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if isEmpty(userInfo.Username, userInfo.Firstname) {
		http.Error(w, "Invalid Body", http.StatusUnprocessableEntity)
		return
	}

	languageTag := userInfo.Language

	if languageTag == nil {
		defaultLanguageTag := DEFAULT_LANGUAGE_TAG
		languageTag = &defaultLanguageTag
	}

	q := `INSERT INTO user_informations` +
		`(id, language_tag, firstname,` +
		` middle, lastname, nickname, profile,` +
		` picture, website, gender, birthday,` +
		` zoneinfo, locale) VALUES` +
		` ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,` +
		` $11, $12, $13)`

	cmdTag, err := s.DB.Exec(
		r.Context(),
		q,
		userInfo.Identifier,
		languageTag,
		userInfo.Firstname,
		userInfo.Middlename,
		userInfo.Lastname,
		userInfo.Nickname,
		userInfo.Profile,
		userInfo.Picture,
		userInfo.Website,
		userInfo.Gender,
		userInfo.Birthday,
		userInfo.Zoneinfo,
		userInfo.Locale,
	)

	if err != nil {
		log.Printf("Failed to create user: %s, with language tag: %s.\n", *userInfo.Username, *languageTag)
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if cmdTag.RowsAffected() != 1 {
		log.Println("Insert failted")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (s *Server) patchUser(w http.ResponseWriter, r *http.Request) {
	// userInfo, ok := r.Context().Value("user").(user)
	// userId := r.PathValue("id")
	// languageTag := r.PathValue("language")

	// if !ok {
	// 	log.Println("User or id not found in context")
	// 	w.WriteHeader(http.StatusInternalServerError)
	// 	return
	// }

}

func (s *Server) deleteAccount(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value("id").(string)

	if !ok {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	tx, err := s.DB.Begin(r.Context())

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	cmdTag, err := tx.Exec(
		r.Context(),
		"DELETE FROM user_informations WHERE id = $1",
		userId,
	)

	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if cmdTag.RowsAffected() == 0 {
		http.Error(w, "User not found.", http.StatusNotFound)
		return
	}

	cmdTag, err = tx.Exec(r.Context(), "DELETE FROM users WHERE id = $1", userId)

	if err != nil {
		log.Println(err)
		tx.Rollback(r.Context())
		w.WriteHeader(http.StatusInternalServerError)
	}

	if cmdTag.RowsAffected() == 0 {
		tx.Rollback(r.Context())
		http.Error(w, "User not found.", http.StatusNotFound)
		return
	}

	tx.Commit(r.Context())
	w.WriteHeader(http.StatusNoContent)
}

func (s *Server) deleteUserWithLanguage(w http.ResponseWriter, r *http.Request) {
	userId, ok := r.Context().Value("id").(string)
	languageTag := r.PathValue("language")

	if !ok {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	cmdTag, err := s.DB.Exec(
		r.Context(),
		"DELETE FROM user_informations WHERE id = $1 AND language_tag = $2",
		userId,
		languageTag)

	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	if cmdTag.RowsAffected() == 0 {
		http.Error(w, "User not found.", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func UserRouter(router *http.ServeMux, DB *pgxpool.Pool) {
	server := &Server{DB: DB}

	userRouter := http.NewServeMux()

	pipeLine := middleware.Pipe(
		parseUserBody,
		server.queryID,
	)

	userRouter.HandleFunc("PATCH /{username}/{language}", server.patchUser)
	userRouter.HandleFunc("DELETE /{username}", server.deleteAccount)
	userRouter.HandleFunc("DELETE /{username}/{language}", server.deleteUserWithLanguage)

	router.Handle("POST /users", pipeLine(http.HandlerFunc(server.createUser)))
	router.Handle("/users/{username}/",
		http.StripPrefix("/users", pipeLine(userRouter)),
	)
}
