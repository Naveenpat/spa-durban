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
export const create: { body: ObjectSchema } = {
  body: Joi.object().keys({
    customerId: Joi.string().required().custom(objectId),
    items: Joi.array()
      .items(
        Joi.object().keys({
          itemId: Joi.string().custom(objectId),
          quantity: Joi.number(),
          itemType: Joi.string(),
        })
      )
      .allow(),
    couponCode: Joi.string().allow(""),
    shippingCharges: Joi.number(),
    amountReceived: Joi.array()
      .items(
        Joi.object().keys({
          paymentModeId: Joi.string().custom(objectId),
          amount: Joi.number(),
        })
      )
      .allow(),
    giftCardCode: Joi.string().allow(""),
    useLoyaltyPoints: Joi.boolean(),
    referralCode: Joi.string().allow(""),
    outletId: Joi.string().custom(objectId).allow(null),
  }),
}

/**
 * get by id
 */
export const getById: { params: ObjectSchema } = {
  params: Joi.object().keys({
    id: Joi.string().custom(objectId),
  }),
}

/**
 * filter and pagination api
 */
export const getAllFilter: { query: ObjectSchema } = {
  query: Joi.object().keys({
    searchIn: Joi.array().items(Joi.string().required()),
    searchValue: Joi.string().allow(""),
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(dateFormat).allow(""),
        endDate: Joi.string().custom(dateFormat).allow(""),
        dateFilterKey: Joi.string().allow(""),
      })
      .default({}),
    rangeFilterBy: Joi.object()
      .keys({
        rangeFilterKey: Joi.string().allow(""),
        rangeInitial: Joi.string().allow(""),
        rangeEnd: Joi.string().allow(""),
      })
      .default({})
      .optional(),
    orderBy: Joi.string().allow(""),
    orderByValue: Joi.number().valid(1, -1).allow(""),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    filterBy: Joi.array().items(
      Joi.object().keys({
        fieldName: Joi.string().allow(""),
        value: Joi.alternatives().try(
          Joi.string().allow(""),
          Joi.number().allow(""),
          Joi.boolean().allow(""),
          Joi.array().items(Joi.string()).default([]),
          Joi.array().items(Joi.number()).default([]),
          Joi.array().items(Joi.boolean()).default([]),
          Joi.array().default([])
        ),
      })
    ),
    isPaginationRequired: Joi.boolean().default(true).optional(),
  }),
}

/**
 * delete a document
 */
export const deleteDocument: { params: ObjectSchema } = {
  params: Joi.object().keys({
    draftId: Joi.string().custom(objectId),
  }),
}
