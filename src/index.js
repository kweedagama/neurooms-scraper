require("dotenv").config();
let fs = require("fs");
const puppeteer = require("puppeteer");
const selectors = require("./selectors");
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
    await page.keyboard.type(process.env.HUSKY_USER);
    await page.click(selectors.password);
    await page.keyboard.type(process.env.HUSKY_PASSWORD);
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
 * Scrapes the building page for the room names and the coresponding links.
 * @param {*} page
 * @returns {Object} containing building name and array of room names and links.
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
  page.close();
  return { building: buildingName, links: roomLinks };
}

/**
 * Opens new page and scrapes page for room data.
 * Returns data in format -> name, linkTo, details, imageLinks
 * @param {Browser} browser
 * @param {String} roomName
 * @param {String} roomLink
 */
async function getRoomData(browser, roomName, roomLink) {
  const page = await browser.newPage();
  await page.goto(roomLink);
  const content = await page.$(selectors.roomInfo);
  let details = await content.$eval(
    selectors.roomContent,
    (n, selectors) => {
      var tech = [];
      n.querySelectorAll(selectors.roomTech).forEach(function(x) {
        tech.push(x.innerHTML.trim());
      });
      return {
        capacity: n.querySelector(selectors.roomCapacity).innerHTML,
        type: n.querySelector(selectors.roomType).textContent.trim(),
        furnitureStyle: n
          .querySelector(selectors.roomFormat)
          .textContent.trim(),
        technology: tech
      };
    },
    selectors
  );
  const carousel = await page.$(selectors.roomCarousel);
  let imgLinks = await carousel.$$eval(selectors.roomImages, nodes => {
    var images = [];
    images = nodes.map(n => n.src);
    return images;
  });
  page.close();
  return {
    room: roomName,
    linkTo: roomLink,
    details: details,
    images: imgLinks
  };
}

(async () => {
  try {
    const browser = await puppeteer.launch();
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
    let classrooms = [];
    for (var i = 0; i < buildings.length; i++) {
      classrooms.push({ building: buildings[i].building, rooms: [] });
      for (var j = 0; j < buildings[i].links.length; j++) {
        classrooms[i].rooms.push(
          await getRoomData(
            browser,
            buildings[i].links[j].roomName,
            buildings[i].links[j].linkTo
          )
        );
      }
    }
    fs.writeFile("output/classrooms.json", JSON.stringify(classrooms), err => {
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
