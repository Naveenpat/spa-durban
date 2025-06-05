import { ErrorRequestHandler } from "express"
import mongoose from "mongoose"
import httpStatus from "http-status"
import logger from "../config/logger"
import ApiError from "../utilities/apiError"
import { errorRes } from "../utilities/resError"

const errorConverter: ErrorRequestHandler = (err, req, res, next) => {
  let error = err

  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode ||
      (error instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR)
    const message =
      error.message || httpStatus[statusCode as keyof typeof httpStatus]
    error = new ApiError(statusCode, message, false, err.stack)
  }
  next(error)
}

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Use errorRes to get the formatted error response
  const errorResponse = errorRes(err)
  res.locals.errorMessage = err.message
  logger.error(err)
  return res
    .status(errorResponse.statusCode || httpStatus.INTERNAL_SERVER_ERROR)
    .send(errorResponse.resData)
}

export { errorConverter, errorHandler }
