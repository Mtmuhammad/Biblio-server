"use strict";

const request = require("supertest");

const app = require("../app");
const { getCurrentDate } = require("../helpers/getCurrentDate");

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

/******* POST /books ******/

describe("POST /books", () => {
  const newBook = {
    collectionId: 1,
    key: "/works/12344)",
    author: "James Baldwin",
    title: "Just Above My Head",
    description: "Test Description 1",
    year: 1979,
  };
  const newBook2 = {
    collectionId: 2,
    key: "/works/123456)",
    author: "James Baldwin",
    title: "Another Country",
    description: "Test Description 2",
    year: 1962,
  };
  test("should work for admin user to add a new book", async () => {
    const res = await request(app)
      .post("/books")
      .send(newBook)
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      book: {
        ...newBook,
        id: 5,
        date: getCurrentDate(),
        status: "No status",
        userId: 1,
      },
    });
  });
  test("should work for non admin user to add a new book", async () => {
    const res = await request(app)
      .post("/books")
      .send(newBook2)
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({
      book: {
        ...newBook2,
        id: 6,
        date: getCurrentDate(),
        status: "No status",
        userId: 2,
      },
    });
  });
  test("should throw UnauthorizedError for anon user", async () => {
    const res = await request(app).post("/books").send(newBook2);
    expect(res.statusCode).toEqual(401);
  });
  test("should throw NotFoundError for unknown user", async () => {
    const res = await request(app)
      .post("/books")
      .send(newBook2)
      .set("authorization", `Bearer ${u3Token}`);
    expect(res.statusCode).toEqual(404);
  });
  test("should throw BadRequestError for missing data", async () => {
    const res = await request(app)
      .post("/books")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(400);
  });
  test("should throw BadRequestError for invalid data", async () => {
    const res = await request(app)
      .post("/books")
      .send({
        collectionId: "bad data",
        key: "/works/12344)",
        author: "James Baldwin",
        title: "Just Above My Head",
        description: "Test Description 1",
        year: "bad data",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toEqual(400);
  });
});

/******GET /books/collection/:id ********/
describe("GET /books", () => {
  test("should work for admin user to get all books", async () => {
    const res = await request(app)
      .get("/books/collection/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      books: [
        {
          id: 1,
          userId: 1,
          key: "/works/978643",
          author: "Ralph Ellison",
          title: "Shadow and Act",
          description: "Brief Description 1",
          year: 1964,
          status: "No status",
          date: getCurrentDate(),
        },
        {
          id: 2,
          userId: 1,
          key: "/works/977643",
          author: "Ralph Ellison",
          title: "The Invisible Man",
          description: "Brief Description 2",
          year: 1952,
          status: "No status",
          date: getCurrentDate(),
        },
      ],
    });
  });
  test("should work for admin user to get all user books", async () => {
    const res = await request(app)
      .get("/books/collection/2")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      books: [
        {
          id: 3,
          userId: 2,
          key: "/works/976643",
          author: "Toni Morrison",
          title: "Beloved",
          description: "Brief Description 3",
          year: 1987,
          status: "No status",
          date: getCurrentDate(),
        },
        {
          id: 4,
          userId: 2,
          key: "/works/975643",
          author: "Toni Morrison",
          title: "The Bluest Eye",
          description: "Brief Description 4",
          year: 1970,
          status: "No status",
          date: getCurrentDate(),
        },
      ],
    });
  });
  test("should work for user to get all books", async () => {
    const res = await request(app)
      .get("/books/collection/2")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      books: [
        {
          id: 3,
          userId: 2,
          key: "/works/976643",
          author: "Toni Morrison",
          title: "Beloved",
          description: "Brief Description 3",
          year: 1987,
          status: "No status",
          date: getCurrentDate(),
        },
        {
          id: 4,
          userId: 2,
          key: "/works/975643",
          author: "Toni Morrison",
          title: "The Bluest Eye",
          description: "Brief Description 4",
          year: 1970,
          status: "No status",
          date: getCurrentDate(),
        },
      ],
    });
  });
});

