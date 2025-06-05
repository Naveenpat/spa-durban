import JoiBase, { ObjectSchema } from "joi"
import JoiDate from "@joi/date"
import JoiObjectId from "joi-objectid"
import { objectId, dateFormat } from "../../../helper/commonValidation"
import { ItemTypeEnum } from "../../../utils/enumUtils"
const { startOfMonth, endOfMonth, format } = require("date-fns")

// Extend Joi with the date and objectId extensions
const Joi = JoiBase.extend(JoiDate)
;(Joi as any).joiDate = JoiDate(JoiBase)
;(Joi as any).joiObjectId = JoiObjectId(JoiBase)

/**
 * get top items, either products or services or both
 */
const getTopItems: { query: ObjectSchema } = {
  query: Joi.object().keys({
    dateFilterKey: Joi.string().allow(""),
    startDate: Joi.string().custom(dateFormat).allow(""),
    endDate: Joi.string().custom(dateFormat).allow(""),
    outletId: Joi.string().custom(objectId).allow(""),
    itemType: Joi.array()
      .items(Joi.string().valid(ItemTypeEnum.product, ItemTypeEnum.service))
      .required(),
    limit: Joi.number().integer().positive().default(10).optional(),
    page: Joi.number().integer().positive().default(1).optional(),
    sortByValue: Joi.number().valid(1, -1).default(-1).optional(),
  }),
}
/**
 * get top customer
 */
const getTopCustomer: { query: ObjectSchema } = {
  query: Joi.object().keys({
    dateFilterKey: Joi.string().allow(""),
    startDate: Joi.string().custom(dateFormat).allow(""),
    endDate: Joi.string().custom(dateFormat).allow(""),
    outletId: Joi.string().custom(objectId).allow(""),
    limit: Joi.number().integer().positive().default(10).optional(),
    page: Joi.number().integer().positive().default(1).optional(),
    sortByValue: Joi.number().valid(1, -1).default(-1).optional(),
  }),
}

/**
 * get top outlet
 */
const getTopOutlet: { query: ObjectSchema } = {
  query: Joi.object().keys({
    dateFilterKey: Joi.string().allow(""),
    startDate: Joi.string().custom(dateFormat).allow(""),
    endDate: Joi.string().custom(dateFormat).allow(""),
    limit: Joi.number().integer().positive().default(10).optional(),
    page: Joi.number().integer().positive().default(1).optional(),
    sortByValue: Joi.number().valid(1, -1).default(-1).optional(),
  }),
}
/**
 * get top outlet
 */

const getOutletReport: { query: ObjectSchema } = {
  query: Joi.object().keys({
    reportDuration: Joi.string().valid("MONTHLY", "WEEKLY", "DAILY").required(),
  }),
}

export { getTopItems, getTopCustomer, getTopOutlet, getOutletReport }
