package types

import (
	"context"
)

type AuthenticationModel interface {
	QueryPassword(context context.Context, username string) (string, error)
	RegisterUser(context context.Context, credential UserCredential) error
}

type UserModel interface {
	CreateUser(context context.Context, user User) error
	QueryIDFromUsername(context context.Context, username *string) (string, error)
	RemoveUserLanguage(context context.Context, id string, tag string) error
	DeleteAccount(context context.Context, id string) error
}
