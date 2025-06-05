import Joi from "joi";

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};
const loginAuto = {
  body: Joi.object().keys({
    bookingUserId: Joi.string().required(),
  }),
};
const logout = {
  body: Joi.object().keys({
    logOutAll: Joi.boolean().optional(),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().required(),
    confirmPassword: Joi.string()
      .required()
      .valid(Joi.ref("newPassword"))
      .messages({
        "any.only": "Confirm password must match new password",
      }),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    newPassword: Joi.string().optional(),
    confirmPassword: Joi.string()
      .optional()
      .valid(Joi.ref("newPassword"))
      .messages({
        "any.only": "Confirm password must match new password",
      }),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().optional(),
  }),
};

export {
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  loginAuto,
};
