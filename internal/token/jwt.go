package token

import (
	"errors"
	"os"

	"github.com/cristalhq/jwt/v5"
)

var signer *jwt.HSAlg
var builder *jwt.Builder
var verifier *jwt.HSAlg

func getSecret() (string, error) {
	secret := os.Getenv("JWT_SECRET")

	if secret == "" {
		return "", errors.New("Secret is invalid")
	}

	return secret, nil
}

func GetSigner() (*jwt.HSAlg, error) {
	if signer != nil {
		return signer, nil
	}

	secret, err := getSecret()

	if err != nil {
		return nil, err
	}

	_signer, err := jwt.NewSignerHS(jwt.HS256, []byte(secret))

	if err != nil {
		return nil, err
	}

	signer = _signer

	return signer, err
}

func GetBuilder() (*jwt.Builder, error) {
	if builder != nil {
		return builder, nil
	}

	signer, err := GetSigner()

	if err != nil {
		return nil, err
	}

	_builder := jwt.NewBuilder(signer)

	builder = _builder

	return _builder, nil
}

func GetVerifier() (*jwt.HSAlg, error) {
	if verifier != nil {
		return verifier, nil
	}

	secret, err := getSecret()

	if err != nil {
		return nil, err
	}

	_verifier, err := jwt.NewVerifierHS(jwt.HS256, []byte(secret))

	if err != nil {
		return nil, err
	}

	verifier = _verifier

	return verifier, err
}

func Encode(claims any) (*jwt.Token, error) {
	builder, err := GetBuilder()

	if err != nil {
		return nil, err
	}

	token, err := builder.Build(claims)

	if err != nil {
		return nil, err
	}

	return token, nil
}

func Decode(token string, claims any) (*jwt.Token, error) {
	verifier, err := GetVerifier()

	if err != nil {
		return nil, err
	}

	rawToken := []byte(token)

	var parsedToken *jwt.Token

	if claims != nil {
		err = jwt.ParseClaims(rawToken, verifier, claims)
	} else {
		parsedToken, err = jwt.Parse(rawToken, verifier)
	}

	return parsedToken, err
}
