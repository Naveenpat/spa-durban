import mongoose from "mongoose"
import httpStatus from "http-status"
import { Response, NextFunction, Request } from "express"

export const parseBodyAndQuery = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.body) {
    req.body = JSON.parse(JSON.stringify(req.body))
  }

  if (req.query) {
    req.query = JSON.parse(JSON.stringify(req.query))
    if (req.query.filterBy && typeof req.query.filterBy === "string") {
      req.query.filterBy = JSON.parse(req.query.filterBy)
    }

    if (req.query.searchIn && typeof req.query.searchIn === "string") {
      req.query.searchIn = JSON.parse(req.query.searchIn)
    }

    if (req.query.dateFilter && typeof req.query.dateFilter === "string") {
      req.query.dateFilter = JSON.parse(req.query.dateFilter)
    }
  }

  next()
}
