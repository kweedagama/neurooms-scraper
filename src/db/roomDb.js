var Room = require("../models/roomModel");

/**
 * Send classroom data to the firebase db.
 * @param {*} classrooms
 */
function writeToDb(classrooms) {
  for (var i = 0; i < classrooms.length; i++) {
    let room = classrooms[i];
    Room.replaceOne(
      { name: room.name },
      room,
      {
        upsert: true
      },
      function(err, res) {
        console.log(res);
      }
    );
  }
}

module.exports = { writeToDb };
