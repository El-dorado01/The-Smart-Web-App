const path = require("path");
const fs = require("fs");

require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
const { v4: uuidv4 } = require("uuid");
const asyncWrapper = require("../../../middleware/async");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../../errors");
const AuthModel = require("../../../models/AuthModel");
const FindMatesModel = require("../../../models/FindMatesModel");

/*
===================================================================================================
OPERATIONS AS A USER OF FIND MATES TAB
-- Create a profile
-- Activate and deactivate profile (Done with SocketIO)
-- Remove mates from suggestions (Done with SocketIO)
-- Send and accept a match request (Done with SocketIO)
-- Filter Mate Search based on age and gender (Done with SocketIO)
-- Get Nearby mates (Done with SocketIO)
-- Add and remove mates from favourites (Done with SocketIO)
===================================================================================================
*/

const findMates = asyncWrapper(async (req, res) => {
  const page_name = req.path;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  //Check if user has a find mate profile
  const profileInfo = await FindMatesModel.findOne({ userID: user.userId });

  if (profileInfo) {
    //Check the account status
    let accountStatus;
    if (profileInfo.accountStatus == true) {
      //Account is active
      accountStatus = "active";
    } else {
      //Account is not active
      accountStatus = "inactive";
    }

    res.locals.accountStatus = accountStatus;
    res.locals.myFindMateProfile = profileInfo;
    res.status(StatusCodes.OK).render("./dashboard/public/find_mates", {
      headTitle: "Find Mates",
      page_name,
    });
  } else {
    //else show a profile creation page
    res
      .status(StatusCodes.OK)
      .render("./dashboard/public/create_find_mates_profile", {
        headTitle: "Find Mates - Create Profile",
        page_name,
      });
  }
});

const createFindMatesProfile = asyncWrapper(async (req, res) => {
  const {
    firstName,
    otherNames,
    nickname,
    gender,
    age,
    briefInfo,
    height,
    profession,
    preferenceAge,
    preferenceGender,
  } = req.body;
  const { fullBodyImg, selfieImg } = req.files;
  let fullBodyImgPath, selfieImgPath;

  const cookies = req.cookies;
  const token = cookies.jwtAccessToken;
  const payload = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
  const user = {
    userId: payload.userId,
    userName: payload.userName,
  };

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  fullBodyImgAllowedFiles = fullBodyImg.mimetype;
  fullBodyImgFileSize = fullBodyImg.size;

  selfieImgAllowedFiles = selfieImg.mimetype;
  selfieImgFileSize = selfieImg.size;
  maxSize = 5000000;

  if (fullBodyImgAllowedFiles && fullBodyImgAllowedFiles.startsWith("image/")) {
    if (fullBodyImgFileSize > maxSize) {
      res.send("File is too big");
      uploadOk = 0;
    } else {
      if (selfieImgAllowedFiles && selfieImgAllowedFiles.startsWith("image/")) {
        if (selfieImgFileSize > maxSize) {
          res.send("File is too big");
          uploadOk = 0;
        } else {
          const fullBodyImgUUID = uuidv4() + "_";
          const selfieImgUUID = uuidv4() + "_";

          const fullBodyImgName =
            fullBodyImgUUID + fullBodyImg.name.split(".")[0];
          const selfieImgName = selfieImgUUID + selfieImg.name.split(".")[0];

          // ==================Upload selfie image ================== //
          cloudinary.uploader.upload(
            selfieImg.tempFilePath,
            {
              resource_type: "image",
              public_id: `findMates/${selfieImgName}`,
            },
            async function (err, logo) {
              if (err) {
                console.log(err);
                uploadOk = 0;
              } else {
                selfieImgPath = logo.secure_url;
                uploadOk = 1;

                //Delete file from temp folder
                fs.unlinkSync(selfieImg.tempFilePath);
              }
            }
          );

          // ==================Upload full body image ================== //
          cloudinary.uploader.upload(
            fullBodyImg.tempFilePath,
            {
              resource_type: "image",
              public_id: `findMates/${fullBodyImgName}`,
            },
            async function (err, logo) {
              if (err) {
                console.log(err);
                uploadOk = 0;
              } else {
                fullBodyImgPath = logo.secure_url;
                uploadOk = 1;

                //Delete file from temp folder
                fs.unlinkSync(fullBodyImg.tempFilePath);
              }
            }
          );

          if (uploadOk == 1) {
            const profileCreated = await FindMatesModel.create({
              userID: user.userId,
              firstName,
              otherNames,
              nickname,
              gender,
              age,
              briefInfo,
              height,
              profession,
              fullBodyImg: fullBodyImgPath,
              selfieImg: selfieImgPath,
              defaultMateChoice: {
                age: preferenceAge,
                gender: preferenceGender,
              },
            });

            if (profileCreated)
              console.log(
                "Your find mates profile has been created. Profile id: " +
                  profileCreated._id
              );

            res
              .status(StatusCodes.PERMANENT_REDIRECT)
              .redirect("/dashboard/public/find_mates");
          }
        }
      }
    }
  }
});

module.exports = {
  findMates,
  createFindMatesProfile,
};
