var admin = require("firebase-admin");
var endpoints = require("./endpoints.json");
var serviceAccount = require("./neurooms.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: endpoints.databaseURL
});

var db = admin.firestore();

module.exports = { db };
