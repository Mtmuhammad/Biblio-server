"use strict";

/**Routes for subjects. */

const jsonschema = require("jsonschema");
const express = require("express");
const { ensureLoggedIn, checkUser } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const Subject = require("../models/subject");
const subjectNewSchema = require("../schemas/subjectNew.json");
const subjectUpdateSchema = require("../schemas/subjectUpdate.json");

const router = express.Router();

/**POST "/" => {subject}
 *
 * Adds a new forum subject. Any user can add a new subject.
 *
 * Data can include:
 * {name, creator}
 *
 * This returns newly added subject:
 * Returns => {id, name, creator}
 *
 * Authorization required: login
 */

router.post("/", ensureLoggedIn, async (req, res, next) => {
  try {
    //get current user data and validate current request info with schema
    const currentUser = res.locals.user;
    const validator = jsonschema.validate(
      { ...req.body, creator: currentUser.id },
      subjectNewSchema
    );
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    //create new subject
    const subject = await Subject.create({
      ...req.body,
      creator: currentUser.id,
    });

    return res.status(201).json({ subject });
  } catch (err) {
    return next(err);
  }
});

/**GET "/" => {subjects:[{subject}, {...}]}
 *
 * Returns all subjects.
 *
 * Authorization required: login
 */
router.get("/", ensureLoggedIn, async (req, res, next) => {
  try {
    const subjects = await Subject.findAll();
    return res.json({ subjects });
  } catch (err) {
    return next(err);
  }
});

/**GET "/:id" => {subject:{subject}}
 *
 * Given a subject id, returns info about the subject.
 *
 * Authorization required: login
 */

router.get("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    const subject = await Subject.findOne(req.params.id);
    return res.json({ subject });
  } catch (err) {
    return next(err);
  }
});

/**PATCH "/subjects/:id" => {subject: {subject}}
 *
 * Given a subject id, updates the subject.
 *
 * Only admin users or users who created the subject are allowed to edit it.
 *
 * Data can include:
 * {name}
 *
 * This returns:
 * {id, name, creator}
 *
 * Authorization required: login and correct user or admin
 */

router.patch("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    // check data submitted with schema
    const validator = jsonschema.validate(req.body, subjectUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    // check if correct user or admin
    const currUser = res.locals.user;
    const found = await Subject.findOne(req.params.id);
    checkUser(found, currUser);

    // update subject
    const subject = await Subject.update(req.params.id, req.body);
    return res.json({ subject });
  } catch (err) {
    return next(err);
  }
});

/**DELETE "/:id" => {deleted: Subject id "id"}
 *
 * Deletes subject.
 *
 * Authorization required: login and correct user or admin
 */

router.delete("/:id", ensureLoggedIn, async (req, res, next) => {
  try {
    // check if correct user or admin
    const currUser = res.locals.user;
    const found = await Subject.findOne(req.params.id);
    checkUser(found, currUser);

    // remove subject
    await Subject.remove(req.params.id);
    return res.json({ deleted: `Subject id: ${req.params.id}` });
  } catch (err) {
    return next(err);
  }
});
module.exports = router;
