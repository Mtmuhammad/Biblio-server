/**Helper function to append key/value pair for a users fullName to an obj */
const User = require("../models/user")

const appendName = async (arr) => {
    return Promise.all(
      arr.map(async (a) => {
        return { ...a, fullName: await User.getFullName(a.creatorId) };
      })
    );
}

module.exports = {appendName}