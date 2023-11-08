"use strict";

/**Convenience middleware to handle common auth cases in routes */

const jwt = require("jsonwebtoken");
require("dotenv").config();
const { UnauthorizedError, ForbiddenError } = require("../expressError");

/**Middleware to authenticate a user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the email and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is invalid
 */

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must be logged include
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to check if logged in user has isAdmin field set to "true"
 *
 * if not, raises ExpressError
 */

function ensureIsAdmin(req, res, next) {
  try {
    if (
      res.locals.user.isAdmin !== true ||
      res.locals.user.isAdmin == undefined
    )
      throw new ForbiddenError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must provide a valid token & be user matching
 * email provided as route param.
 *
 * If not, raises Unauthorized.
 */

function ensureCorrectUserOrAdmin(req, res, next) {
  try {
    const user = res.locals.user;
    if (!(user && (user.isAdmin || user.id === +req.params.id))) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Function to check if logged in user is the correct user to modify or
 * view certain data.
 *
 * If not, raises ForbiddenError
 *
 * Returns undefined
 */

function checkUser(found, currUser) {
  if (found) {
    if (currUser.isAdmin !== true && found.userId !== currUser.id) {
      throw new ForbiddenError();
    }
  }
  return undefined;
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureIsAdmin,
  ensureCorrectUserOrAdmin,
  checkUser,
};
