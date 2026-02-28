package users

import (
	"context"

	"github.com/Puriice/pAuthentication/internal/types"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserModel struct {
	db *pgxpool.Pool
}

func NewModel(db *pgxpool.Pool) *UserModel {
	return &UserModel{
		db: db,
	}
}

func (m *UserModel) CreateUser(context context.Context, user types.User) error {
	languageTag := user.Language

	if languageTag == nil {
		defaultLanguageTag := DEFAULT_LANGUAGE_TAG
		languageTag = &defaultLanguageTag
	}

	q := `INSERT INTO user_informations` +
		`(id, language_tag, firstname,` +
		` middle, lastname, nickname, profile,` +
		` picture, website, gender, birthday,` +
		` zoneinfo, locale) VALUES` +
		` ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,` +
		` $11, $12, $13)`

	cmdTag, err := m.db.Exec(
		context,
		q,
		user.Identifier,
		languageTag,
		user.Firstname,
		user.Middlename,
		user.Lastname,
		user.Nickname,
		user.Profile,
		user.Picture,
		user.Website,
		user.Gender,
		user.Birthday,
		user.Zoneinfo,
		user.Locale,
	)

	if err != nil {
		return err
	}

	if cmdTag.RowsAffected() != 1 {
		return types.ErrNoRowsAffected
	}

	return nil
}

func (m *UserModel) QueryIDFromUsername(context context.Context, username *string) (string, error) {
	var id string

	err := m.db.QueryRow(context, "SELECT id FROM users WHERE username = $1;", *username).Scan(&id)

	if err != nil {
		return "", err
	}

	return id, nil
}

func (m *UserModel) DeleteAccount(context context.Context, id string) error {
	tx, err := m.db.Begin(context)

	if err != nil {
		return err
	}

	cmdTag, err := tx.Exec(
		context,
		"DELETE FROM user_informations WHERE id = $1",
		id,
	)

	if err != nil {
		return err
	}

	cmdTag, err = tx.Exec(context, "DELETE FROM users WHERE id = $1", id)

	if err != nil {
		tx.Rollback(context)
		return err
	}

	if cmdTag.RowsAffected() == 0 {
		tx.Rollback(context)
		return pgx.ErrNoRows
	}

	tx.Commit(context)

	return nil
}

func (m *UserModel) RemoveUserLanguage(context context.Context, id string, tag string) error {
	cmdTag, err := m.db.Exec(
		context,
		"DELETE FROM user_informations WHERE id = $1 AND language_tag = $2",
		id,
		tag)

	if err != nil {
		return err
	}

	if cmdTag.RowsAffected() == 0 {
		return types.ErrNoRowsAffected
	}

	return nil
}
