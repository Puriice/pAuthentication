package postgres

import (
	"context"

	"github.com/Puriice/pAuthentication/internal/types"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AuthRepo struct {
	db *pgxpool.Pool
}

func NewAuthRepository(db *pgxpool.Pool) *AuthRepo {
	return &AuthRepo{
		db: db,
	}
}

func (m *AuthRepo) QueryPassword(context context.Context, username string) (string, error) {
	var hashedPassword string

	err := m.db.QueryRow(context, "SELECT password FROM users WHERE username = $1", username).Scan(&hashedPassword)

	if err != nil {
		return "", err
	}

	return hashedPassword, nil
}

func (m *AuthRepo) RegisterUser(context context.Context, credential types.UserCredential) error {
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
