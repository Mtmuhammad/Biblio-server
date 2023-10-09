"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError, NotFoundError } = require("../expressError");
const { appendName } = require("../helpers/appendName");
const { getCurrentTime } = require("../helpers/getCurrentTime");

/** Related functions for a user comment on post. */

class Comment {
  /** creates a new user comment.
   *
   * Returns => {id, creatorId, text, postId, date, time, fullName}
   *
   * Throws NotFoundError if creator does not exist
   * Throws NotFoundError if post does not exist
   */

  static async create({ creatorId, text, postId }) {
    // Check if user exists, if not throw error
    const user = await db.query(`SELECT id FROM users WHERE id = $1`, [
      creatorId,
    ]);
    if (!user.rows[0])
      throw new NotFoundError("Invalid data, user does not exist!");

    // Check if post exists, if not throw error
    const post = await db.query(`SELECT id FROM posts WHERE id = $1`, [postId]);
    if (!post.rows[0])
      throw new NotFoundError("Invalid data, post does not exist!");

    // create comment
    const result = await db.query(
      `
      INSERT INTO comments (creator_id, text, post_id, time)
      VALUES ($1, $2, $3, $4)
      RETURNING id, creator_id AS "creatorId", text, 
      post_id AS "postId", to_char(date_created, 'MM-DD-YYYY') AS "date", 
      time`,
      [creatorId, text, postId, getCurrentTime()]
    );

    let comment = await appendName(result.rows);

    return comment[0];
  }

  /** Finds all comments
   *
   * Returns => [{id, creatorId, text, postId, date, time, fullName}, {...}, {...}]
   */

  static async findAll() {
    //fetch all comments
    const result = await db.query(`
    SELECT id, creator_id AS "creatorId", text, post_id AS "postId",
    to_char(date_created, 'MM-DD-YYYY') AS "date", time
    FROM comments`);

    const comments = await appendName(result.rows);

    return comments;
  }

  /** Given a user id, finds all user comments.
   *
   * Returns => [{id, creatorId, text, postId, date, time, fullName}, {...}, {...}]
   *
   * Throws NotFoundError if user does not exist
   */

  static async findAllUser(userId) {
    // fetch comments by user id
    const result = await db.query(
      `
    SELECT id, creator_id AS "creatorId", text, post_id AS "postId",
    to_char(date_created, 'MM-DD-YYYY') AS "date", time
    FROM comments 
    WHERE creator_id = $1`,
      [userId]
    );

    let comments = result.rows;

    if (comments.length === 0)
      throw new NotFoundError("Invalid data, user does not exist!");

    comments = await appendName(comments);
    return comments;
  }

  /**Given a post id, returns all comments on the post.
   *
   * Returns => [{id, creatorId, text, postId, date, time, fullName}, {...}, {...}]
   *
   * Throws NotFoundError if post does not exist.
   */

  static async findCommentsByPost(postId) {
    // fetch comments by post id
    const result = await db.query(
      `
    SELECT id, creator_id AS "creatorId", text, post_id AS "postId",
    to_char(date_created, 'MM-DD-YYYY') AS "date", time
    FROM comments 
    WHERE post_id = $1`,
      [postId]
    );

    let comments = result.rows;

    if (comments.length === 0)
      throw new NotFoundError("Invalid data, post does not exist!");

    comments = await appendName(comments);
    return comments;
  }

  /** Given a comment id. finds the individual comment.
   *
   * Returns => {id, creatorId, text, postId, date, time, fullName}
   *
   * Throws NotFoundError if comment not found.
   */

  static async findOne(id) {
    // fetch comment by id in database
    const result = await db.query(
      `
    SELECT id, creator_id AS "creatorId", text, post_id AS "postId",
    to_char(date_created, 'MM-DD-YYYY') AS "date", time
    FROM comments 
    WHERE id = $1`,
      [id]
    );

    let comment = result.rows[0];

    // if not found, throw error
    if (!comment) throw new NotFoundError("No comment found!");

    comment = await appendName(result.rows);

    return comment[0];
  }

  /**Given a comment id, Update comment data with given "data"
   *
   * This is a partial update, all fields do not have to be included.
   *
   * However, only admin users or logged in users who created the comment
   * can update the given fields.
   *
   * Data can include:
   * {text, postId, date, time, creatorId}
   *
   * Returns => {id, creatorId, text, postId, date, time, fullName}
   *
   * Throws NotFoundError if no comment found.
   * Throws BadRequestError if no data is submitted.
   */

  static async update(id, data) {
    //if no data submitted, throw error
    if (!data) throw new BadRequestError(`No data included!`);

    // set column names to match database and change data entry to prevent sql injection
    const { setCols, values } = sqlForPartialUpdate(data, {
      postId: "post_id",
      creatorId: "creator_id",
    });

    //will be last data entry in sql statement
    const numberVarIdx = "$" + (values.length + 1);

    const querySql = `
    UPDATE comments
    SET ${setCols}
    WHERE id = ${numberVarIdx}
    RETURNING id, creator_id AS "creatorId", text, post_id AS "postId",
    to_char(date_created, 'MM-DD-YYYY') AS "date", time
    `;

    const result = await db.query(querySql, [...values, id]);
    let comment = result.rows[0];

    // if no comment, throw error
    if (!comment) throw new NotFoundError("No comment found!");

    comment = await appendName(result.rows);

    return comment[0];
  }

  /** Given a comment id, deletes the comment
   *
   * Returns => undefined
   *
   * Throws NotFoundError if no comment is found
   */

  static async remove(id) {
    // remove comment from the database
    const result = await db.query(
      `
    DELETE FROM comments WHERE id = $1 RETURNING id`,
      [id]
    );

    const comment = result.rows[0];
    // if no comment found, throw error
    if (!comment) throw new NotFoundError(`No comment found!`);
  }
}

module.exports = Comment;
