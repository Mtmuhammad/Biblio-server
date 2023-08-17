"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db");
const Subject = require("./subject");

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

/***** create ******/
describe("create", () => {
  const newSubject1 = { name: "test1", creator: 1 };
  const newSubject2 = { name: "test2", creator: 2 };
  test("should create a new subject for user", async () => {
    const res = await Subject.create(newSubject2);
    expect(res).toEqual({ id: 4, ...newSubject2 });
  });
  test("should create a new subject for an admin user", async () => {
    const res = await Subject.create(newSubject1);
    expect(res).toEqual({ id: 5, ...newSubject1 });
  });
  test("should throw error if user does not exist", async () => {
    try {
      await Subject.create({ name: "test3", creator: 3 });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should throw error if subject already exists", async () => {
    try {
      await Subject.create(newSubject1);
      await Subject.create(newSubject1);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/*****findAllSubjects ******/
describe("findAllSubjects", () => {
  test("should find all subjects", async () => {
    const res = await Subject.findAll();
    expect(res.length).toEqual(3);
    expect(res).toEqual([
      { id: 1, name: "General", creator: 1 },
      { id: 2, name: "Ideas", creator: 2 },
      { id: 3, name: "Help", creator: 1 },
    ]);
  });
});

/*****findOne *****/
describe("findOne", () => {
  test("should find a subject", async () => {
    const res = await Subject.findOne(2);
    expect(res).toEqual({ id: 2, name: "Ideas", creator: 2 });
  });
  test("should throw error if subject not found", async () => {
    try {
      await Subject.findOne(4);
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/*****update ******/
describe("update", () => {
  test("should update a field", async () => {
    const res = await Subject.update(2, { name: "Changed" });
    expect(res).toEqual({ id: 2, name: "Changed", creator: 2 });
  });
  test("should throw error if subject not found", async () => {
    try {
      await Subject.update(8, { name: "This is wrong" });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
  test("should throw error if no data included", async () => {
    try {
      await Subject.update(8);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/****remove ******/
describe("remove", () => {
  test("should remove a subject", async () => {
    await Subject.remove(2);
    const res = await db.query("SELECT * FROM subjects WHERE id = 2");
    expect(res.rows.length).toEqual(0);
  });
  test("should throw error if subject not found", async () => {
    try {
      await Subject.remove(8);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
