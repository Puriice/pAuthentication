package authentication

import (
	"context"

	"github.com/Puriice/pAuthentication/internal/types"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AuthModel struct {
	db *pgxpool.Pool
}

func NewModel(db *pgxpool.Pool) *AuthModel {
	return &AuthModel{
		db: db,
	}
}

func (m *AuthModel) QueryPassword(context context.Context, username string) (string, error) {
	var hashedPassword string

	err := m.db.QueryRow(context, "SELECT password FROM users WHERE username = $1", username).Scan(&hashedPassword)

	if err != nil {
		return "", err
	}

	return hashedPassword, nil
}

func (m *AuthModel) RegisterUser(context context.Context, credential types.UserCredential) error {
	cmdTag, err := m.db.Exec(
		context,
		"INSERT INTO users (username, password) VALUES ($1, $2)",
		credential.Username,
		credential.Password,
	)

	if err != nil {
		return err
	}

	if cmdTag.RowsAffected() != 1 {
		return types.ErrNoRowsAffected
	}

	return nil
}
