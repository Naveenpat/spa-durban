import Joi from "joi"

export const createUserSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    userName: Joi.string().required(),
    phone: Joi.string().default(""),
  }),
}

export const updateUserSchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required(),
    userName: Joi.string().required(),
    phone: Joi.string().default(""),
  }),
}
