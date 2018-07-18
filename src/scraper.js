let fs = require("fs");
const puppeteer = require("puppeteer");
const selectors = require("./selectors");
const credentials = require("./creds");
const pageLinks = require("./links");
var admin = require("firebase-admin");

var serviceAccount = require("./neurooms.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://neurooms.firebaseio.com"
});

var db = admin.firestore();

/**
 * Logs into the page if the login screen is present and returns true. Will return false
 * if the login screen is not present or the promise is rejected.
 * @param {*} page
 */
async function tryLogin(page) {
  try {
    await page.click(selectors.username);
    await page.keyboard.type(credentials.username);
    await page.click(selectors.password);
    await page.keyboard.type(credentials.password);
    await page.click(selectors.loginButton);
    await page.waitForNavigation();
    return true;
  } catch (e) {
    console.log("Something went wrong or the user is already logged in.");
    console.log(e);
    return false;
  }
}

/**
 * Goes to building page and starts the scraper for each room in building.
 * If login is required it will try and login.
 * @param {*} buildingLink
 * @param {*} page
 */
async function goToBuildingPage(buildingLink, page) {
  if (page === null || page === undefined) {
    console.log("No page given. Launcing new page.");
    const browser = await puppeteer.launch();
    page = await browser.newPage();
  }
  await page.goto(buildingLink);
  let buildingName = await page.$eval(
    selectors.buildingName,
    el => el.innerHTML
  );
  return await getRoomLinks(page, buildingName);
}

/**
 *
 * @param {*} page
 */
async function getRoomLinks(page, buildingName) {
  let grid = await page.$(selectors.roomGrid);
  let roomLinks = [];
  try {
    roomLinks = await grid.$$eval(selectors.roomLink, nodes =>
      nodes.map(n => {
        return {
          roomName: n.querySelector("span").innerHTML,
          linkTo: n.href
        };
      })
    );
  } catch (e) {
    console.log(e);
  }
  console.log(roomLinks[0]);
  return { building: buildingName, links: roomLinks };
}

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(pageLinks.loginPageToClassHome);
    await page.waitForSelector(selectors.loginButton);
    await tryLogin(page);
    try {
      await page.waitForNavigation();
    } catch (e) {
      console.log(e);
    }
    let buildingHandles = await page.$$(selectors.buildingLink);
    let buildings = [];
    for (var i = 0; i < buildingHandles.length; i++) {
      let link = await buildingHandles[i].getProperty("href");
      buildings.push(
        await goToBuildingPage(
          link._remoteObject.value,
          await browser.newPage()
        )
      );
    }
    fs.writeFile("output/buildings.json", JSON.stringify(buildings), err => {
      if (err) {
        console.log(err);
      }
    });
    await browser.close();
  } catch (e) {
    console.log(e);
    return;
  }
})();
