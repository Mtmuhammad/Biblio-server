"use strict";

/**Database setup for biblio */
const { Client } = require("pg");
const { getDatabaseUri, HOST} = require("./config");

let db;

if (process.env.NODE_ENV === "production") {
  db = new Client({
    database: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false,
    },
    host: HOST
  });
} else {
  db = new Client({
    database: getDatabaseUri(),
    host: HOST
  });
}

db.connect();

module.exports = db;
