"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");
const User = require("../models/user");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  u3Token,
} = require("../models/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/***** POST /users  ********/
describe("POST /users", () => {
  test("should work for admin user to create a non admin user", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        firstName: "Test1",
        lastName: "Test2",
        email: "test@email.com",
        password: "password1!",
        isAdmin: false,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      role: 2024,
      user: {
        id: 3,
        email: "test@email.com",
        firstName: "Test1",
        lastName: "Test2",
        isAdmin: false,
      },
      token: expect.any(String),
    });
  });
  test("should work for admin user to create an admin user", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        firstName: "Test1",
        lastName: "Test2",
        email: "test@email.com",
        password: "password1!",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      role: 1990,
      user: {
        id: 4,
        email: "test@email.com",
        firstName: "Test1",
        lastName: "Test2",
        isAdmin: true,
      },
      token: expect.any(String),
    });
  });
  test("should throw BadRequestError if data missing", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        firstName: "Marcellus",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toBe(400);
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).post("/users").send({
      firstName: "Test1",
      lastName: "Test2",
      email: "test@email.com",
      password: "password1!",
      isAdmin: true,
    });
    expect(res.statusCode).toEqual(401);
  });
  test("should throw ForbiddenError for user not admin", async () => {
    const res = await request(app)
      .post("/users")
      .send({
        firstName: "Test1",
        lastName: "Test2",
        email: "test@email.com",
        password: "password1!",
        isAdmin: true,
      })
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(403);
  });
});

/***** GET /users  ********/
describe("GET /users", () => {
   test("should work for user to return all users", async () => {
     const res = await request(app)
       .get("/users")
       .set("authorization", `Bearer ${u2Token}`);
     expect(res.statusCode).toBe(200);
     expect(res.body).toEqual( {
      users: [
        {
          id: 1,
          email: 'test1@yahoo.com',
          firstName: 'Test1',
          lastName: 'User1',
          isAdmin: true
        },
        {
          id: 2,
          email: 'test2@yahoo.com',
          firstName: 'Test2',
          lastName: 'User2',
          isAdmin: false
        }
      ]
    });
   });
   test("should work for admin user to return all users", async () => {
     const res = await request(app)
       .get("/users")
       .set("authorization", `Bearer ${u1Token}`);
     expect(res.statusCode).toBe(200);
     expect(res.body).toEqual( {
      users: [
        {
          id: 1,
          email: 'test1@yahoo.com',
          firstName: 'Test1',
          lastName: 'User1',
          isAdmin: true
        },
        {
          id: 2,
          email: 'test2@yahoo.com',
          firstName: 'Test2',
          lastName: 'User2',
          isAdmin: false
        }
      ]
    });
   });
 
   test("should throw UnauthorizedError for anon user", async () => {
     const res = await request(app).get("/users");
     expect(res.statusCode).toBe(401);
   });
 
   test("should throw NotFoundError for invalid url", async () => {
     const res = await request(app)
       .get("/user")
       .set("authorization", `Bearer ${u1Token}`);
     expect(res.statusCode).toEqual(404);
   });
 
   test("should fail: test next() handler", async () => {
     await db.query("DROP TABLE users CASCADE");
     const res = await request(app)
       .get("/users")
       .set("authorization", `Bearer ${u1Token}`);
     expect(res.statusCode).toBe(500);
   });
 });

 /***** GET /users/:id  ********/

describe("GET /users/:id", () => {
   test("should work for admin user to get a user", async () => {
     const res = await request(app)
       .get("/users/1")
       .set("authorization", `Bearer ${u1Token}`);
     expect(res.statusCode).toEqual(200);
     expect(res.body).toEqual({
       user: {
         id: 1,
         email: 'test1@yahoo.com',
         firstName: 'Test1',
         lastName: 'User1',
         isAdmin: true
       },
     });
   });
   test("should work for non-admin user to get a user", async () => {
     const res = await request(app)
       .get("/users/2")
       .set("authorization", `Bearer ${u2Token}`);
     expect(res.statusCode).toEqual(200);
     expect(res.body).toEqual({
       user: {
         id: 2,
         email: 'test2@yahoo.com',
         firstName: 'Test2',
         lastName: 'User2',
         isAdmin: false
       },
     });
   });
   test("should throw UnauthorizedError for anon user", async () => {
     const res = await request(app).get("/users/1");
     expect(res.statusCode).toEqual(401);
   });
   test("should throw NotFoundError if user not found", async () => {
     const res = await request(app)
       .get("/users/108")
       .set("authorization", `Bearer ${u1Token}`);
     expect(res.statusCode).toEqual(404);
   });
 });

/***** PATCH /users/:id  ********/

