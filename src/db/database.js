require("dotenv");
let mongoose = require("mongoose");

const server = process.env.MONGO;
const db = "neu-rooms";

/**
 * Class to create and close mongodb connection and mongoose instance.
 */
class Database {
  constructor() {
    this._connect();
  }
  _connect() {
    if(!server || !db) {
      throw new Error("Mongo server or db not supplied");
    }
    mongoose
      .connect(`mongodb://${server}/${db}`)
      .then(() => {
        console.log("Database connection successful.");
      })
      .catch(err => {
        console.error("Database connection error.");
      });
  }
  _disconnect() {
    mongoose
      .disconnect()
      .then(() => {
        console.log("Successfully closed db connection.");
      })
      .catch(err => {
        console.log("Connection not closed. Something went wrong.");
        console.log(err);
      });
  }
}

module.exports = new Database();
