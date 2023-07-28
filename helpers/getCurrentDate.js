/** Helper function to return current date in JSON format */

const moment = require("moment");

function getCurrentDate() {
  return moment().format("L").split("/").join("-");
}

module.exports = { getCurrentDate };
