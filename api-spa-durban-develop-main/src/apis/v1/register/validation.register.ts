import JoiBase, { ObjectSchema } from "joi";
import JoiDate from "@joi/date";
import JoiObjectId from "joi-objectid";
import { objectId, dateFormat } from "../../../helper/commonValidation";

// Extend Joi with date and objectId
const Joi = JoiBase.extend(JoiDate);
(Joi as any).joiDate = JoiDate(JoiBase);
(Joi as any).joiObjectId = JoiObjectId(JoiBase);

/**
 * Create Register Validation Schema
 */
export const create: { body: ObjectSchema } = {
  body: Joi.object().keys({
    openingBalance: Joi.number().required(),
    // initialCashFloat: Joi.number().required(),
    outletId: Joi.string().custom(objectId).required(),
    isActive: Joi.boolean().default(true),
  }),
};

/**
 * Update Register Validation Schema
 */
export const update: { params: ObjectSchema; body: ObjectSchema } = {
  params: Joi.object().keys({
    registerId: Joi.string().custom(objectId).required(),
  }),
  body: Joi.object().keys({
    openingBalance: Joi.number().optional(),
    // initialCashFloat: Joi.number().optional(),
    outletId: Joi.string().custom(objectId).optional(),
    isActive: Joi.boolean().optional(),
  }),
};

/**
 * Filter and Pagination API Validation
 */
export const getAllFilter: { query: ObjectSchema } = {
  query: Joi.object().keys({
    searchValue: Joi.string().allow(""),
    dateFilter: Joi.object()
      .keys({
        startDate: Joi.string().custom(dateFormat).allow(""),
        endDate: Joi.string().custom(dateFormat).allow(""),
      })
      .default({}),
    orderBy: Joi.string().allow(""),
    orderByValue: Joi.number().valid(1, -1).allow(""),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    isPaginationRequired: Joi.boolean().default(true).optional(),
  }),
};

/**
 * Get Register by ID Validation
 */
export const getById: { params: ObjectSchema } = {
  params: Joi.object().keys({
    registerId: Joi.string().custom(objectId).required(),
  }),
};

/**
 * Delete Register Validation
 */
export const deleteDocument: { params: ObjectSchema } = {
  params: Joi.object().keys({
    registerId: Joi.string().custom(objectId).required(),
  }),
};

/**
 * Change Register Status Validation
 */
export const changeStatus: { params: ObjectSchema } = {
  params: Joi.object().keys({
    registerId: Joi.string().custom(objectId).required(),
  }),
};
