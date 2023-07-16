\echo 'Delete and recreate biblio db?'
\prompt 'Return for yes or Control-C to cancel > ' foo

DROP DATABASE biblio;
CREATE DATABASE biblio;
\connect biblio

\i biblio-schema.sql
-- \i biblio-seed.sql

\echo 'Delete and recreate biblio_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE biblio_test;
CREATE DATABASE biblio_test;
\connect biblio_test

\i biblio-schema.sql