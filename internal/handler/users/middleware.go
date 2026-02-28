package users

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/Puriice/pAuthentication/internal/pg"
	"github.com/Puriice/pAuthentication/internal/types"
)

func parseUserBody(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		contentType := r.Header.Get("Content-Type")

		if !strings.HasPrefix(contentType, "application/json") {
			next.ServeHTTP(w, r)
			return
		}

		var userInfo types.User

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

func (h *Handler) queryID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userInfo, ok := r.Context().Value("user").(types.User)

		username := userInfo.Username

		if !ok {
			_username := r.PathValue("username")
			username = &_username
		}

		if username == nil || *username == "" {
			w.WriteHeader(http.StatusBadRequest)
			return
		}

		id, err := h.repo.QueryIDFromUsername(r.Context(), username)

		err = pg.CheckError(err, w)

		if err != nil {
			return
		}

		userInfo.Identifier = &id

		ctx := context.WithValue(r.Context(), "user", userInfo)
		ctx = context.WithValue(ctx, "id", id)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
