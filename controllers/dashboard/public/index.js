const path = require("path");
const fs = require("fs");

require("express-async-errors");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;
const FeedpostsModel = require("../../../models/FeedpostModel");
const asyncWrapper = require("../../../middleware/async");
const { v4: uuidv4 } = require("uuid");
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require("../../../errors");

const homePage = (req, res) => {
  const page_name = req.path;
  res
    .status(StatusCodes.OK)
    .render("./dashboard/public/index", { headTitle: "Feeds", page_name });
};

const singlePost = asyncWrapper(async (req, res) => {
  const page_name = req.path;
  res.status(StatusCodes.OK).render("./dashboard/public/feed_single", {
    headTitle: "Feeds",
    page_name,
  });
});

const handlePosts = asyncWrapper(async (req, res) => {
  const {
    poster,
    qoutedPost,
    commentedPost,
    altText,
    whoCanComment,
    whoCanSee,
    posts,
    checkSavePost,
  } = req.body;

  var newPost = JSON.parse(posts);
  var threadID = uuidv4();

  for (let i = 0; i < newPost.length; i++) {
    const element = newPost[i];

    var textValue = element.textValue;
    var files = element.files;

    let filePaths = [];
    // let isAllow = true;
    let newFilePath;
    let uploadOk = 1;

    maxSize = 7000000;

    if (files.length > 0) {
      for (let a = 0; a < files.length; a++) {
        var fileUpload = req.files[files[a]];

        // ==============================VIDEO UPLOAD======================== //
        if (fileUpload.mimetype && fileUpload.mimetype === "video/mp4") {
          //Check each file size
          if (fileUpload.size > maxSize) {
            res.json({ bigFile: true });
            uploadOk = 0;
          } else {
            // allowedFiles = fileUpload.mimetype;
            // isAllow = true;

            const file = fileUpload;

            const fileUUID = uuidv4() + "_";
            const fileName = fileUUID + file.name.split(".")[0];

            // =========================Upload Movies ===================== //
            await cloudinary.uploader.upload(
              file.tempFilePath,
              {
                resource_type: "video",
                public_id: `FeedPosts/${fileName}`,
                eager: [
                  {
                    width: 300,
                    height: 300,
                    crop: "pad",
                    audio_codec: "none",
                  },
                  {
                    width: 160,
                    height: 100,
                    crop: "crop",
                    gravity: "south",
                    audio_codec: "none",
                  },
                ],
              },
              async function (err, newFile) {
                if (err) {
                  console.log(err);
                  uploadOk = 0;
                } else {
                  newFilePath = newFile.secure_url;
                  if (altText == "") {
                    filePaths.push({
                      filePath: newFilePath,
                      altText: "null",
                    });
                  } else {
                    filePaths.push({
                      filePath: newFilePath,
                      altText,
                    });
                  }
                  uploadOk = 1;
                }
              }
            );
            fs.unlinkSync(file.tempFilePath);
          }
        }

        // ==============================IMAGE UPLOAD============================ //
        else if (
          fileUpload.mimetype &&
          fileUpload.mimetype.startsWith("image/")
        ) {
          //Check each file size
          if (fileUpload.size > maxSize) {
            res.json({ bigFile: true });
            uploadOk = 0;
          } else {
            const file = fileUpload;

            const fileUUID = uuidv4() + "_";
            const fileName = fileUUID + file.name.split(".")[0];
            // ==================Upload Photos ================== //
            await cloudinary.uploader.upload(
              file.tempFilePath,
              {
                resource_type: "image",
                public_id: `FeedPosts/${fileName}`,
              },
              function (err, newFile) {
                if (err) {
                  console.log(err);
                  uploadOk = 0;
                } else {
                  newFilePath = newFile.secure_url;
                  if (altText == "") {
                    filePaths.push({
                      filePath: newFilePath,
                      altText: "null",
                    });
                  } else {
                    filePaths.push({
                      filePath: newFilePath,
                      altText,
                    });
                  }
                  uploadOk = 1;
                }
              }
            );
            fs.unlinkSync(file.tempFilePath);
          }
        }
      }
    }

    if (uploadOk == 1) {
      // ========================Save Data to database=================== //
      if (checkSavePost == "true") {
        const success = await FeedpostsModel.create({
          poster,
          postText: textValue,
          files: filePaths,
          qoutedPost: [{ postID: qoutedPost }],
          commentedPost: [{ postID: commentedPost }],
          saved: true,
          whoCanComment,
          whoCanSee,
          threadID,
        });
      } else {
        const success = await FeedpostsModel.create({
          poster,
          postText: textValue,
          files: filePaths,
          qoutedPost: [{ postID: qoutedPost }],
          commentedPost: [{ postID: commentedPost }],
          whoCanComment,
          whoCanSee,
          threadID,
        });
      }
      // ========================Save Data to database=================== //
      // const success = await FeedpostsModel.create({
      //   poster,
      //   postText: textValue,
      //   files: filePaths,
      //   qoutedPost: [{ postID: qoutedPost }],
      //   commentedPost: [{ postID: commentedPost }],
      //   whoCanComment,
      //   whoCanSee,
      //   threadID,
      // });
    }
  }
  res.json({ success: "true" });
});

