import { Router } from "express"
import * as emailController from "./controller.email"
import validate from "../../../middleware/validate"
import * as emailValidation from "./validation.email"
import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"
import * as multerUpload from "../../../middleware/multerFileUpload"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Email
 *   description: Email endpoints
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

/**
 * @swagger
 * /email/{invoiceId}:
 *   post:
 *     summary: Send invoice email by customer ID
 *     tags: [Email]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         example: 6686620f1a563a2572779804
 *         schema:
 *           $ref: '#/components/schemas/CustomerId'
 *         description: Unique ID of the customer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               emailBody:
 *                 type: string
 *                 description: The body of the email
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Draft not found
 *       '500':
 *         description: Internal Server Error
 */

router.post(
  "/:invoiceId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  multerUpload.imgError,
  multerUpload.fileUpload.array("file", 1),
  validate(emailValidation.sendInvoice),
  emailController.sendInvoice
)

export default router
