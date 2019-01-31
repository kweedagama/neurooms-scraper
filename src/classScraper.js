const puppeteer = require("puppeteer");
const pageLinks = require("./links");
const selectors = require("./selectors");

async function scrapeClasses() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(pageLinks.classSearch);
  // try {
  //   await page.waitForNavigation();
  // } catch (e) {
  //   console.log(e);
  // }
  await page.click(selectors.termSelector);
  // let term = await page.$eval(selectors.springTerm2019, e => {
  //   e.setAttribute("value", "201930");
  // });
  await page.waitForSelector(".select2-results");
  await page.evaluate(() => {
    let el = document.getElementById("#201930");
    el.parentElement.parentElement.click();
  });
  await page.click(selectors.termSearch);
  await page.waitForNavigation();
  let res = await page(selectors.termSearch);
  await page.waitForNavigation();
}

scrapeClasses();

exports = { scrapeClasses };
