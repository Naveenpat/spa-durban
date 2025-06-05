import { Request, Response, NextFunction } from "express"
import Joi, { ObjectSchema } from "joi"
import httpStatus from "http-status"
import { pick } from "../../utilities/pick"

interface ValidationSchema {
  params?: ObjectSchema
  query?: ObjectSchema
  body?: ObjectSchema
}

const validate =
  (schema: ValidationSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const validSchema = pick(schema, ["params", "query", "body"])
    const object = pick(req, Object.keys(validSchema) as (keyof Request)[])
    const { value, error } = Joi.compile(validSchema)
      .prefs({ errors: { label: "key" }, abortEarly: false })
      .validate(object)

    if (error) {
      const errorMsg = error.details.map((details) =>
        details.message.replace(/"/g, `'`)
      )

      return res.status(httpStatus.BAD_REQUEST).send({
        message: errorMsg.join(", "),
        status: false,
        data: null,
        code: "INVALID_DATA",
        issue: "INVALID_DATA",
      })
      // return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
    }

    Object.assign(req, value)
    return next()
  }

export default validate
