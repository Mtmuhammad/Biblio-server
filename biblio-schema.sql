CREATE TABLE users (
   id SERIAL PRIMARY KEY,
   email TEXT NOT NULL UNIQUE CHECK (position('@' IN email) > 1),
   first_name TEXT NOT NULL,
   last_name TEXT NOT NULL,
   password TEXT NOT NULL,
   token TEXT NULL,
   is_admin BOOLEAN DEFAULT FALSE
);
CREATE TABLE collections (
   id SERIAL PRIMARY KEY,
   title TEXT NOT NULL,
   owner INTEGER NOT NULL REFERENCES USERS ON DELETE CASCADE,
   date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   is_private BOOLEAN DEFAULT FALSE
);
CREATE TABLE books (
   id SERIAL PRIMARY KEY,
   collection_id INTEGER NOT NULL REFERENCES COLLECTIONS ON DELETE CASCADE,
   user_id INTEGER NOT NULL REFERENCES USERS ON DELETE CASCADE,
   key TEXT UNIQUE NOT NULL,
   author TEXT NOT NULL,
   title TEXT NOT NULL,
   description TEXT NOT NULL,
   year INTEGER NOT NULL,
   status TEXT NOT NULL DEFAULT 'No status',
   date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE forums (
   id SERIAL PRIMARY KEY,
   title TEXT NOT NULL,
   description TEXT NOT NULL,
   creator INTEGER NOT NULL REFERENCES USERS ON DELETE CASCADE
);
CREATE TABLE subjects (
   id SERIAL PRIMARY KEY,
   name TEXT NOT NULL,
   creator INTEGER NOT NULL REFERENCES USERS ON DELETE CASCADE
);
CREATE TABLE posts (
   id SERIAL PRIMARY KEY,
   creator INTEGER NOT NULL,
   date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   title TEXT NOT NULL,
   post_text TEXT NOT NULL,
   subject INTEGER REFERENCES subjects ON DELETE CASCADE,
   forum INTEGER NOT NULL REFERENCES forums ON DELETE CASCADE,
   is_private BOOLEAN DEFAULT FALSE
);
CREATE TABLE comments (
   id SERIAL PRIMARY KEY,
   from_user INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
   comment TEXT NOT NULL,
   post_id INTEGER NOT NULL REFERENCES posts ON DELETE CASCADE,
   timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE replies (
   id SERIAL PRIMARY KEY,
   from_user INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
   reply TEXT NOT NULL,
   comment_id INTEGER NOT NULL REFERENCES comments ON DELETE CASCADE,
   timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE likes (
   id SERIAL PRIMARY KEY,
   post_id INTEGER NOT NULL REFERENCES posts ON DELETE CASCADE,
   from_user INTEGER NOT NULL REFERENCES users ON DELETE CASCADE,
   timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);