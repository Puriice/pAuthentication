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
			w.WriteHeader(http.StatusUnsupportedMediaType)
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

		if !ok {
			log.Println("User not found in context")
			w.WriteHeader(http.StatusInternalServerError)
			return
		}

		var id string

		err := s.DB.QueryRow(r.Context(), "SELECT id FROM user_credentials WHERE username = $1;", *userInfo.Username).Scan(&id)

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

		next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), "user", userInfo)))
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

	q := `INSERT INTO users` +
		`(id, language_tag, username, firstname,` +
		` middle, lastname, nickname, profile,` +
		` picture, website, gender, birthday,` +
		` zoneinfo, locale) VALUES` +
		` ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,` +
		` $11, $12, $13, $14)`

	cmdTag, err := s.DB.Exec(
		r.Context(),
		q,
		userInfo.Identifier,
		languageTag,
		userInfo.Username,
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

func UserRouter(router *http.ServeMux, DB *pgxpool.Pool) {
	server := &Server{DB: DB}

	userRouter := http.NewServeMux()
	userRouter.HandleFunc("POST /users", server.createUser)

	pipeLine := middleware.Pipe(
		parseUserBody,
		server.queryID,
	)

	router.Handle("/users",
		pipeLine(userRouter),
	)
}