describe("PATCH /users/:id", () => {
   test("should update user if admin user", async () => {
     const res = await request(app)
       .patch("/users/1")
       .send({
         firstName: "u1newfirst",
         lastName: "u1newlast",
       })
       .set("authorization", `Bearer ${u1Token}`);
     expect(res.body).toEqual({
       user: {
         id: 1,
         firstName: "u1newfirst",
         lastName: "u1newlast",
         email: "test1@yahoo.com",
         isAdmin: true,
       },
     });
     expect(res.statusCode).toBe(200);
   });
   test("should update user if correct user", async () => {
     const res = await request(app)
       .patch("/users/2")
       .send({
         firstName: "u2newfirst",
         lastName: "u2newlast",
       })
       .set("authorization", `Bearer ${u2Token}`);
     expect(res.body).toEqual({
       user: {
         id: 2,
         firstName: "u2newfirst",
         lastName: "u2newlast",
         email: "test2@yahoo.com",
         isAdmin: false,
       },
     });
     expect(res.statusCode).toBe(200);
   });
   test("should throw UnauthorizedError for anon user", async () => {
     const res = await request(app).patch("/users/101").send({
       firstName: "u1newfirst",
       lastName: "u1newlast",
     });
     expect(res.statusCode).toEqual(401);
   });
   test("should throw UnauthorizedError if not admin or correct user", async () => {
     const res = await request(app)
       .patch("/users/2")
       .send({
         firstName: "u1newfirst",
         lastName: "u1newlast",
       })
       .set("authorization", `Bearer ${u3Token}`);
     expect(res.statusCode).toEqual(401);
   });
   test("should throw NotFoundError if user not found", async () => {
     const res = await request(app)
       .patch("/users/108")
       .send({
         firstName: "u1newfirst",
         lastName: "u1newlast",
       })
       .set("authorization", `Bearer ${u1Token}`);
     expect(res.statusCode).toEqual(404);
   });
   test("should throw BadRequestError if invalid data", async () => {
     const res = await request(app)
       .patch("/users/1")
       .send({
         firstName: 21,
         lastName: 48,
       })
       .set("authorization", `Bearer ${u1Token}`);
     expect(res.statusCode).toEqual(400);
   });
   test("should set new password if admin user", async () => {
     const res = await request(app)
       .patch("/users/1")
       .send({
         firstName: "u1newfirst",
         lastName: "u1newlast",
         password: "newpassword",
       })
       .set("authorization", `Bearer ${u1Token}`);
     expect(res.body).toEqual({
       user: {
        id: 1,
         firstName: "u1newfirst",
         lastName: "u1newlast",
         email: "test1@yahoo.com",
         isAdmin: true,
       },
     });
     const isSuccessful = await User.authenticate("test1@yahoo.com", "newpassword");
     expect(isSuccessful).toBeTruthy();
   });
   test("should set new password if correct user", async () => {
     const res = await request(app)
       .patch("/users/2")
       .send({
         firstName: "u2newfirst",
         lastName: "u2newlast",
         password: "newpassword",
       })
       .set("authorization", `Bearer ${u2Token}`);
     expect(res.body).toEqual({
       user: {
         id: 2,
         firstName: "u2newfirst",
         lastName: "u2newlast",
         email: "test2@yahoo.com",
         isAdmin: false,
       },
     });
     const isSuccessful = await User.authenticate("test2@yahoo.com", "newpassword");
     expect(isSuccessful).toBeTruthy();
   });
   test("should throw UnauthorizedError if not admin or correct user attempting to update password", async () => {
     const res = await request(app)
       .patch("/users/1")
       .send({
         firstName: "u1newfirst",
         lastName: "u1newlast",
         password: "newpassword",
       })
       .set("authorization", `Bearer ${u3Token}`);
     expect(res.statusCode).toEqual(401);
   });
 });
 
 /***** DELETE /users/:id ********/
 
 describe("DELETE /users/:id", () => {
   test("should remove user if admin", async () => {
     const res = await request(app)
       .delete("/users/1")
       .set("authorization", `Bearer ${u1Token}`);
     expect(res.body).toEqual({ deleted: "User number 1" });
   });
   test("should remove user if correct user", async () => {
     const res = await request(app)
       .delete("/users/2")
       .set("authorization", `Bearer ${u2Token}`);
     expect(res.body).toEqual({ deleted: "User number 2" });
   });
   test("should throw UnauthorizedError if anon user", async () => {
     const res = await request(app).delete("/users/1");
     expect(res.statusCode).toBe(401);
   });
   test("should throw UnauthorizedError if user not admin or correct user", async () => {
     const res = await request(app)
       .delete("/users/1")
       .set("authorization", `Bearer ${u2Token}`);
     expect(res.statusCode).toBe(401);
   });
   test("should throw NotFoundError if user not found", async () => {
     const res = await request(app)
       .delete("/users/105")
       .set("authorization", `Bearer ${u1Token}`);
     expect(res.statusCode).toBe(404);
   });
 });
 