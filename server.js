// *** Dependencies
// =============================================================
// const scout = require("@scout_apm/scout-apm");
require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const logger = require("morgan");
const bodyParser = require("body-parser");

// async function start() {
//   // Trigger the download and installation of the core-agent
//   await scout.install({
//     allowShutdown: true, // allow shutting down spawned scout-agent processes from this program
//     monitor: true, // enable monitoring
//     name: "",
//     key: "",
//   });

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 8080;

// Enable the app-wide scout middleware
// app.use(scout.expressMiddleware());

// Use morgan logger for logging requests
app.use(logger("dev"));

// Requiring our models for syncing
const db = require("./models");

// Sets up the Express app to handle data parsing
// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

// Static directory
app.use(express.static("public"));

app.set("view engine", "ejs");

// Routes
require("./routes/html-routes.js")(app);
require("./routes/api-routes.js")(app);

// Syncing our sequelize models and then starting our Express app
db.sequelize.sync().then(function () {
  app.listen(PORT, function () {
    console.log("App listening on PORT " + PORT);
  });
});
// }
