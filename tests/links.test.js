var puppeteer = require("puppeteer");
var fs = require("fs");

/**
 * Sets up the testing environment.
 */
async function setup() {
  var browser = await puppeteer.launch();
  var page = browser.newPage();
  return page;
}

test("makes sure each room link is working", () => {});
