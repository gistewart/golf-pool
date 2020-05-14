// *** Dependencies
// =============================================================
require("dotenv").config();
var express = require("express");
var logger = require("morgan");

// Require axios and cheerio. This makes the scraping possible
// var axios = require("axios");
// var cheerio = require("cheerio");

// Sets up the Express App
// =============================================================
var app = express();
var PORT = process.env.PORT || 8080;

// Use morgan logger for logging requests
app.use(logger("dev"));

// Requiring our models for syncing
var db = require("./models");

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static directory
app.use(express.static("public"));

// Routes
// =============================================================
// require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

// Syncing our sequelize models and then starting our Express app
// =============================================================
db.sequelize.sync().then(function () {
  app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
  });
});