// const savePosts = asyncWrapper(async (req, res) => {
//   const {
//     poster,
//     qoutedPost,
//     commentedPost,
//     altText,
//     whoCanComment,
//     whoCanSee,
//     posts,
//   } = req.body;

//   var newPost = JSON.parse(posts);
//   var threadID = uuidv4();

//   for (let i = 0; i < newPost.length; i++) {
//     const element = newPost[i];

//     var textValue = element.textValue;
//     var files = element.files;

//     let filePaths = [];
//     // let isAllow = true;
//     let newFilePath;
//     let uploadOk = 1;

//     maxSize = 7000000;

//     if (files.length > 0) {
//       for (let a = 0; a < files.length; a++) {
//         var fileUpload = req.files[files[a]];

//         // ==============================VIDEO UPLOAD======================== //
//         if (fileUpload.mimetype && fileUpload.mimetype === "video/mp4") {
//           //Check each file size
//           if (fileUpload.size > maxSize) {
//             res.json({ bigFile: true });
//             uploadOk = 0;
//           } else {
//             // allowedFiles = fileUpload.mimetype;
//             // isAllow = true;

//             const file = fileUpload;

//             const fileUUID = uuidv4() + "_";
//             const fileName = fileUUID + file.name.split(".")[0];

//             // =========================Upload Movies ===================== //
//             await cloudinary.uploader.upload(
//               file.tempFilePath,
//               {
//                 resource_type: "video",
//                 public_id: `FeedPosts/${fileName}`,
//                 eager: [
//                   {
//                     width: 300,
//                     height: 300,
//                     crop: "pad",
//                     audio_codec: "none",
//                   },
//                   {
//                     width: 160,
//                     height: 100,
//                     crop: "crop",
//                     gravity: "south",
//                     audio_codec: "none",
//                   },
//                 ],
//               },
//               async function (err, newFile) {
//                 if (err) {
//                   console.log(err);
//                   uploadOk = 0;
//                 } else {
//                   newFilePath = newFile.secure_url;
//                   if (altText == "") {
//                     filePaths.push({
//                       filePath: newFilePath,
//                       altText: "null",
//                     });
//                   } else {
//                     filePaths.push({
//                       filePath: newFilePath,
//                       altText,
//                     });
//                   }
//                   uploadOk = 1;
//                 }
//               }
//             );
//           }
//         }

//         // ==============================IMAGE UPLOAD============================ //
//         else if (
//           fileUpload.mimetype &&
//           fileUpload.mimetype.startsWith("image/")
//         ) {
//           //Check each file size
//           if (fileUpload.size > maxSize) {
//             res.json({ bigFile: true });
//             uploadOk = 0;
//           } else {
//             const file = fileUpload;

//             const fileUUID = uuidv4() + "_";
//             const fileName = fileUUID + file.name.split(".")[0];
//             // ==================Upload Photos ================== //
//             await cloudinary.uploader.upload(
//               file.tempFilePath,
//               {
//                 resource_type: "image",
//                 public_id: `FeedPosts/${fileName}`,
//               },
//               function (err, newFile) {
//                 if (err) {
//                   console.log(err);
//                   uploadOk = 0;
//                 } else {
//                   newFilePath = newFile.secure_url;
//                   if (altText == "") {
//                     filePaths.push({
//                       filePath: newFilePath,
//                       altText: "null",
//                     });
//                   } else {
//                     filePaths.push({
//                       filePath: newFilePath,
//                       altText,
//                     });
//                   }
//                   uploadOk = 1;
//                 }
//               }
//             );
//             fs.unlinkSync(file.tempFilePath);
//           }
//         }
//       }
//     }

//     if (uploadOk == 1) {
//       // ========================Save Data to database=================== //
//       const success = await FeedpostsModel.create({
//         poster,
//         postText: textValue,
//         files: filePaths,
//         qoutedPost: [{ postID: qoutedPost }],
//         commentedPost: [{ postID: commentedPost }],
//         saved: true,
//         whoCanComment,
//         whoCanSee,
//         threadID,
//       });
//     }
//   }
//   res.json({ success: "true" });
// });

module.exports = {
  homePage,
  singlePost,
  handlePosts,
  // savePosts,
};
