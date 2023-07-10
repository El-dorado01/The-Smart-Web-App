const path = require("path");
const fs = require("fs");
//const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
<<<<<<< HEAD
=======
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);
// ffmpeg.setFfprobePath('../node_modules/fluent-ffmpeg/lib/ffprobe.js');
>>>>>>> 8a377d2d6ba209bce13509e209d936442a347551
//const Jimp = require('jimp');
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
    let compressedFileName;

    let uploadOk = 1;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("No files were uploaded.");
    }

    sampleFile = req.files.fileUploaded;
    allowedFiles = sampleFile.name.split(".")[1]

    fileSize = req.files.fileUploaded.size;
    maxSize = 10000000;
    
    // Input and output file paths
    var sharpFileName = uuidv4() + "-" + sampleFile.name;
    var outputFilePath;

     /*async function reduceImageSize() {
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
         console.log("Error: ", err)
     });*/

    if (allowedFiles && (allowedFiles === "mp4" || allowedFiles == "mkv")) {
      if (fileSize > maxSize) {
        res.send("File is too big");
        uploadOk = 0;
      } else {
        const thumbnailFilePath = path.join(__dirname, "../public/thumbnails", sharpFileName.split(".")[0] + ".jpg");

        if(!fs.existsSync(path.join(__dirname, "../public/thumbnails"))){
          fs.mkdirSync(path.join(__dirname, "../public/thumbnails"))
        }
        //Generate Video Thumbnail
        ffmpeg(sampleFile.tempFilePath)
<<<<<<< HEAD
          .seekInput(1)
          .frames(1)
          .output(outputFilePath)
          .on('end', () => {
              console.log("Thumbnail generated.")
            // Thumbnail generation completed
            // Resize with sharp
            /*sharp(outputFilePath)
              .seek(0) // Set the position in seconds from where to extract the frame (e.g., 0 for the first frame)
              .frames(1) // Specify the number of frames to extract (e.g., 1 for a single frame)
=======
        .seekInput(1)
        .frames(1)
        .on('error', function(err) {
          console.log('An error occurred: ' + err.message);
        })
          .on('end', () => {
            console.log("Thumbnail Generated")
            // Thumbnail generation completed
            // Resize with sharp
            outputFilePath = path.join(__dirname, "../public/fileCompressors", sharpFileName.split(".")[0] + ".jpg");

            if(!fs.existsSync(path.join(__dirname, "../public/fileCompressors"))){
              fs.mkdirSync(path.join(__dirname, "../public/fileCompressors"))
            }
            sharp(thumbnailFilePath)
>>>>>>> 8a377d2d6ba209bce13509e209d936442a347551
              .resize(20)
              .toFile(outputFilePath, (err, info) => {
                if (err) {
                  console.log('Error:', err);
                } else {
                  console.log('Thumbnail generated, resized and saved', info);
                }
              });*/
          })
<<<<<<< HEAD
          .run()
=======
          // .screenshots({
          //   count: 1,
          //   folder: path.dirname(outputFilePath),
          //   filename: path.basename(outputFilePath)
          // })
          .save(thumbnailFilePath)
>>>>>>> 8a377d2d6ba209bce13509e209d936442a347551
          
        /*await cloudinary.uploader.upload(
          sampleFile.tempFilePath,
          {
            resource_type: "video",
            public_id: `smartNetworkPosts/${sharpFileName.split(".")[0]}`,
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
              uploadOk = 1;
            }
          }
        );
        
        await cloudinary.uploader.upload(
          outputFilePath,
          {
            resource_type: "image",
            public_id: `sharpCompressedFiles/${sharpFileName.split(".")[0]}`,
          },
          async function (err, res) {
            if (err) {
              console.log(err);
              uploadOk = 0;
            } else {
              compressedFileName = res.secure_url;
              uploadOk = 1;
              //Delete file from temp folder
              fs.unlinkSync(sampleFile.tempFilePath);
              fs.unlinkSync(outputFilePath);
              fs.unlinkSync(path.join(__dirname, "../public/thumbnails", sharpFileName.split(".")[0] + ".jpg"));
            }
          }
        );*/
      }
    } else if (allowedFiles && (allowedFiles == "jpg" || allowedFiles == "png" || allowedFiles == "jpeg")) {
      if (fileSize > maxSize) {
        res.send("File is too big");
        uploadOk = 0;
      } else {
        outputFilePath = path.join(__dirname, "../public/fileCompressors", sharpFileName);

        if(!fs.existsSync(path.join(__dirname, "../public/fileCompressors"))){
          fs.mkdirSync(path.join(__dirname, "../public/fileCompressors"))
        }
        sharp(sampleFile.tempFilePath)
          .resize(20)
          .toFile(outputFilePath, (err, info) => {
            if (err) {
              console.log('Error:', err);
            } else {
              console.log('Image resized and saved', info);
            }
          });
        // Use the mv() method to place the file somewhere on your server
        await cloudinary.uploader.upload(
          sampleFile.tempFilePath,
          {
            resource_type: "image",
            public_id: `smartNetworkPosts/${sharpFileName.split(".")[0]}`,
          },
          async function (err, res) {
            if (err) {
              console.log(err);
              uploadOk = 0;
            } else {
              fileName = res.secure_url;
              uploadOk = 1;
            }
          }
        );

        await cloudinary.uploader.upload(
          outputFilePath,
          {
            resource_type: "image",
            public_id: `sharpCompressedFiles/${sharpFileName.split(".")[0]}`,
          },
          async function (err, res) {
            if (err) {
              console.log(err);
              uploadOk = 0;
            } else {
              compressedFileName = res.secure_url;
              uploadOk = 1;
              //Delete file from temp folder
              fs.unlinkSync(sampleFile.tempFilePath);
              fs.unlinkSync(outputFilePath);
            }
          }
        );
      }
    } else {
      res.send("File type not allowed");
      uploadOk = 0;
    }

    const smartNetworkFeeds = {
      notes,
      category,
      fileName,
      compressedFileName
    };
    
    const success = await SmartNetworkModel.create({
      notes: smartNetworkFeeds.notes,
      category: smartNetworkFeeds.category,
      fileUploads: smartNetworkFeeds.fileName,
      compressedFileName: smartNetworkFeeds.compressedFileName
    });
    if (uploadOk == 1) res.status(StatusCodes.OK).json({post: success});
});

module.exports = fileUploadController;