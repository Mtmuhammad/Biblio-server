"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Related functions for a forum */

class Forum {
  /** Create a new forum. Only admin users can create a forum. (Creator is a user id)
   *
   * Returns => {id, title, description, creator}
   *
   * Throws BadRequestError if duplicate forum.
   * Throws NotFoundError if forum not found.
   */

  static async create({ title, description, creator }) {
    /* Check to see if a forum exists with the same title.
   If the forum exists, throw error*/
    const duplicateCheck = await db.query(
      `
   SELECT * FROM forums WHERE title=$1 and creator=$2`,
      [title, creator]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError("Forum already exists!");

    // Check if user exists, if not throw error
    const user = await db.query(`SELECT id FROM users WHERE id = $1`, [
      creator,
    ]);
    if (!user.rows[0])
      throw new NotFoundError("Invalid data, user does not exist!");

    // create forum
    const result = await db.query(
      `
      INSERT INTO forums (title, description, creator)
      VALUES ($1,$2,$3)
      RETURNING id, title, description, creator`,
      [title, description, creator]
    );

    const forum = result.rows[0];

    return forum;
  }

  /** Finds all forums
   *
   * Returns => [{id, title, description, creator}, {...}, {...}]
   */

  static async findAll() {
    const result = await db.query(`
    SELECT id, title, description, creator
    FROM forums
    ORDER BY id`);

    return result.rows;
  }

  /** Given a forum id, finds individual forum
   *
   * Returns => {id, title, description, creator}
   *
   * Throws NotFoundError if no forum is found
   */

  static async findOne(id) {
    // fetch forum by id in database
    const result = await db.query(
      `
    SELECT id, title, description, creator
    FROM forums
    WHERE id = $1`,
      [id]
    );

    const forum = result.rows[0];

    if (!forum) throw new NotFoundError("No forum found!");

    return forum;
  }

  /** Update forum data with given "data".
   *
   * This is a partial update, all fields do not have to be included.
   *
   * However, only admin users can update the forum data.
   *
   * Data can include:
   * {title, description}
   *
   * Returns  => {id, title, description, creator}
   *
   * Throws NotFoundError if no forum is found
   */

  static async update(id, data) {
    //if no data, throw an error
    if (!data) throw new BadRequestError(`No data included!`);

    // set column names to match database and change data entry to prevent sql injection
    const { setCols, values } = sqlForPartialUpdate(data, {});

    //will be last data entry in sql statement
    const numberVarIdx = "$" + (values.length + 1);

    const querySql = `
     UPDATE forums
     SET ${setCols}
     WHERE id = ${numberVarIdx}
     RETURNING id, title, description, creator`;

    const result = await db.query(querySql, [...values, id]);
    const forum = result.rows[0];

    // if no forum found, throw error
    if (!forum) throw new NotFoundError(`No forum found!`);

    return forum;
  }

  /** Given a forum id, deletes the forum
   *
   * Returns => undefined
   *
   * Throws NotFoundError if no forum is found
   */

  static async remove(id) {
    // remove forum from the database
    const result = await db.query(
      `
    DELETE FROM forums WHERE id = $1 RETURNING id`,
      [id]
    );

    const forum = result.rows[0];
    // if no forum found, throw error
    if (!forum) throw new NotFoundError(`No forum found!`);
  }
}

module.exports = Forum;
