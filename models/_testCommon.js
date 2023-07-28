const bcrypt = require("bcrypt");
const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");
const { createRefreshToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  // no inspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM collections");

  // alter id sequences for testing
  await db.query(`ALTER SEQUENCE users_id_seq restart with 1;`);
  await db.query(`ALTER SEQUENCE collections_id_seq restart with 1;`);

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
  (title, owner)
  VALUES ('First Collection', 1), ('Second Collection', 2)`);
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
