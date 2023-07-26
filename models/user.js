"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const { BCRYPT_WORK_FACTOR } = require("../config");

/**Related functions for users */

class User {
  /** authenticate user with email and passwords
   *
   *  Returns => {id, email, firstName, lastName, isAdmin}
   *
   * Throws UnauthorizedError if email is not found or wrong password
   */

  static async authenticate(email, password) {
    //attempt to find user by email
    const result = await db.query(
      `
      SELECT
         id,
         email,
         first_name AS "firstName",
         last_name AS "lastName",
         password,
         is_admin AS "isAdmin"
      FROM users
      WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    // if user is found, compare hashed pwd to user provided pwd
    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    // if passwords do not match, throw error
    throw new UnauthorizedError("Invalid username/password!");
  }

  /** Register user with data
   *
   * Returns => {id, email, firstName, lastName, isAdmin}
   *
   * Throws BadRequestError on duplicate entries
   */

  static async register({ firstName, lastName, email, password, isAdmin }) {
    // check if user already exists. If duplicate throw error
    const duplicateCheck = await db.query(
      `SELECT email FROM users WHERE email = $1`,
      [email]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    // hash user password
    const hashedPwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    // insert user data
    const result = await db.query(
      `
      INSERT INTO users (email, first_name, last_name, password, is_admin)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING 
        id,
        email,
        first_name AS "firstName",
        last_name AS "lastName",
        is_admin AS "isAdmin"
    `,
      [email, firstName, lastName, hashedPwd, isAdmin]
    );

    const user = result.rows[0];

    return user;
  }

  /** Finds all users
   *
   * Returns => [{id, email, firstName, lastName, isAdmin}, {...}, {...}]
   */

  static async findAll() {
    const result = await db.query(`
    SELECT
      id,
      email,
      first_name AS "firstName",
      last_name AS "lastName",
      is_admin AS "isAdmin"
    FROM users
    ORDER BY id`);

    return result.rows;
  }

  /** Given an id number, returns data about the user
   *
   * Returns => {id, email, firstName, lastName, isAdmin}
   *
   * Throws NotFoundError if no user found
   */

  static async findOne(id) {
    // fetch user by user id in database
    const result = await db.query(
      `
    SELECT
      first_name as "firstName",
      last_name AS "lastName",
      email,
      is_admin AS "isAdmin"
    FROM users
    WHERE id = $1`,
      [id]
    );

    const user = result.rows[0];
    // if not found, throw error
    if (!user) throw new NotFoundError(`No user found!`);

    return user;
  }

  /** Update user data with given "data"
   *
   * This is a partial update, all fields do not have to be included.
   *
   * However, only admin users or logged in user can update the given user fields.
   * Admin can update any user.
   *
   * Data can include:
   *  { firstName, lastName, email, password, isAdmin}
   *
   * Returns => {id, email, firstName, lastName, email, isAdmin}
   *
   * Throws NotFoundError if no user found.
   */

  static async update(id, data) {
    // if password needs to be updated
    if (data.password) {
      data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    }

    // set column names to match database and change data entry to prevent sql injection
    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      isAdmin: "is_admin",
    });

    // will be the last data entry in sql statement
    const numberVarIdx = "$" + (values.length + 1);
    const querySql = `
    UPDATE users
    SET ${setCols}
    WHERE id = ${numberVarIdx}
    RETURNING id,
              first_name AS "firstName", 
              last_name AS "lastName",
              email,
              is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, id]);
    const user = result.rows[0];

    // if no user found, throw error
    if (!user) throw new NotFoundError(`No user found!`);

    return user;
  }

  /** Given a user id, deletes the user
   *
   * Returns => undefined
   *
   * Throws NotFoundError if no user is found
   */

  static async remove(id) {
    // remove user from database
    const result = await db.query(
      `
      DELETE
      FROM users
      WHERE id = $1
      RETURNING id`,
      [id]
    );

    const user = result.rows[0];
    // if no user found, throw error
    if (!user) throw new NotFoundError(`No user found!`);
  }

  /** Given a user id and refresh token, saves token to database
   *
   * Returns => user
   *
   * Throws NotFoundError if no user found
   */

  static async saveRefreshToken(id, token) {
    // save refresh token to database
    const result = await db.query(
      `
    UPDATE users
    SET token = $1
    WHERE id = $2
    RETURNING 
      id,
      token as "refreshToken"`,
      [token, id]
    );

    const user = result.rows[0];
    // if no user found, throw error
    if (!user) throw new NotFoundError(`No user found!`);
    return user;
  }

  /** Given a refresh token, finds user data. User data is used to sign a new
   * access token.
   *
   * Returns => {id, first_name, last_name, email, isAdmin}
   *
   * Throws NotFoundError if no user is found
   */

  static async findToken(refreshToken) {
    // retrieve user data using refresh token
    const result = await db.query(
      `
    SELECT
      id,
      email,
      first_name AS "firstName",
      last_name AS "lastName",
      is_admin AS "isAdmin"
    FROM users
    WHERE token = $1`,
      [refreshToken]
    );

    const user = result.rows[0];

    // if no user found, throw error
    if (!user) throw new NotFoundError(`No user found!`);
    return user;
  }

  /** Given an id number, removes user refresh token from database on logout.
   *
   * Returns => {id, token}
   *
   * Throws NotFoundError if no user found
   */

  static async removeRefreshToken(id) {
    // remove refresh token from database if user is found
    const result = await db.query(
      `
    UPDATE users
    SET token = null
    WHERE id = $1
    RETURNING id, token`,
      [id]
    );

    const user = result.rows[0];

    //if no user is found, throw error
    if (!user) throw new NotFoundError("No user found!");
    return user;
  }
}

module.exports = User;
