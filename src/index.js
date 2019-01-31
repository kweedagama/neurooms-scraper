require("dotenv").config();
let fs = require("fs");
let scraper = require("./scraper");
let db = require("./db/database");

/**
 * Entry point for the program.
 */
async function main() {
  if (process.env.MODE == "db") {
    var classrooms = JSON.parse(fs.readFileSync("output/classrooms.json"));
    await scraper.writeToDb(classrooms);
  } else if (process.env.MODE == "format") {
    var classrooms = JSON.parse(fs.readFileSync("output/classrooms.json"));
  } else {
    scraper.scrapeBuildingInfo();
  }
  db._disconnect();
  return;
}

main();
