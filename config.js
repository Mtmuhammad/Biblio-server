"use strict";

/**Shared configuration for application; can be required many places */

require("dotenv").config();
require("colors");

const SECRET_KEY = process.env.SECRET_KEY;
const PORT = +process.env.PORT || 3001;
const HOST = process.env.PGHOST


/**Use dev database, testing database, or via environment variable, 
the production database */
const getDatabaseUri = () => {
  return process.env.NODE_ENV === "test"
    ? "biblio_test"
    : process.env.DATABASE_URL || "biblio";
};

/** Speed up bcrypt during testing since the algorithm safety isn't being tested */
const BCRYPT_WORK_FACTOR =
  process.env.NODE_ENV === "test" ? 1 : +process.env.BCRYPT_WORK_FACTOR;

console.log("Biblio Config:".green);
console.log("SECRET KEY:".yellow, SECRET_KEY);
console.log("PORT:".yellow, PORT.toString());
console.log("BCRYPT_WORK_FACTOR:".yellow, BCRYPT_WORK_FACTOR);
console.log("DATABASE:".yellow, getDatabaseUri());
console.log("HOST:".yellow,HOST);
console.log("---");

module.exports = {
  SECRET_KEY,
  PORT,
  BCRYPT_WORK_FACTOR,
  getDatabaseUri,
  HOST
};
