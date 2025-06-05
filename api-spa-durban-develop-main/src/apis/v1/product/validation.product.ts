import JoiBase, { ObjectSchema } from "joi";
import JoiDate from "@joi/date";
import JoiObjectId from "joi-objectid";
import { objectId, dateFormat } from "../../../helper/commonValidation";
import { isEmpty } from "validator";

// Extend Joi with the date and objectId extensions
const Joi = JoiBase.extend(JoiDate);
(Joi as any).joiDate = JoiDate(JoiBase);
(Joi as any).joiObjectId = JoiObjectId(JoiBase);

/**
 * create new document
 */
export const create: { body: ObjectSchema } = {
  body: Joi.object().keys({
    productName: Joi.string().lowercase().required(),
    productCode: Joi.string().lowercase().required(),
    subCategoryId: Joi.custom(objectId).required(),
    brandId: Joi.custom(objectId).required(),
    productImageUrl: Joi.string().lowercase().allow(""),
    description: Joi.string().lowercase().required(),
    measurementUnitId: Joi.custom(objectId).required(),
    barcode: Joi.string().lowercase().required(),
    mrp: Joi.number().required(),
    sellingPrice: Joi.number().required(),
    purchasePrice: Joi.number().required(),
    taxId: Joi.string().custom(objectId).required(),
  }),
};

/**
 * update existing document
 */
export const update: { params: ObjectSchema; body: ObjectSchema } = {
  params: Joi.object().keys({
    productId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    productName: Joi.string().lowercase().required(),
    productCode: Joi.string().lowercase().required(),
    subCategoryId: Joi.custom(objectId).required(),
    brandId: Joi.custom(objectId).required(),
    productImageUrl: Joi.string().lowercase().allow(""),
    description: Joi.string().lowercase().required(),
    measurementUnitId: Joi.custom(objectId).required(),
    barcode: Joi.string().lowercase().required(),
    mrp: Joi.number().required(),
    sellingPrice: Joi.number().required(),
    purchasePrice: Joi.number().required(),
    taxId: Joi.string().custom(objectId).required(),
  }),
};

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
    filterBy: Joi.array()
      .items(
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
      )
      .default([]),
    isPaginationRequired: Joi.boolean().default(true).optional(),
  }),
};
/**
 * filter and pagination api
 */
export const productAndService: { query: ObjectSchema } = {
  query: Joi.object().keys({
    params: Joi.array().items(Joi.string().required()),
    outletId: Joi.string().custom(objectId).allow(""),
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
    filterBy: Joi.array()
      .items(
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
      )
      .default([]),
    isPaginationRequired: Joi.boolean().default(true).optional(),
  }),
};

/**
 * get either all data or single document
 */
export const get: { query: ObjectSchema } = {
  query: Joi.object()
    .keys({
      _id: Joi.string().custom(objectId).optional(),
    })
    .optional(),
};

/**
 * delete a document
 */
export const deleteDocument: { params: ObjectSchema } = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

/**
 * get by id
 */
export const getById: { params: ObjectSchema } = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

/**
 * get by barcode
 */
export const getByBarcode: { params: ObjectSchema } = {
  params: Joi.object().keys({
    barcode: Joi.string(),
  }),
};

/**
 * change status of document
 */
export const changeStatus: { params: ObjectSchema } = {
  params: Joi.object().keys({
    productId: Joi.string().custom(objectId),
  }),
};

export const toggleStatusDocument = {
  params: Joi.object().keys({
    productId: Joi.string().required(),
  }),
};
