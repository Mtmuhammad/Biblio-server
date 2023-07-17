"use strict";

describe("Config can come from env", () => {
  test("should work with env", () => {
    process.env.SECRET_KEY = "abc";
    process.env.PORT = "5000";
    process.env.DATABASE_URL = "other";
    process.env.NODE_ENV = "another";

    const config = require("./config");
    expect(config.SECRET_KEY).toEqual("abc");
    expect(config.PORT).toEqual(5000);
    expect(config.getDatabaseUri()).toEqual("other");
    expect(config.BCRYPT_WORK_FACTOR).toEqual(13);

    delete process.env.SECRET_KEY;
    delete process.env.PORT;
    delete process.env.DATABASE_URL;
    delete process.env.NODE_ENV;

    expect(config.getDatabaseUri()).toEqual("biblio");
    process.env.NODE_ENV = "test";

    expect(config.getDatabaseUri()).toEqual("biblio_test");
  });
});
