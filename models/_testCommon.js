const bcrypt = require("bcrypt");
const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");
const { createRefreshToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  // no inspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM collections");
  await db.query("DELETE FROM books");
  await db.query("DELETE FROM forums");
  await db.query("DELETE FROM subjects");
  await db.query("DELETE FROM posts");

  // alter id sequences for testing
  await db.query(`ALTER SEQUENCE users_id_seq restart with 1;`);
  await db.query(`ALTER SEQUENCE collections_id_seq restart with 1;`);
  await db.query(`ALTER SEQUENCE books_id_seq restart with 1;`);
  await db.query(`ALTER SEQUENCE forums_id_seq restart with 1;`);
  await db.query(`ALTER SEQUENCE subjects_id_seq restart with 1;`);
  await db.query(`ALTER SEQUENCE posts_id_seq restart with 1;`);

  // insert users test data
  await db.query(
    `INSERT INTO users 
    (email, first_name, last_name, password, is_admin) 
     VALUES ('test1@yahoo.com','Test1', 'User1', $1, TRUE),
    ('test2@yahoo.com','Test2', 'User2', $2, FALSE)`,
    [
      await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
      await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    ]
  );

  // insert collections test data
  await db.query(`
  INSERT INTO collections
  (title, owner, is_private)
  VALUES 
  ('First Collection', 1, TRUE), 
  ('Second Collection', 2, FALSE),
  ('Third Collection', 1, FALSE)`);

  // insert books test data
  await db.query(`
  INSERT INTO books
  (collection_id, user_id, key, author, title, description, year)
  VALUES
  (1, 1, '/works/978643', 'Ralph Ellison','Shadow and Act', 'Brief Description 1', 1964),
  (1, 1, '/works/977643', 'Ralph Ellison','The Invisible Man', 'Brief Description 2', 1952),
  (2, 2, '/works/976643', 'Toni Morrison','Beloved', 'Brief Description 3', 1987),
  (2, 2, '/works/975643', 'Toni Morrison','The Bluest Eye', 'Brief Description 4', 1970)`);

  // insert forum test data
  await db.query(`
  INSERT INTO forums
  (title, description, creator)
  VALUES
  ('Announcements', 'This forum is a special forum for general announcements.', 1),
  ('Technology', 'Latest technology news and updates from our community.', 1),
  ('Marketplaces', 'This forum is a special forum for marketplace support.', 1)`);

  // insert subject test data
  await db.query(`
  INSERT INTO subjects
  (name, creator)
  VALUES
  ('General', 1), ('Ideas', 2), ('Help', 1)`);

  // insert post test data
  await db.query(`
  INSERT INTO posts
  (creator, title, post_text, subject, forum, is_private)
  VALUES
  (1, 'This is the first post.', 'This is the first post description.', 1, 1, false), 
  (1, 'This is the second post.', 'This is the second post description.', 1, 1, false),
  (2, 'This is the third post.', 'This is the third post description.', 2, 2, false),
  (2, 'This is the fourth post.', 'This is the fourth post description.', 2, 2, true),
  (2, 'This is the fifth post.', 'This is the fifth post description.', 3, 3, true),
  (1, 'This is the sixth post.', 'This is the sixth post description.', 3, 3, true)`);
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1refreshToken = createRefreshToken({
  id: 1,
  email: "new1@yahoo.com",
  isAdmin: true,
});
const u2refreshToken = createRefreshToken({
  id: 1,
  email: "new2@yahoo.com",
  isAdmin: false,
});

module.exports = {
  commonAfterAll,
  commonAfterEach,
  commonBeforeAll,
  commonBeforeEach,
  u1refreshToken,
  u2refreshToken,
};
