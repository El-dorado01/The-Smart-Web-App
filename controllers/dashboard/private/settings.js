const path = require("path");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");
const { StatusCodes } = require("http-status-codes");

require("express-async-errors");
const AuthModel = require("../../../models/AuthModel");
const asyncWrapper = require("../../../middleware/async");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../../errors");

const settingsForm = (req, res) => {
  const page_name = req.path;
  res
    .status(StatusCodes.OK)
    .render("./dashboard/private/settings", {
      headTitle: "Settings",
      page_name,
    });
};

const avatarUpload = asyncWrapper(async (req, res) => {
  let sampleFile;
  let uploadPath;
  let fileName;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).send("No files were uploaded.");
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  sampleFile = req.files.avatar;
  fileName = uuidv4() + "-" + sampleFile.name;
  allowedFiles = req.files.avatar.mimetype;
  fileSize = req.files.avatar.size;
  maxSize = 5000000;

  uploadPath = path.join(__dirname, "../../../public/uploads", fileName);

  if (!allowedFiles || !allowedFiles.startsWith("image/")) {
    res.send("File type not allowed");
  } else if (fileSize > maxSize) {
    res.send("File is too big");
  } else {
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(uploadPath, async function (err) {
      if (err) {
        return res.status(500).send(err);
      } else {
        const cookies = req.cookies;
        const token = cookies.jwtAccessToken;
        const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);

        req.user = {
          userId: payload.userId,
          userName: payload.userName,
        };

        // console.log(fileName);
        const user = await AuthModel.findByIdAndUpdate(req.user.userId, {
          avatar: fileName,
        });
        res.status(StatusCodes.CREATED).redirect("/dashboard/private/settings");
      }
    });
  }
});

module.exports = {
  settingsForm,
  avatarUpload,
};
