package repository

import (
	"context"

	"github.com/Puriice/pAuthentication/internal/types"
)

type AuthenticationRepository interface {
	QueryPassword(context context.Context, username string) (string, error)
	RegisterUser(context context.Context, credential types.UserCredential) error
}

type UserRepository interface {
	CreateUser(context context.Context, user types.User) error
	QueryIDFromUsername(context context.Context, username *string) (string, error)
	RemoveUserLanguage(context context.Context, id string, tag string) error
	DeleteAccount(context context.Context, id string) error
}
