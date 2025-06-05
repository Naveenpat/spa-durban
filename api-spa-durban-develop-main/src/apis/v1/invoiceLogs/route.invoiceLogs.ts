import { Router } from "express"
import { getInvoicePaymentLogByInvoiceId } from "./controller.invoiceLogs"
import validate from "../../../middleware/validate"
import { getById } from "./validation.invoiceLogs"

import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: InvoiceLogs
 *   description: invoiceLog management endpoints
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
 * /invoice-logs/{invoiceId}:
 *   get:
 *     summary: Get a invoice by ID
 *     tags: [InvoiceLogs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Invoice not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:invoiceId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getInvoicePaymentLogByInvoiceId
)

export default router
