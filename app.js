"use strict";

/**Express app for Biblio */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const app = express();

//middleware logger
app.use(morgan("tiny"));

//Cross Origin Resource Sharing
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

//built in middleware for JSON
app.use(express.json());

//built in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

//middleware for cookies
app.use(cookieParser());

/** Handle 404 errors -- this matches everything */
app.use((req, res, next) => {
  return next(new NotFoundError());
});

/**Generic error handling; anything unhandled goes here */
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