/******GET /books/:id *******/
describe("GET /books/:id", () => {
  test("should work for user to find a saved book", async () => {
    const res = await request(app)
      .get("/books/3")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      book: {
        id: 3,
        userId: 2,
        collectionId: 2,
        key: "/works/976643",
        author: "Toni Morrison",
        title: "Beloved",
        description: "Brief Description 3",
        year: 1987,
        status: "No status",
        date: getCurrentDate(),
      },
    });
  });
  test("should work for admin user to find a saved book", async () => {
    const res = await request(app)
      .get("/books/2")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      book: {
        id: 2,
        collectionId: 1,
        userId: 1,
        key: "/works/977643",
        author: "Ralph Ellison",
        title: "The Invisible Man",
        description: "Brief Description 2",
        year: 1952,
        status: "No status",
        date: getCurrentDate(),
      },
    });
  });
  test("should throw NotFoundError if book does not exist", async () => {
    const res = await request(app)
      .get("/books/6")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toBe(404);
  });
});

/*****PATCH /books/:id *******/
describe("PATCH /books/:id", () => {
  test("should allow admin user to update a book field", async () => {
    const res = await request(app)
      .patch("/books/2")
      .send({ collectionId: 2 })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      book: {
        id: 2,
        collectionId: 2,
        userId: 1,
        key: "/works/977643",
        author: "Ralph Ellison",
        title: "The Invisible Man",
        description: "Brief Description 2",
        year: 1952,
        status: "No status",
        date: getCurrentDate(),
      },
    });
  });
  test("should allow admin user to update multiple book fields", async () => {
    const res = await request(app)
      .patch("/books/2")
      .send({ collectionId: 2, status: "currently reading" })
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      book: {
        id: 2,
        collectionId: 2,
        userId: 1,
        key: "/works/977643",
        author: "Ralph Ellison",
        title: "The Invisible Man",
        description: "Brief Description 2",
        year: 1952,
        status: "currently reading",
        date: getCurrentDate(),
      },
    });
  });
  test("should allow user to update a book field", async () => {
    const res = await request(app)
      .patch("/books/3")
      .send({ collectionId: 1 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      book: {
        id: 3,
        userId: 2,
        collectionId: 1,
        key: "/works/976643",
        author: "Toni Morrison",
        title: "Beloved",
        description: "Brief Description 3",
        year: 1987,
        status: "No status",
        date: getCurrentDate(),
      },
    });
  });
  test("should allow user to update a book field", async () => {
    const res = await request(app)
      .patch("/books/3")
      .send({ collectionId: 1, status: "currently reading" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      book: {
        id: 3,
        userId: 2,
        collectionId: 1,
        key: "/works/976643",
        author: "Toni Morrison",
        title: "Beloved",
        description: "Brief Description 3",
        year: 1987,
        status: "currently reading",
        date: getCurrentDate(),
      },
    });
  });
  test("should throw BadRequestError if invalid data submitted", async () => {
    const res = await request(app)
      .patch("/books/3")
      .send({ collectionId: "yes" })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(400);
  });

  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app)
      .patch("/books/3")
      .send({ collectionId: "yes" });
    expect(res.statusCode).toBe(401);
  });
  test("should throw ForbiddenError if not admin or correct user", async () => {
    const res = await request(app)
      .patch("/books/1")
      .send({ collectionId: 1 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(403);
  });
  test("should throw NotFoundError if book doesn't exist", async () => {
    const res = await request(app)
      .patch("/books/8")
      .send({ collectionId: 1 })
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(404);
  });
});

/*****DELETE /books/:id *******/
describe("DELETE /books/:id", () => {
  test("should allow admin user to remove books", async () => {
    const res = await request(app)
      .delete("/books/1")
      .set("authorization", `Bearer ${u1Token}`);
    expect(res.body).toEqual({ deleted: "Book id: 1" });
  });
  test("should allow user to remove books", async () => {
    const res = await request(app)
      .delete("/books/3")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.body).toEqual({ deleted: "Book id: 3" });
  });
  test("should throw UnauthorizedError if anon user", async () => {
    const res = await request(app).delete("/books/1");
    expect(res.statusCode).toBe(401);
  });
  test("should throw ForbiddenError if not admin or correct user", async () => {
    const res = await request(app)
      .delete("/books/1")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(403);
  });
  test("should throw NotFoundError if book doesn't exist", async () => {
    const res = await request(app)
      .delete("/books/8")
      .set("authorization", `Bearer ${u2Token}`);
    expect(res.statusCode).toBe(404);
  });
});
