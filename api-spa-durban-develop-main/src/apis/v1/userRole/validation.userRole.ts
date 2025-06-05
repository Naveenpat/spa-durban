import Joi from "joi"

export const createUserSchema = {
  body: Joi.object().keys({
    roleName: Joi.string().required(),
    user: Joi.string().required(),
  }),
}

export const getUserSchema = {
  query: Joi.object().keys({
    roleName: Joi.string().optional(),
  }),
}
