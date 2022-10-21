require('express-async-errors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('cloudinary').v2;

const { StatusCodes } = require('http-status-codes');
// const AuthModel = require("../../models/AuthModel")
const asyncWrapper = require('../../../middleware/async');
const {
  CustomAPIError,
  BadRequestError,
  UnauthenticatedError,
} = require('../../../errors');
const Forum = require('../../../models/forumModel');

const forums = (req, res) => {
  const page_name = req.path;
  res.status(StatusCodes.OK).render('./dashboard/public/forums', {
    headTitle: 'Smart Forums',
    page_name,
  });
};

const createForum = async (req, res) => {
  const { forumDescription, forumName } = req.body;
  let imageUpload;
  if (!forumDescription || !forumName) {
    throw new BadRequestError(
      'Description and forum title fileds are required'
    );
  }

  console.log(33, req.files);

  if (req.files) {
    let maxSize = 100000;

    if (req.files.image.size > maxSize) {
      throw new BadRequestError('File too large');
    }

    if (!req.files.image.mimetype.includes('image')) {
      throw new BadRequestError('Accepted files are jpeg,jpg, png');
    }

    imageUpload = await cloudinary.uploader.upload(
      req.files.image.tempFilePath,
      {
        resource_type: 'image',
        public_id:
          'forumDisplayImageUpload' + '/' + req.files.image.name.split('.')[0],
      }
    );
  }

  const forum = await Forum.create({
    ...req.body,
    forumImage: req.files && imageUpload.secure_url,
  });

  res.status(StatusCodes.CREATED).json({
    status: true,
    message: 'Forum created',
    forum,
  });
};

const getforums = async (req, res) => {
  // Still thinking what to do here
  const forums = await Forum.find({});
  res.status(StatusCodes.OK).json({
    status: true,
    count: forums.length,
    message: 'fetched',
    forums,
  });
};

const deleteForum = async (req, res) => {
  const forum = await Forum.findByIdAndDelete(req.params.forumId);
  if (!forum) {
    throw new BadRequestError('Forum not found');
  }
  res.status(StatusCodes.NO_CONTENT).json({
    status: true,
    message: 'forum deleted',
  });
};

const updateForum = async (req, res) => {
  const forum = await Forum.findByIdAndUpdate(
    req.params.forumId,
    { ...req.body },
    { runValidators: true, new: true }
  );

  if (!forum) {
    throw new BadRequestError('Forum not found');
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'fetched',
    forum,
  });
};

const getForum = async (req, res) => {
  const forum = await Forum.findById(req.params.forumId);

  if (!forum) {
    throw new BadRequestError('Forum not found');
  }

  res.status(StatusCodes.OK).json({
    status: true,
    message: 'fetched',
    forum,
  });
};

module.exports = {
  forums,
  createForum,
  getforums,
  deleteForum,
  updateForum,
  getForum,
};
