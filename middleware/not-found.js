const { StatusCodes } = require("http-status-codes");
const path = require("path");

const notFound = (req, res) =>
  res
    .status(StatusCodes.NOT_FOUND)
    .sendFile(path.join(__dirname, "../public/", "404.html"));
// const notFound = (req, res) => res.status(StatusCodes.NOT_FOUND).render("./auth/login");

module.exports = notFound;
