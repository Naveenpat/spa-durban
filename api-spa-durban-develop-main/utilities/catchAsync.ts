import { Request, Response, NextFunction } from "express"

const catchAsync =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.log(err)
      next(err)
    })

export default catchAsync
