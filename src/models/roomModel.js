var mongoose = require("mongoose");

var RoomSchema = new mongoose.Schema({
  name: { type: String, required: "Classroom must have a name" },
  building: { type: String, required: "Room must have a building" },
  capacity: { type: Number, required: "The capacity is required" },
  techType: { type: String },
  furniture: { type: String },
  technology: { type: Array },
  images: { type: Array },
  status: { type: String, default: "open" },
  linkTo: { type: String }
});

module.exports = mongoose.model("Room", RoomSchema);
