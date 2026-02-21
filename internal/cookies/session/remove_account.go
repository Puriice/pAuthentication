package session

import (
	"encoding/json"
	"errors"
	"net/http"
	"slices"

	"github.com/Puriice/pAuthentication/internal/token"
)

func RemoveActiveAccount(username *string, w http.ResponseWriter, r *http.Request) error {
	sessionCookie, err := r.Cookie("session_token")

	if err != nil {
		return err
	}

	sessionToken, err := token.Decode(sessionCookie.Value, nil)

	if err != nil {
		return err
	}

	var claims SessionClaims

	err = json.Unmarshal(sessionToken.Claims(), &claims)

	if err != nil {
		return errors.New("Invalid session token.")
	}

	if username == nil {
		username = &claims.Subject
	}

	if !slices.Contains(claims.Audience, *username) {
		return errors.New("User not found in session")
	}

	claims.Audience = slices.DeleteFunc(claims.Audience, func(e string) bool {
		return e == *username
	})

	if len(claims.Audience) == 0 {
		http.SetCookie(w, &http.Cookie{
			Name:   "session_cookie",
			MaxAge: -1,
		})

		return nil
	}

	expiration := getExpirationDate()

	subject := claims.Subject

	if subject == *username {
		subject = claims.Audience[0]
	}

	newToken, err := getSessionToken(&subject, claims.Audience, &expiration)

	sessionCookie = &http.Cookie{
		Name:     "session_token",
		Value:    newToken.String(),
		Path:     "/",
		Expires:  expiration,
		SameSite: http.SameSiteLaxMode,
		HttpOnly: true,
	}

	http.SetCookie(w, sessionCookie)

	return nil
}
