const { StatusCodes } = require("http-status-codes")

const errorHandlerMiddleware = (err, req, res, next) => {

    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Something went wrong, please try again"
    }

    // ====================Validation Error======================== //

    if(err.name === "ValidationError"){
        customError.msg = Object.values(err.errors).map((item) => item.message).join(",")
        customError.statusCode = StatusCodes.BAD_REQUEST
    }

    // =============================Duplicate Error ===================== //

    if(err.code && err.code === 11000){
        customError.msg = `Username or Email already exists, please try another`,
        customError.statusCode = StatusCodes.BAD_REQUEST
    }

    // ================================Cast Error ===================== //

    if(err.name === "CastError"){
        customError.msg = `No item found with the ID ${err.value}`,
        customError.statusCode = StatusCodes.NOT_FOUND
    }

    console.error(err)
    return res.status(customError.statusCode).json({ msg: customError.msg })
    // return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ err })
    
}

module.exports = errorHandlerMiddleware