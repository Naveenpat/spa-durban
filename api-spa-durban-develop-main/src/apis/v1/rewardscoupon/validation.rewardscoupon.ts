import JoiBase, { ObjectSchema } from "joi";
import JoiDate from "@joi/date";
import JoiObjectId from "joi-objectid";
import { objectId, dateFormat } from "../../../helper/commonValidation";

// Extend Joi with date and objectId
const Joi = JoiBase.extend(JoiDate);
(Joi as any).joiDate = JoiDate(JoiBase);
(Joi as any).joiObjectId = JoiObjectId(JoiBase);

/**
 * Create CashBack Validation Schema
 */
export const create: { body: ObjectSchema } = {
  body: Joi.object().keys({
    rewardsPoint: Joi.string().trim().required(),
    serviceId: Joi.array()
      .items(Joi.string().custom(objectId))
      .min(1)
      .required(),
  }),
};

/**
 * Update CashBack Validation Schema
 */
export const update: { params: ObjectSchema; body: ObjectSchema } = {
  params: Joi.object().keys({
    rewardsCouponId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    rewardsPoint: Joi.number().optional(),

    serviceId: Joi.array()
      .items(Joi.string().custom(objectId))
      .min(1)
      .optional(),
  }),
};

/**
 * Filter and Pagination API Validation
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
};

/**
 * Get by ID Validation
 */
export const getById: { params: ObjectSchema } = {
  params: Joi.object().keys({
    rewardsCouponId: Joi.string().custom(objectId).required(),
  }),
};

/**
 * Delete a Document Validation
 */
export const deleteDocument: { params: ObjectSchema } = {
  params: Joi.object().keys({
    rewardsCouponId: Joi.string().custom(objectId).required(),
  }),
};

/**
 * Change Status of Document Validation
 */
export const changeStatus: { params: ObjectSchema } = {
  params: Joi.object().keys({
    rewardsCouponId: Joi.string().custom(objectId).required(),
  }),
};

/**
 * Toggle Status of Document Validation
 */
export const toggleStatusDocument = {
  params: Joi.object().keys({
    rewardsCouponId: Joi.string().required(),
  }),
};
