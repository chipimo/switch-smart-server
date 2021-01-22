var express = require("express");
var formidable = require("formidable");
var cloudinary = require("cloudinary").v2;
const uuidv4 = require("uuid/v4");
const fs = require("fs-extra");
const io = require("../index").io;

const { _updateUserProfile } = require("../db/queries");

const router = express.Router();

function CreateId() {
  return uuidv4();
}

router.post("/", (req, res) => {
  const form = new formidable.IncomingForm();
  form.uploadDir = "./uploads";
  form.keepExtensions = true;
  form.parse(req, (error, fields, files) => {
    if (error) {
      res.status(400).json({
        result: "faild",
        data: {},
        message: `Cannot upload image. Error: ${error}`
      });
    }
    if (files.photo.name) {
      var fileName = CreateId();

      cloudinary.uploader.upload(
        files.photo.path,
        { public_id: `profile/${fileName}`, tags: "profile" },
        function(error, result) {
          if (error) {
            res.json({
              result: false,
              message: `Image faild to upload. Error: ${error}`
            });
          }
          if (result) {
            const userId = {
              token: req.headers.authorization,
              result
            };
            _updateUserProfile(userId, callback => {
              fs.remove(files.photo.path, err => {
                if (err) return console.error(err);

                console.log("success!");
              });
              res.json({
                result: true,
                userInfo: callback.userData.credentials,
                message: "Image uploaded sucessfuly "
              });
              io.emit('NEW_USER_ADDED', callback.userData.credentials);
            });
          }
        }
      );
    }
  });
});

module.exports = router;
