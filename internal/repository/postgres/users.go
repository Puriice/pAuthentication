package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/Puriice/pAuthentication/internal/constant"
	"github.com/Puriice/pAuthentication/internal/types"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/puriice/httplibs/pkg/pgutils"
)

type UserRepo struct {
	db *pgxpool.Pool
}

func NewRepository(db *pgxpool.Pool) *UserRepo {
	return &UserRepo{
		db: db,
	}
}

func (m *UserRepo) QueryIDFromUsername(context context.Context, username *string) (string, error) {
	var id string

	err := m.db.QueryRow(context, "SELECT id FROM users WHERE username = $1;", *username).Scan(&id)

	if err != nil {
		return "", err
	}

	return id, nil
}

func (r *UserRepo) QueryUser(context context.Context, id string, username string, tag string) (*[]types.User, error) {
	users := make([]types.User, 0)

	var q strings.Builder
	argv := make([]any, 0, 2)

	argv = append(argv, id)

	q.WriteString("SELECT language_tag, firstname, middle, lastname, nickname, profile, picture, website, gender, birthday, zoneinfo, locale FROM user_informations WHERE id = $1")

	if tag != "" {
		q.WriteString(" AND language_tag = $2")
		argv = append(argv, tag)
	}

	rows, err := r.db.Query(
		context,
		q.String(),
		argv...,
	)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		user := types.User{
			Identifier: &id,
			Username:   &username,
		}

		err = rows.Scan(
			&user.Language,
			&user.Firstname,
			&user.Middlename,
			&user.Lastname,
			&user.Nickname,
			&user.Profile,
			&user.Picture,
			&user.Website,
			&user.Gender,
			&user.Birthday,
			&user.Zoneinfo,
			&user.Locale,
		)

		if err != nil {
			return nil, err
		}

		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return &users, nil
}

func (m *UserRepo) CreateUser(context context.Context, user types.User) error {
	languageTag := user.Language

	if languageTag == nil {
		defaultLanguageTag := constant.DEFAULT_LANGUAGE_TAG
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

func (r *UserRepo) UpdateUserInformation(context context.Context, id string, tag string, payload types.User) error {
	payload.Identifier = nil
	payload.Language = nil

	setQuery, argv, err := pgutils.CreateSetStatement(payload, 1)

	if err != nil {
		return err
	}

	argn := len(argv) + 1

	q := fmt.Sprintf(
		"UPDATE user_informations SET %s WHERE id = $%d AND language_tag = $%d;",
		setQuery,
		argn,
		argn+1,
	)

	argv = append(argv, id, tag)

	cmdTag, err := r.db.Exec(
		context,
		q,
		argv...,
	)

	if err != nil {
		return err
	}

	if cmdTag.RowsAffected() == 0 {
		return types.ErrNoRowsAffected
	}

	return nil
}

func (m *UserRepo) DeleteAccount(context context.Context, id string) error {
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

func (m *UserRepo) RemoveUserLanguage(context context.Context, id string, tag string) error {
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
