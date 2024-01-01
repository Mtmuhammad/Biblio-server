"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError, NotFoundError } = require("../expressError");
const { appendName } = require("../helpers/appendName");
const { getCurrentTime } = require("../helpers/getCurrentTime");

/**Related functions for a user to like a post. */

class Like {
  /** creates a new user like on a post.
   *
   * Returns => 
   *
   * Throws NotFoundError if creator does not exist.
   * Throws NotFoundError if post does not exist.
   * Throws BadRequestError if user has already liked this post.
   */

  static async create({ postId, creatorId }) {
    //Check if user exists, if not throw error
    const user = await db.query(`SELECT id FROM users WHERE id = $1`, [
      creatorId,
    ]);
    if (!user.rows[0])
      throw new NotFoundError("Invalid data, user does not exist!");

    // Check if post exists, if not throw error
    const post = await db.query(`SELECT id FROM posts WHERE id = $1`, [postId]);
    if (!post.rows[0])
      throw new NotFoundError("Invalid data, post does not exist!");

    // Check is user has liked post already, if so throw error
    const verify = await db.query(
      `SELECT id FROM likes WHERE post_id = $1 and creator_id = $2`,
      [postId, creatorId]
    );

    if (verify.rows[0])
      throw new BadRequestError("User has already liked this post!");

    // create like
    const result = await db.query(
      `
     INSERT INTO likes (post_id, creator_id, time)
     VALUES ($1, $2, $3) 
     RETURNING id, post_id AS "postId", creator_id AS "creatorId", 
     to_char(date_created, 'MM-DD-YYYY') AS "date", time`,
      [postId, creatorId, getCurrentTime()]
    );

    // append user full name
    let like = await appendName(result.rows);

    return like[0];
  }

  /**Find all likes.
   *
   * Returns => [{id, postId, creatorId, time, date, fullName}, {...}, {...}]
   */

  static async findAll() {
    //fetch all likes
    const result = await db.query(`
    SELECT id, post_id AS "postId", creator_id AS "creatorId", 
    to_char(date_created, 'MM-DD-YYYY') AS "date", time
    FROM likes`);

    const likes = await appendName(result.rows);

    return likes;
  }

  /**Given a post id, finds all likes for that post.
   *
   * Returns => [{id, postId, creatorId, time, date, fullName}, {...}, {...}]
   *
   * Throws NotFoundError if post does not exist.
   */

  static async findLikesByPost(postId) {
    // fetch likes by post id
    const result = await db.query(
      `SELECT id, post_id AS "postId", creator_id AS "creatorId", 
      to_char(date_created, 'MM-DD-YYYY') AS "date", time
      FROM likes
      WHERE post_id = $1`,
      [postId]
    );

    let likes = result.rows;

    if (likes.length === 0) {
      throw new NotFoundError("Invalid data, post does not exist!");
    }

    likes = await appendName(likes);
    return likes;
  }

  /**Given a user id, finds all likes made by that user.
   *
   * Returns => [{id, postId, creatorId, time, date, fullName}, {...}, {...}]
   *
   * Throws NotFoundError if user does not exist.
   */

  static async findLikesByUser(creatorId) {
    // fetch likes by user id
    const result = await db.query(
      `SELECT id, post_id AS "postId", creator_id AS "creatorId", 
      to_char(date_created, 'MM-DD-YYYY') AS "date", time
      FROM likes
      WHERE creator_id = $1`,
      [creatorId]
    );

    let likes = result.rows;

    if (likes.length === 0)
      throw new NotFoundError("Invalid data, user does not exist!");

    likes = await appendName(likes);
    return likes;
  }

  /**Given a like id, finds that like.
   *
   * Returns => {id, postId, creatorId, time, date, fullName}
   *
   * Throws NotFoundError if like does not exist.
   */

  static async findOne(id) {
    // fetch like by id in database
    const result = await db.query(
      `SELECT id, post_id AS "postId", creator_id AS "creatorId", 
      to_char(date_created, 'MM-DD-YYYY') AS "date", time
      FROM likes
      WHERE id = $1`,
      [id]
    );

    let like = result.rows[0];

    // if not found, throw error
    if (!like) throw new NotFoundError("No like found!");

    like = await appendName(result.rows);

    return like[0];
  }

  /**Given a like id, updates the like with given "data".
   *
   * This is a partial update, all fields do no need to be included.
   *
   * However, only admin users or logged in users who created the like
   * can update the given fields.
   *
   * Data can include:
   * {postId, creatorId, time, date}
   *
   * Returns => {id, postId, creatorId, time, date, fullName}
   *
   * Throws NotFoundError if no like found.
   * Throws BadRequestError if no data is submitted.
   */

  static async update(id, data) {
    // if no data submitted, throw error
    if (!data) throw new BadRequestError(`No data included!`);

    // set column names to match database and change data entry to prevent sql injection
    const { setCols, values } = sqlForPartialUpdate(data, {
      postId: "post_id",
      creatorId: "creator_id",
    });

    //will be last data entry in sql statement
    const numberVarIdx = "$" + (values.length + 1);

    const querySql = `
    UPDATE likes
    SET ${setCols}
    WHERE id = ${numberVarIdx}
    RETURNING id, post_id AS "postId", creator_id AS "creatorId", 
    to_char(date_created, 'MM-DD-YYYY') AS "date", time`;

    const result = await db.query(querySql, [...values, id]);
    let like = result.rows[0];

    // if no like, throw error
    if (!like) throw new NotFoundError("No like found!");

    like = await appendName(result.rows);

    return like[0];
  }

  /**Given a like id, deleted the like.
   *
   * Returns => undefined
   *
   * Throws NotFoundError if no like is found.
   */

  static async remove(id) {
    // remove like from the database
    const result = await db.query(
      `DELETE FROM likes WHERE id = $1 RETURNING id`,
      [id]
    );

    const like = result.rows[0];
    // if no like found, throw error
    if (!like) throw new NotFoundError("No reply found!");
  }
}

module.exports = Like;
