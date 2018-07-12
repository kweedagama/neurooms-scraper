let fs = require("fs");
const puppeteer = require("puppeteer");
const selectors = require("./selectors");
const credentials = require("./creds");
const pageLinks = require("./links");

/**
 * Logs into the page if the login screen is present and returns true. Will return false
 * if the login screen is not present or the promise is rejected.
 * @param {*} page
 */
async function tryLogin(page) {
  try {
    await page.waitForNavigation("domcontentloaded");
    await page.click(selectors.login);
    await page.click(selectors.login);
    await page.click(selectors.username);
    await page.keyboard.type(credentials.username);
    await page.click(selectors.password);
    await page.keyboard.type(credentials.password);
    await page.click(selectors.login_button);
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
  return;
}

async function getRoomLinks(page) {
  let roomHandles = await page.$$(selectors.roomLink);
  for (var i = 0; i < roomLinks.length; i++) {
    let link = await roomHandles[i].getProperty("href");
  }
}

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(pageLinks.loginPageToClassHome);
    await tryLogin(page);
    let buildingHandles = await page.$$(selectors.buildingLink);
    for (var i = 0; i < buildingHandles.length; i++) {
      let link = await buildingHandles[i].getProperty("href");
      goToBuildingPage(link._remoteObject.value, await browser.newPage());
    }
    await browser.close();
  } catch (e) {
    console.log(e);
    return;
  }
})();
