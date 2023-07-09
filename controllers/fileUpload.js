const path = require("path");
const fs = require("fs");
//const sharp = require('sharp');
const Jimp = require('jimp');
const {
    v4: uuidv4
} = require("uuid");
const cloudinary = require("cloudinary").v2;
const SmartNetworkModel = require("../models/SmartNetworkModel");

const asyncWrapper = require("../middleware/async");
const {
    StatusCodes
} = require("http-status-codes");

const fileUploadController = asyncWrapper(async (req, res) => {
    const {
        notes, category
    } = req.body;

    let sampleFile;
    let fileName;

    let uploadOk = 1;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.");
    }

    sampleFile = req.files.fileUploaded;
    allowedFiles = req.files.fileUploaded.mimetype;

    fileSize = req.files.fileUploaded.size;
    maxSize = 10000000;


    // Input and output file paths
    var sharpFileName = uuidv4() + "-" + sampleFile.name;
    const inputFilePath = sampleFile.tempFilePath;
    const outputFilePath = path.join(__dirname, "../../../public/sharpFileCompressor", sharpFileName);

    /*sharp(inputFilePath)
  .resize(20)
  .toFile(outputFilePath, (err, info) => {
    if (err) {
      console.log('Error:', err);
    } else {
      console.log('Image resized and saved', info);
    }
  });*/

    async function reduceImageSize() {
        try {
            const image = await Jimp.read(inputFilePath);
            image.scaleToFit(20, Jimp.AUTO).write(outputFilePath);
            console.log('Image size reduced successfully');
        } catch (error) {
            //console.error('Error:', error);
            return error;
        }
    }

    reduceImageSize().then(res => {
        console.log("Successfully reduced.")
    }).catch(err => {
        console.log(err)
    });


    //Delete file from temp folder
    fs.unlinkSync(sampleFile.tempFilePath);
    /*if (allowedFiles && allowedFiles === "video/mp4") {
    if (fileSize > maxSize) {
      res.send("File is too big");
      uploadOk = 0;
    } else {
      const fName = req.files.fileUploaded.name.split(".")[0];
      cloudinary.uploader.upload(
        sampleFile.tempFilePath,
        {
          resource_type: "video",
          public_id: `VideoUploads/${fName}`,
          chunk_size: 6000000,
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
        async function (err, video) {
          if (err) {
            console.log(err);
            uploadOk = 0;
          } else {
            fileName = video.secure_url;
            const smartNetworkFeeds = {
              notes,
              category,
              fileName,
            };
            const success = await SmartNetworkModel.create({
              notes: smartNetworkFeeds.notes,
              category: smartNetworkFeeds.category,
              fileUploads: smartNetworkFeeds.fileName,
            });
            if (success) uploadOk = 1;
          }
        }
      );
    }
  } else if (allowedFiles && allowedFiles.startsWith("image/")) {
    if (fileSize > maxSize) {
      res.send("File is too big");
      uploadOk = 0;
    } else {
      // Use the mv() method to place the file somewhere on your server
      cloudinary.uploader.upload(
        sampleFile.tempFilePath,
        async function (err, res) {
          if (err) {
            console.log(err);
            uploadOk = 0;
          } else {
            fileName = res.secure_url;
            const smartNetworkFeeds = {
              notes,
              category,
              fileName,
            };
            const success = await SmartNetworkModel.create({
              notes: smartNetworkFeeds.notes,
              category: smartNetworkFeeds.category,
              fileUploads: smartNetworkFeeds.fileName,
            });
            uploadOk = 1;
          }
        }
      );
    }
  } else {
    res.send("File type not allowed");
    uploadOk = 0;
  }
  if (uploadOk == 1) res.status(StatusCodes.OK).send("File Uploaded");*/
});

module.exports = fileUploadController;