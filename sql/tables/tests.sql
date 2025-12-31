CREATE TABLE tests (
    -- Identifiers
    id                  SERIAL PRIMARY KEY,

    -- Numeric
    col_smallint        SMALLINT,
    col_integer         INTEGER,
    col_bigint          BIGINT,
    col_numeric         NUMERIC(10, 2),
    col_real            REAL,
    col_double          DOUBLE PRECISION,

    -- Character
    col_char            CHAR(10),
    col_varchar         VARCHAR(255),
    col_text            TEXT,

    -- Boolean
    col_boolean         BOOLEAN,

    -- Date / Time
    col_date            DATE,
    col_time            TIME,
    col_timestamp       TIMESTAMP,
    col_timestamp_tz    TIMESTAMP WITH TIME ZONE,
    col_interval        INTERVAL,

    -- UUID
    col_uuid            UUID,

    -- JSON
    col_json            JSONB,

    -- Binary
    col_bytea           BYTEA,

    -- Arrays
    col_int_array       INTEGER[],
    col_text_array      TEXT[],

    -- Audit / metadata
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
