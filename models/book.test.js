"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");
const Book = require("./book");
const { getCurrentDate } = require("../helpers/getCurrentDate");

const {
  commonAfterAll,
  commonAfterEach,
  commonBeforeEach,
  commonBeforeAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/****add ******/
describe("add", () => {
  const newBook1 = {
    collectionId: 1,
    userId: 1,
    key: "/works/12344)",
    author: "James Baldwin",
    title: "Just Above My Head",
    description: "Test Description 1",
    year: 1979,
  };
  const newBook2 = {
    collectionId: 2,
    userId: 2,
    key: "/works/123456)",
    author: "James Baldwin",
    title: "Another Country",
    description: "Test Description 2",
    year: 1962,
  };
  test("should add a book to user collection", async () => {
    const res = await Book.add(newBook1);
    expect(res).toEqual({
      id: 5,
      status: "No status",
      date: getCurrentDate(),
      ...newBook1,
    });
  });
  test("should add a book to an admin user collection", async () => {
    const res = await Book.add(newBook2);
    expect(res).toEqual({
      id: 6,
      status: "No status",
      date: getCurrentDate(),
      ...newBook2,
    });
  });
  test("should throw error if book already exists in collection", async () => {
    try {
      await Book.add(newBook1);
      await Book.add(newBook1);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
  test("should throw error if user does not exist", async () => {
    const newBook3 = {
      collectionId: 2,
      userId: 5,
      key: "/works/123456)",
      author: "James Baldwin",
      title: "Another Country",
      description: "Test Description 2",
      year: 1962,
    };
    try {
      await Book.add(newBook3);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/****findAll*****/
describe("findAll", () => {
  test("should find all books in a user collection", async () => {
    const res = await Book.findAll(1);
    expect(res.length).toEqual(2);
    expect(res).toEqual([
      {
        author: "Ralph Ellison",
        date: getCurrentDate(),
        description: "Brief Description 1",
        id: 1,
        key: "/works/978643",
        title: "Shadow and Act",
        userId: 1,
        year: 1964,
        status: "No status",
      },
      {
        author: "Ralph Ellison",
        date: getCurrentDate(),
        description: "Brief Description 2",
        id: 2,
        key: "/works/977643",
        title: "The Invisible Man",
        userId: 1,
        year: 1952,
        status: "No status",
      },
    ]);
  });
  test("should find all books in an admin user collection", async () => {
    const res = await Book.findAll(2);
    expect(res.length).toEqual(2);
    expect(res).toEqual([
      {
        author: "Toni Morrison",
        date: getCurrentDate(),
        description: "Brief Description 3",
        id: 3,
        key: "/works/976643",
        title: "Beloved",
        userId: 2,
        year: 1987,
        status: "No status",
      },
      {
        author: "Toni Morrison",
        date: getCurrentDate(),
        description: "Brief Description 4",
        id: 4,
        key: "/works/975643",
        title: "The Bluest Eye",
        userId: 2,
        year: 1970,
        status: "No status",
      },
    ]);
  });
});

/****findOne *****/
describe("findOne", () => {
  test("should find a book from a user collection", async () => {
    const res = await Book.findOne(4);
    expect(res).toEqual({
      id: 4,
      collectionId: 2,
      userId: 2,
      key: "/works/975643",
      author: "Toni Morrison",
      title: "The Bluest Eye",
      description: "Brief Description 4",
      year: 1970,
      date: getCurrentDate(),
      status: "No status",
    });
  });
  test("should find a book from an admin user collection", async () => {
    const res = await Book.findOne(2);
    expect(res).toEqual({
      id: 2,
      collectionId: 1,
      userId: 1,
      key: "/works/977643",
      author: "Ralph Ellison",
      title: "The Invisible Man",
      description: "Brief Description 2",
      year: 1952,
      date: getCurrentDate(),
      status: "No status",
    });
  });
  test("should throw error if book is not found", async () => {
    try {
      await Book.findOne(8);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*****update ******/
describe("update", () => {
  test("should update user book field", async () => {
    const res = await Book.update(4, { status: "Currently Reading" });
    expect(res).toEqual({
      id: 4,
      collectionId: 2,
      userId: 2,
      key: "/works/975643",
      author: "Toni Morrison",
      title: "The Bluest Eye",
      description: "Brief Description 4",
      year: 1970,
      date: getCurrentDate(),
      status: "Currently Reading",
    });
  });
  test("should update multiple user book fields", async () => {
    const res = await Book.update(4, {
      status: "Currently Reading",
      key: "/works/877543",
    });
    expect(res).toEqual({
      id: 4,
      collectionId: 2,
      userId: 2,
      key: "/works/877543",
      author: "Toni Morrison",
      title: "The Bluest Eye",
      description: "Brief Description 4",
      year: 1970,
      date: getCurrentDate(),
      status: "Currently Reading",
    });
  });
  test("should update admin user book field", async () => {
    const res = await Book.update(2, { status: "Currently Reading" });
    expect(res).toEqual({
      id: 2,
      collectionId: 1,
      userId: 1,
      key: "/works/977643",
      author: "Ralph Ellison",
      title: "The Invisible Man",
      description: "Brief Description 2",
      year: 1952,
      date: getCurrentDate(),
      status: "Currently Reading",
    });
  });
  test("should update multiple admin user book fields", async () => {
    const res = await Book.update(2, {
      status: "Currently Reading",
      key: "/works/877543",
    });
    expect(res).toEqual({
      id: 2,
      collectionId: 1,
      userId: 1,
      key: "/works/877543",
      author: "Ralph Ellison",
      title: "The Invisible Man",
      description: "Brief Description 2",
      year: 1952,
      date: getCurrentDate(),
      status: "Currently Reading",
    });
  });
  test("should throw error if book not found", async () => {
    try {
      await Book.update(8,{
        status: "Currently Reading",
        key: "/works/877543",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should throw error if no data included", async () => {
    try {
      await Book.update(8);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/****remove ******/
describe("remove", () => {
  test("should remove a user book", async () => {
    await Book.remove(2);
    const res = await db.query("SELECT * FROM books WHERE id = 2");
    expect(res.rows.length).toEqual(0);
  });
  test("should remove an admin user book", async () => {
    await Book.remove(1);
    const res = await db.query("SELECT * FROM books WHERE id = 1");
    expect(res.rows.length).toEqual(0);
  });
  test("should throw error if book not found", async () => {
    try {
      await Book.remove(8);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});