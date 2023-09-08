"use strict";

const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { BadRequestError, NotFoundError } = require("../expressError");
const {appendName} = require("../helpers/appendName")

/** Related functions for a user post */

class Post {
  /** create a new user post.
   *
   * Returns => {id, creator, date, title, postText, subject, forum, isPrivate}
   *
   * Throws BadRequestError if duplicate title and creator.
   * Throws NotFoundError if creator does not exist.
   */

  static async create({ creator, title, postText, subject, forum }) {
    // Check if user exists, if not throw error
    const user = await db.query(`SELECT id FROM users WHERE id = $1`, [
      creator,
    ]);
    if (!user.rows[0])
      throw new NotFoundError("Invalid data, user does not exist!");

    /* Check if a post exist with the same title and creator.
      If the post exists, throw error. */
    const duplicateCheck = await db.query(
      `SELECT * FROM posts WHERE creator=$1 AND title=$2`,
      [creator, title]
    );

    if (duplicateCheck.rows[0])
      throw new BadRequestError("A post with this name already exists!");

    // create post
    const result = await db.query(
      `
   INSERT INTO posts (creator, title, post_text, subject, forum)
   VALUES ($1,$2, $3, $4, $5)
   RETURNING id, creator, to_char(date_created, 'MM-DD-YYYY') AS "date",
   title, post_text AS "postText", subject, forum, is_private AS "isPrivate"`,
      [creator, title, postText, subject, forum]
    );
    const post = result.rows[0];

    return post;
  }

  /** Finds all public posts.
   *
   * Returns [{id, creatorId, fullName, date, title, postText, subject, forum, isPrivate}, {...}, {...}]
   */

  static async findAllPublic() {
    // fetch all public posts
    const result = await db.query(
      `
    SELECT posts.id, posts.creator AS "creatorId", to_char(date_created, 'MM-DD-YYYY') AS "date",
    posts.title, post_text AS "postText", subjects.name AS "subject", forums.title AS "forum", is_private AS "isPrivate"
    FROM posts
    JOIN subjects
    ON subjects.id = posts.subject
    JOIN forums
    ON forums.id = posts.forum
    WHERE posts.is_private = $1
    `,
      [false]
    );

    const posts = await appendName(result.rows)

    return posts;
  }

  /** Given a userId, finds all posts that belong to that user.
   *
   * Returns => [{id, creatorId, fullName, date, title, postText, subject, forum, isPrivate}, {...}, {...}]
   *
   * Throws NotFoundError if user not found
   */

  static async findAllUser(userId) {
    // fetch posts by user id
    const result = await db.query(
      `SELECT posts.id, posts.creator AS "creatorId", to_char(date_created, 'MM-DD-YYYY') AS "date",
      posts.title, post_text AS "postText", subjects.name AS "subject", forums.title AS "forum", is_private AS "isPrivate"
      FROM posts
      JOIN subjects
      ON subjects.id = posts.subject
      JOIN forums
      ON forums.id = posts.forum
      WHERE posts.creator = $1
      `,
      [userId]
    );

    let posts = result.rows;

    if (posts.length === 0)
      throw new NotFoundError("Invalid data, user does not exist!");

    posts = await appendName(posts)

    return posts;
  }

  /**Given a post id, finds the individual post.
   *
   * Returns => {id, creatorId, fullName, date, title, postText, subject, forum, isPrivate}
   *
   * Throws NotFoundError if no post found.
   */

  static async findOne(id) {
    // fetch post by id in database
    const result = await db.query(
      `SELECT posts.id, posts.creator AS "creatorId", to_char(date_created, 'MM-DD-YYYY') AS "date",
      posts.title, post_text AS "postText", subjects.name AS "subject", forums.title AS "forum", is_private AS "isPrivate"
      FROM posts
      JOIN subjects
      ON subjects.id = posts.subject
      JOIN forums
      ON forums.id = posts.forum
      WHERE posts.id = $1`,
      [id]
    );

    let post = result.rows[0];

    // if not found, throw error
    if (!post) throw new NotFoundError("No post found!");

    post = await appendName(result.rows)

    return post[0];
  }

  /** Update post data with given "data"
   *
   * This is a partial update, all fields do not have to be included.
   *
   * However, only admin users or logged in users who created the post
   * can update the given fields.
   *
   * Data can include:
   * {title, postText, subject, forum, isPrivate}
   *
   * Returns => {id, creator, date, title, postText, subject, forum, isPrivate}
   *
   * Throws NotFoundError if no post found.
   * Throws BadRequestError if no data submitted.
   */

  static async update(id, data) {
    // if no data submitted, throw error
    if (!data) throw new BadRequestError(`No data included!`);

    // set column names to match database and change data entry to prevent sql injection
    const { setCols, values } = sqlForPartialUpdate(data, {
      postText: "post_text",
      isPrivate: "is_private",
    });

    //will be last data entry in sql statement
    const numberVarIdx = "$" + (values.length + 1);

    const querySql = `
    UPDATE posts
    SET ${setCols}
    WHERE id = ${numberVarIdx}
    RETURNING id, creator, to_char(date_created, 'MM-DD-YYYY') AS "date",
    title, post_text AS "postText", subject, forum, is_private AS "isPrivate"`;

    const result = await db.query(querySql, [...values, id]);
    const post = result.rows[0];

    // if no post found, throw error
    if (!post) throw new NotFoundError(`No post found!`);

    return post;
  }

  /** Given a post id, deletes the post
   *
   * Returns => undefined
   *
   * Throws NotFoundError if no post is found
   */

  static async remove(id) {
    // remove post from the database
    const result = await db.query(
      `
    DELETE FROM posts WHERE id = $1 RETURNING id`,
      [id]
    );

    const post = result.rows[0];
    // if no post found, throw error
    if (!post) throw new NotFoundError(`No post found!`);
  }
}

module.exports = Post;
