package session

import (
	"encoding/json"
	"errors"
	"net/http"
	"slices"

	"github.com/Puriice/pAuthentication/internal/token"
)

func AddActiveAccount(username string, w http.ResponseWriter, r *http.Request) error {
	sessionCookie, err := r.Cookie("session_token")

	if err != nil {
		expiration := getExpirationDate()

		subject := ""

		sessionToken, err := getSessionToken(&subject, []string{}, &expiration)

		if err != nil {
			return err
		}

		sessionCookie = &http.Cookie{
			Name:     "session_token",
			Value:    sessionToken.String(),
			Path:     "/",
			Expires:  expiration,
			SameSite: http.SameSiteLaxMode,
			HttpOnly: true,
		}
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

	if slices.Contains(claims.Audience, username) {
		return nil
	}

	claims.Audience = append(claims.Audience, username)
	expiration := getExpirationDate()

	newToken, err := getSessionToken(&username, claims.Audience, &expiration)

	if err != nil {
		return err
	}

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
