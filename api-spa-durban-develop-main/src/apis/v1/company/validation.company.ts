import JoiBase, { ObjectSchema } from "joi";
import JoiDate from "@joi/date";
import JoiObjectId from "joi-objectid";
import { objectId, dateFormat } from "../../../helper/commonValidation";

// Extend Joi with the date and objectId extensions
const Joi = JoiBase.extend(JoiDate);
(Joi as any).joiDate = JoiDate(JoiBase);
(Joi as any).joiObjectId = JoiObjectId(JoiBase);

/**
 * create new company
 */
export const create: { body: ObjectSchema } = {
  body: Joi.object().keys({
    companyName: Joi.string().required(),
    email: Joi.string().lowercase().email().required(),
    phone: Joi.string().required(),
    logo: Joi.string().optional(),
    websiteUrl: Joi.string().uri().optional(),
  }),
};

/**
 * update existing company
 */
export const update: { params: ObjectSchema; body: ObjectSchema } = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  }),
  body: Joi.object().keys({
    companyName: Joi.string().optional(),
    email: Joi.string().lowercase().email().optional(),
    phone: Joi.string().optional(),
    logo: Joi.string().optional(),
    websiteUrl: Joi.string().uri().optional(),
  }),
};

/**
 * get all companies
 */
export const getAll: { query: ObjectSchema } = {
  query: Joi.object().keys({}),
};

/**
 * get company by id
 */
export const getById: { params: ObjectSchema } = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  }),
};
