import JoiBase, { ObjectSchema } from "joi"
import JoiDate from "@joi/date"
import JoiObjectId from "joi-objectid"
import { objectId, dateFormat } from "../../../helper/commonValidation"

// Extend Joi with the date and objectId extensions
const Joi = JoiBase.extend(JoiDate)
;(Joi as any).joiDate = JoiDate(JoiBase)
;(Joi as any).joiObjectId = JoiObjectId(JoiBase)

/**
 * create new document
 */
export const sendInvoice: { params: ObjectSchema; body: ObjectSchema } = {
  params: Joi.object().keys({
    invoiceId: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    emailBody: Joi.string().required(),
  }),
}
