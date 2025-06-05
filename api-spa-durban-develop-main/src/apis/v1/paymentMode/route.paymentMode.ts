import { Router } from "express"
import {
  createPaymentMode,
  getPaymentModes,
  getPaymentMode,
  updatePaymentMode,
  deletePaymentMode,
  togglePaymentModeStatus,
} from "./controller.paymentMode"
import validate from "../../../middleware/validate"
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  toggleStatusDocument,
} from "./validation.paymentMode"
import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: PaymentModes
 *   description: PaymentMode management endpoints
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
 * /payment-mode/add:
 *   post:
 *     summary: Create a new paymentMode
 *     tags: [PaymentModes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                   type: string
 *               modeName:
 *                   type: string
 *           required:
 *               -type
 *               -modeName
 *     parameters:
 *     responses:
 *       '201':
 *         description: Created
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal Server Error
 */
router.post(
  "/add",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(create),
  createPaymentMode
)

/**
 * @swagger
 * /payment-mode/pagination:
 *   get:
 *     summary: Get all paymentModes with pagination
 *     tags: [PaymentModes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: searchValue
 *         schema:
 *           type: string
 *       - in: query
 *         name: searchIn
 *         schema:
 *           type: array
 *           description: valid keys are name , email
 *           items:
 *             type: string
 *       - in: query
 *         name: dateFilter
 *         schema:
 *           type: Object
 *       - in: query
 *         name: rangeFilterBy
 *         schema:
 *           type: Object
 *       - in: query
 *         name: filterBy
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '500':
 *         description: Internal Server Error
 */

router.get(
  "/pagination",
  parseBodyAndQuery,
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getAllFilter),
  getPaymentModes
)
/**
 * @swagger
 * /payment-mode/{paymentModeId}:
 *   get:
 *     summary: Get a paymentMode by ID
 *     tags: [PaymentModes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentModeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: PaymentMode not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:paymentModeId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getPaymentMode
)

/**
 * @swagger
 * /payment-mode/{paymentModeId}:
 *   put:
 *     summary: Update a paymentMode by ID
 *     tags: [PaymentModes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentModeId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                   type: string
 *               modeName:
 *                   type: string
 *           required:
 *               -type
 *               -modeName
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: PaymentMode not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:paymentModeId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updatePaymentMode
)

/**
 * @swagger
 * /payment-mode/{paymentModeId}:
 *   delete:
 *     summary: Delete a paymentMode by ID
 *     tags: [PaymentModes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentModeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: PaymentMode not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:paymentModeId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deletePaymentMode
)

/**
 * @swagger
 * /paymentMode/toggle-status/{paymentModeId}:
 *   put:
 *     summary: Toggle payment mode status by ID
 *     tags: [PaymentModes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentModeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Payment mode not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/toggle-status/:paymentModeId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(toggleStatusDocument),
  togglePaymentModeStatus
)

export default router
