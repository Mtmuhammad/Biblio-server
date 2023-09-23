/** Helper function to return current time in JSON format */

const moment = require("moment");


function getCurrentTime() {
  return moment().format("LT");
}

module.exports = { getCurrentTime };
