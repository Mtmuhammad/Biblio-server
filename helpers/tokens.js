const jwt = require("jsonwebtoken");
const jsonschema = require("jsonschema");
const tokenNewSchema = require("../schemas/tokenNew.json");
const { BadRequestError } = require("../expressError");
require("dotenv").config();

/** return signed JWT from user data */

const createToken = (user) => {
  console.assert(
    user.isAdmin !== undefined,
    "createToken passed without isAdmin property"
  );

  const validator = jsonschema.validate({ ...user }, tokenNewSchema);
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  let payload = {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "5m",
  });
};

const createRefreshToken = (user) => {
  console.assert(
    user.isAdmin !== undefined,
    "createRefreshToken passed without isAdmin property"
  );

  const validator = jsonschema.validate({ ...user }, tokenNewSchema);
  if (!validator.valid) {
    const errs = validator.errors.map((e) => e.stack);
    throw new BadRequestError(errs);
  }

  let payload = {
    id: user.id,
    email: user.email,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "1d",
  });
};

module.exports = { createToken, createRefreshToken };
