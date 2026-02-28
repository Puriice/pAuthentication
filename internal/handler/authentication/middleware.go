package authentication

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"slices"

	"github.com/Puriice/pAuthentication/internal/cookies/session"
	"github.com/Puriice/pAuthentication/internal/token"
	"github.com/Puriice/pAuthentication/internal/types"
)

func parseBody(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		contentType := r.Header.Get("Content-Type")
		var user types.UserCredential

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
			user = types.UserCredential{
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
		user, ok := r.Context().Value("user").(types.UserCredential)

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
