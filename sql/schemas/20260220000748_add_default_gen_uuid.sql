-- +goose Up
-- +goose StatementBegin
SELECT 'up SQL query';
ALTER TABLE users
ALTER COLUMN id SET DEFAULT gen_random_uuid();
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
SELECT 'down SQL query';
ALTER COLUMN id DROP DEFAULT;
-- +goose StatementEnd
