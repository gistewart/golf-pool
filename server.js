// *** Dependencies
// =============================================================
const scout = require("@scout_apm/scout-apm");
// var env = process.env.NODE_ENV || "development";
require("dotenv").config();
const express = require("express");
// const ejs = require("ejs");
const logger = require("morgan");
const bodyParser = require("body-parser");

async function start() {
  // Trigger the download and installation of the core-agent
  try {
    await scout.install(
      {
        allowShutdown: true, // allow shutting down spawned scout-agent processes from this program
        monitor: true, // enable monitoring
        // logLevel: "debug",
        name: "chiefs-golf-pool",
        key: "iOsQewUUr2cf8JRFvEsA",
      },
      // Additional scout options
      {
        // logFn: scout.consoleLogFn,
      }
    );
  } catch (err) {
    console.log(err);
  }

  // Sets up the Express App
  // =============================================================
  const app = express();
  const PORT = process.env.PORT || 8080;

  // Enable the app-wide scout middleware
  app.use(scout.expressMiddleware());

  // Use morgan logger for logging requests
  app.use(logger("dev"));

  // Requiring our models for syncing
  const db = require("./models");

  // Sets up the Express app to handle data parsing
  app.use(
    bodyParser.urlencoded({
      extended: false,
    })
  );
  app.use(bodyParser.json());

  // Static directory
  app.use(express.static("public"));

  // app.set("view engine", "ejs");

  // Routes
  require("./routes/html-routes.js")(app);
  require("./routes/api-routes.js")(app);

  // Syncing our sequelize models and then starting our Express app
  db.sequelize.sync().then(function () {
    app.listen(PORT, function () {
      console.log("App listening on PORT " + PORT);
    });
  });
}

// If this script is executed directly, run the start function
if (require.main === module) {
  start();
}
