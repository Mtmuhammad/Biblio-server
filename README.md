# Biblio Book sharing/Forum API

## Table of contents

- [Overview](#overview)
  - [Installation](#installation)
  - [Built with](#built-with)

### Overview

Biblio is an API built to allow users to save book information and create collections of books they would like to read,
or have previously read. The API also allows users to create forum posts based on these books to allow users to interact.

### Installation

To clone down this repository, you will need `node` and `npm` installed globally on your machine.  

Installation:

`npm install`  

Create and Seed Database:

`npm run database`

To Run Test Suite:  

`npm test`  

To Start Server:

`npm start`

To Start Dev Server:

`npm run dev`  

To Visit App:

`localhost:3001`  

### Built with

- [ExpressJS](https://expressjs.com/) - NodeJS framework
- [Bcrypt](https://www.npmjs.com/package/bcrypt) - NodeJS library for password hashing
- [PostgreSQL](https://www.postgresql.org/) - Object-Relational Database
- [JSONWebTokens](https://www.npmjs.com/package/jsonwebtoken) - JWT signing and authentication
- [JSONSchema](https://json-schema.org/) - JSON testing and validation
