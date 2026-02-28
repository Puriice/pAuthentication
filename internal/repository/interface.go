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
	QueryIDFromUsername(context context.Context, username *string) (string, error)
	QueryUser(context context.Context, id string, username string, tag string) (*[]types.User, error)
	CreateUser(context context.Context, user types.User) error
	UpdateUserInformation(context context.Context, id string, tag string, payload types.User) error
	RemoveUserLanguage(context context.Context, id string, tag string) error
	DeleteAccount(context context.Context, id string) error
}
