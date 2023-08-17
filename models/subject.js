"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError, NotFoundError } = require("../expressError");

/** Related functions for a forum subject */

class Subject {
  /** create a new subject for a forum
   *
   * Returns => {id, name, creator}
   *
   * Throws BadRequestError if duplicate name
   */

  static async create({ name, creator }) {
    /* Check to see if a subject already exists with the same name.
      If the subject already exists, throw error*/
    const duplicateCheck = await db.query(
      `SELECT * FROM subjects WHERE name = $1`,
      [name]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError("Subject already exists!");

    // Check if user exists, if not throw error
    const user = await db.query(`SELECT id FROM users WHERE id = $1`, [
      creator,
    ]);
    if (!user.rows[0])
      throw new NotFoundError("Invalid data, user does not exist!");

    // create subject
    const result = await db.query(
      `
      INSERT INTO subjects (name, creator)
      VALUES ($1, $2)
      RETURNING id, name, creator`,
      [name, creator]
    );

    const subject = result.rows[0];

    return subject;
  }

  /** Finds all subjects
   *
   * Returns => [{id, name, creator}, {...}, {...}]
   */

  static async findAll() {
    const result = await db.query(`
    SELECT id, name, creator
    FROM subjects`);

    return result.rows;
  }

  /** Given a subject id, finds individual subject
   *
   * Returns => {id, name, creator}
   *
   * Throws NotFoundError if no subject found
   */

  static async findOne(id) {
    // fetch subject by id in database
    const result = await db.query(
      `
    SELECT id, name , creator
    FROM subjects
    WHERE id = $1`,
      [id]
    );

    const subject = result.rows[0];

    if (!subject) throw new NotFoundError(`No subject found!`);

    return subject;
  }

  /** Update subject data with given "data"
   *
   * This is a partial update, all fields do not have to be included.
   *
   * However, only admin users or logged in users who created the subject
   * can update the given fields.
   *
   * Data can include:
   * {name}
   *
   * Returns => {id, name, creator}
   *
   * Throws NotFoundError if no subject found.
   * Throws BadRequestError if no data submitted.
   */

  static async update(id, data) {
    //if no data, throw an error
    if (!data) throw new BadRequestError(`No data included!`);

    // set column names to match database and change data entry to prevent sql injection
    const { setCols, values } = sqlForPartialUpdate(data, {});

    //will be last data entry in sql statement
    const numberVarIdx = "$" + (values.length + 1);

    const querySql = `
    UPDATE subjects
    SET ${setCols}
    WHERE id = ${numberVarIdx}
    RETURNING id, name, creator`;

    const result = await db.query(querySql, [...values, id]);
    const subject = result.rows[0];

    // if no subject found, throw error
    if (!subject) throw new NotFoundError(`No subject found!`);

    return subject;
  }

  /** Given a subject id, deletes the subject
   *
   * Returns => undefined
   *
   * Throws NotFoundError if no subject is found
   */

  static async remove(id) {
    // remove subject from the database
    const result = await db.query(
      `
    DELETE FROM subjects WHERE id = $1 RETURNING id`,
      [id]
    );

    const subject = result.rows[0];
    // if no subject found, throw error
    if (!subject) throw new NotFoundError(`No subject found!`);
  }
}

module.exports = Subject;
