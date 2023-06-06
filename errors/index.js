const CustomAPIError = require("./custom-error")
const BadRequestError = require("./bad-request")
const UnauthenticatedError = require("./unauthenticated")
const ForbiddenError = require("./forbidden.js")

module.exports = {
    CustomAPIError,
    BadRequestError,
    UnauthenticatedError,
    ForbiddenError
}