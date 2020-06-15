const multer = require("multer");
const path = require("path");
const bodyParser = require("body-parser");
require("dotenv").config();

module.exports = function (app) {
  //Set Storage Engine
  const storage = multer.diskStorage({
    destination: "./public/images",
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

  // Init Upload
  const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function (req, file, cb) {
      checkFileType(file, cb);
    },
  }).single("myImage");

  function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/i;
    const extname = filetypes.test(path.extname(file.originalname));
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb("Error: images only!");
    }
  }
  app.post("/upload", (req, res) => {
    var temp = req.body.poolsterSelected;
    console.log("temp:" + temp);
    upload(req, res, (err) => {
      if (err) {
        res.render("index", {
          msg: err,
        });
      } else if (req.file == undefined) {
        res.render("index", {
          msg: "Error: no file selected!",
        });
      } else {
        res.render("index", {
          msg: "File uploaded successfully!",
          file: `images/${req.file.filename}`,
        });
        console.log(req.file);
      }
    });
  });
};
