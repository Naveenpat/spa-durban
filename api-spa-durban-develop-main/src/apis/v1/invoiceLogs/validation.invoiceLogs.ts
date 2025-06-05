import JoiBase, { ObjectSchema } from "joi"
import JoiDate from "@joi/date"
import JoiObjectId from "joi-objectid"
import { objectId, dateFormat } from "../../../helper/commonValidation"

// Extend Joi with the date and objectId extensions
const Joi = JoiBase.extend(JoiDate)
;(Joi as any).joiDate = JoiDate(JoiBase)
;(Joi as any).joiObjectId = JoiObjectId(JoiBase)

/**
 * get by id
 */
export const getById: { params: ObjectSchema } = {
  params: Joi.object().keys({
    invoiceId: Joi.string().custom(objectId),
  }),
}
