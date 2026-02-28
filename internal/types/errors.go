package types

import "errors"

var (
	ErrNoRowsAffected      = errors.New("No rows affected")
	ErrForeignKeyViolation = errors.New("Foreign Key Violation")
	ErrUniqueViolation     = errors.New("Unique Key Violation")
	ErrNotNullViolation    = errors.New("Not Null Violation")
)
