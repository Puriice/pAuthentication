package session

import (
	"time"

	"github.com/Puriice/pAuthentication/internal/token"
	"github.com/cristalhq/jwt/v5"
)

type SessionClaims struct {
	jwt.RegisteredClaims
}

func getExpirationDate() time.Time {
	return time.Now().AddDate(0, 0, 1)
}

func getSessionToken(subject *string, audience []string, expiration *time.Time) (*jwt.Token, error) {
	claims := &SessionClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Audience:  audience,
			ExpiresAt: jwt.NewNumericDate(*expiration),
			Subject:   *subject,
		},
	}

	token, err := token.Encode(claims)

	return token, err
}
