package pg

import (
	"errors"
	"log"
	"net/http"

	"github.com/Puriice/pAuthentication/internal/types"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

func CheckError(err error, w http.ResponseWriter) error {
	if err == nil {
		return nil
	}

	var pgErr *pgconn.PgError
	var status int

	switch {
	case errors.Is(err, types.ErrNoRowsAffected):
		status = http.StatusNotFound
	case errors.Is(err, pgx.ErrNoRows):
		status = http.StatusNotFound
	case errors.Is(err, pgx.ErrTooManyRows):
		status = http.StatusInternalServerError
	case errors.As(err, &pgErr):
		switch pgErr.Code {
		case "23502":
			status = http.StatusConflict
			err = types.ErrNotNullViolation
		case "23503":
			status = http.StatusConflict
			err = types.ErrForeignKeyViolation
		case "23505":
			status = http.StatusConflict
			err = types.ErrUniqueViolation
		default:
			log.Println(err)
			status = http.StatusInternalServerError
		}
	default:
		log.Println(err)
		status = http.StatusInternalServerError
	}

	if w != nil {
		w.WriteHeader(status)
	}

	return err
}
