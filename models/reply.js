"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError, NotFoundError } = require("../expressError");
const { appendName } = require("../helpers/appendName");
const { getCurrentTime } = require("../helpers/getCurrentTime");

/**Related functions for a user to post replies to comments. */

class Reply {
  /** creates a new user reply to a comment on a post.
   *
   * Returns => {id, creatorId, text, commentId, time, date, fullName}
   *
   * Throws NotFoundError if creator does not exist.
   * Throws NotFoundError if comment does not exist.
   */

  static async create({ creatorId, text, commentId }) {
    // Check if user exists, if not throw error
    const user = await db.query(`SELECT id FROM users WHERE id =$1`, [
      creatorId,
    ]);
    if (!user.rows[0])
      throw new NotFoundError("Invalid data, user does not exist!");

    // Check if comment exists, if not throw error
    const comment = await db.query(`SELECT id FROM comments WHERE id = $1`, [
      commentId,
    ]);
    if (!comment.rows[0])
      throw new NotFoundError("Invalid data, comment does not exist!");

    // create reply
    const result = await db.query(
      `
      INSERT INTO replies (creator_id, text, comment_id, time)
      VALUES ($1, $2, $3, $4)
      RETURNING id, creator_id AS "creatorId", text, comment_id AS "commentId", 
      to_char(date_created, 'MM-DD-YYYY') AS "date", time`,
      [creatorId, text, commentId, getCurrentTime()]
    );

    //append user full name
    let reply = await appendName(result.rows);

    return reply[0];
  }

  /**Find all replies.
   *
   * Returns => [{id, creatorId, text, commentId, time, date, fullName}, {...}, {...}]
   */

  static async findAll() {
    // fetch all replies
    const result = await db.query(`
    SELECT id, creator_id AS "creatorId", text, comment_id AS "commentId",
    to_char(date_created, 'MM-DD-YYYY') AS "date", time
    FROM replies`);

    const replies = await appendName(result.rows);

    return replies;
  }

  /**Given a comment id, returns all replies to that comment.
   *
   * Returns => [{id, creatorId, text, commentId, time, date, fullName}, {...}, {...}]
   *
   * Throws NotFoundError if comment does not exist
   */

  static async findRepliesByComment(commentId) {
    // fetch replies by comment id
    const result = await db.query(
      `
    SELECT id, creator_id AS "creatorId", text, comment_id AS "commentId",
    to_char(date_created, 'MM-DD-YYYY') AS "date", time
    FROM replies
    WHERE comment_id = $1
    `,
      [commentId]
    );

    let replies = result.rows;

    if (replies.length === 0)
      throw new NotFoundError("Invalid data, comment does not exist!");

    replies = await appendName(replies);
    return replies;
  }

  /**Given a creator id, finds all replies made by that user.
   *
   * Returns => [{id, creatorId, text, commentId, time, date, fullName}, {...}, {...}]
   *
   * Throws NotFoundError if user does not exist.
   */

  static async findRepliesByUser(creatorId) {
    // fetch replies by user id
    const result = await db.query(
      `SELECT id, creator_id AS "creatorId", text, comment_id AS "commentId",
    to_char(date_created, 'MM-DD-YYYY') AS "date", time
    FROM replies
    WHERE creator_id = $1
    `,
      [creatorId]
    );

    let replies = result.rows;

    if (replies.length === 0)
      throw new NotFoundError("Invalid data, user does not exist!");

    replies = await appendName(replies);
    return replies;
  }

  /**Given a reply id, finds the individual reply.
   *
   * Returns => {id, creatorId, text, commentId, time, date, fullName}
   *
   * Throws  NotFoundError if reply not found.
   */

  static async findOne(id) {
    // fetch reply by id in database
    const result = await db.query(
      `
    SELECT id, creator_id AS "creatorId", text, comment_id AS "commentId",
    to_char(date_created, 'MM-DD-YYYY') AS "date", time
    FROM replies
    WHERE id = $1`,
      [id]
    );

    let reply = result.rows[0];

    // if not found, throw error
    if (!reply) throw new NotFoundError("No reply found!");

    reply = await appendName(result.rows);

    return reply[0];
  }

  /**Given a reply id, updates the reply with given "data".
   *
   * This is a partial update, all fields do not need to be included.
   *
   * However, only admin users or logged in users who created the reply
   * can update the given fields.
   *
   * Data can include:
   * {text, commentId, creatorId, date, time}
   *
   * Returns => {id, creatorId, text, commentId, time, date, fullName}
   *
   * Throws NotFoundError if no reply found.
   * Throws BadRequestError if no data is submitted.
   */

  static async update(id, data) {
    // if no data submitted, throw error
    if (!data) throw new BadRequestError(`No data included!`);

    // set column names to match database and change data entry to prevent sql injection
    const { setCols, values } = sqlForPartialUpdate(data, {
      commentId: "comment_id",
      creatorId: "creator_id",
    });

    //will be last data entry in sql statement
    const numberVarIdx = "$" + (values.length + 1);

    const querySql = `
    UPDATE replies
    SET ${setCols}
    WHERE id = ${numberVarIdx}
    RETURNING id, creator_id AS "creatorId", text, comment_id AS "commentId",
    to_char(date_created, 'MM-DD-YYYY') AS "date", time`;

    const result = await db.query(querySql, [...values, id]);
    let reply = result.rows[0];

    // if no reply, throw error
    if (!reply) throw new NotFoundError("No reply found!");

    reply = await appendName(result.rows);

    return reply[0];
  }

  /** Given a reply id, deletes the reply.
   *
   * Returns => undefined if the reply
   *
   * Throws NotFoundError if no reply is found
   */

  static async remove(id) {
    // remove reply from the database
    const result = await db.query(
      `
    DELETE FROM replies WHERE id = $1 RETURNING id
    `,
      [id]
    );

    const reply = result.rows[0];
    // if no reply found, throw error
    if (!reply) throw new NotFoundError("No reply found!");
  }
}

module.exports = Reply;
