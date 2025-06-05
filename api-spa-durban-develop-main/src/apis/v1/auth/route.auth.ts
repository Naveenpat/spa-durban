import { Router } from "express";
import authController from "./controller.auth";
import validate from "../../../middleware/validate";
import {
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  loginAuto,
} from "./validation.auth";

import { authenticate } from "../../../middleware/authentication";
import { UserEnum, TokenEnum } from "../../../utils/enumUtils";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management endpoints
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
router.post("/login/auto", validate(loginAuto), authController.loginAuto);
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *           required:
 *             - email
 *             - password
 *           example:
 *               email: codiotic.test01@gmail.com
 *               password: Password1!
 *     parameters:
 *       - in: header
 *         name: device-id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique device identifier
 *         example: '12345'
 *     responses:
 *       '200':
 *         description: Successful login
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         userType:
 *                           type: string
 *                     access:
 *                       type: string
 *                     refresh:
 *                       type: string
 *                 status:
 *                   type: boolean
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal Server Error
 */
router.post("/login", validate(login), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Get new access and refresh token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: device-id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique device identifier
 *         example: '12345'
 *     responses:
 *       '200':
 *         description: New token generated successfully!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         userType:
 *                           type: string
 *                     access:
 *                       type: string
 *                     refresh:
 *                       type: string
 *                 status:
 *                   type: boolean
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal Server Error
 */
router.post(
  "/refresh",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Refresh),
  authController.refreshTokens
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               logOutAll:
 *                 type: boolean
 *     parameters:
 *       - in: header
 *         name: device-id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique device identifier
 *         example: '12345'
 *     responses:
 *       '200':
 *         description: Logged out successfully!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: null
 *                 status:
 *                   type: boolean
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal Server Error
 */
router.post(
  "/logout",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Refresh), // pass in parameters(allowed users array, token type enum)
  validate(logout),
  authController.logout
);

/**
 * @swagger
 * /auth/changePassword:
 *   post:
 *     summary: changePassword
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *           required:
 *             - newPassword
 *             - confirmPassword
 *           example:
 *               newPassword: Password1!
 *               confirmPassword: Password1!
 *     parameters:
 *       - in: header
 *         name: device-id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique device identifier
 *         example: '12345'
 *     responses:
 *       '200':
 *         description: Password changed successfully!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: null
 *                 status:
 *                   type: boolean
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal Server Error
 */
router.post(
  "/changePassword",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access), // pass in parameters(allowed users array, token type enum)
  validate(changePassword),
  authController.changePassword
);

/**
 * @swagger
 * /auth/forgotPassword:
 *   post:
 *     summary: forgotPassword
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *           required:
 *             - email
 *           example:
 *               email: codiotic.test01@gmail.com
 *     parameters:
 *       - in: header
 *         name: device-id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique device identifier
 *         example: '12345'
 *     responses:
 *       '200':
 *         description: "Reset Password Link sent on the email."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: null
 *                 status:
 *                   type: boolean
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal Server Error
 */
router.post(
  "/forgotPassword",
  validate(forgotPassword),
  authController.forgotPassword
);

/**
 * @swagger
 * /auth/resetPassword:
 *   post:
 *     summary: resetPassword
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *           required:
 *             - newPassword
 *             - confirmPassword
 *           example:
 *               newPassword: Password1!
 *               confirmPassword: Password1!
 *     parameters:
 *       - in: header
 *         name: device-id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique device identifier
 *         example: '12345'
 *     responses:
 *       '200':
 *         description: Password changed successfully!
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: null
 *                 status:
 *                   type: boolean
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal Server Error
 */
router.post(
  "/resetPassword",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.PasswordReset), // pass in parameters(allowed users array, token type enum)
  validate(resetPassword),
  authController.resetPassword
);

export default router;
