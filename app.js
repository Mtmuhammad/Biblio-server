"use strict";

/**Express app for Biblio */

const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bookRoutes = require("./routes/books");
const collectionRoutes = require("./routes/collections");
const commentRoutes = require("./routes/comments");
const forumRoutes = require("./routes/forums");
const likeRoutes = require("./routes/likes");
const postRoutes = require("./routes/posts");
const replyRoutes = require("./routes/replies");
const subjectRoutes = require("./routes/subjects");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/userAuth");
const { authenticateJWT } = require("./middleware/auth");

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

// custom middleware to authenticate JSON Web Tokens
app.use(authenticateJWT)

app.use("/books", bookRoutes)
app.use("/collections", collectionRoutes)
app.use("/comments", commentRoutes)
app.use("/forums", forumRoutes)
app.use("/likes", likeRoutes)
app.use("/posts", postRoutes)
app.use("/replies", replyRoutes)
app.use("/subjects", subjectRoutes)
app.use("/users", userRoutes)
app.use("/auth", authRoutes)

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
