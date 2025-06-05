import { Request, Response } from "express"
import httpStatus from "http-status"
import logger from "../config/logger" // Adjust path based on your project structure

const notFoundHandler = (req: Request, res: Response) => {
  logger.info(
    "Invalid URL requested. It may be because of versioning. Please check."
  )
  return res.status(httpStatus.NOT_FOUND).send({
    message: "Page Not found",
    status: false,
    code: "PAGE_NOT_FOUND",
    issue: "INVALID_REQUEST_ROUTE",
    data: null,
  })
}

export default notFoundHandler
