import { Router } from "express";
import {
  previewInvoice,
  createInvoice,
  getInvoices,
  getInvoice,
  paymentInInvoice,
  updateInvoice,
  getInvoiceByBookingId,
  updateGivenChange,
} from "./controller.invoice";
import validate from "../../../middleware/validate";
import {
  create,
  paymentIn,
  getAllFilter,
  getById,
  preview,
  updateGivenChangeSchema,
} from "./validation.invoice";

import { authenticate } from "../../../middleware/authentication";
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery";
import { UserEnum, TokenEnum } from "../../../utils/enumUtils";
const router = Router();

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management endpoints
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
 * /invoice/preview:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                customerId:
 *                  type: string
 *                  description: MongoDB ObjectId
 *                  example: 667d2b29f8e076a6e2307658
 *                items:
 *                  type: array
 *                  items:
 *                    $ref: "#/components/schemas/items"
 *                couponCode:
 *                   type: string
 *                   example: RTEd
 *                shippingCharges:
 *                   type: number
 *                   example: 100
 *                giftCardCode:
 *                   type: string
 *                   example: GIFT
 *                useLoyaltyPoints:
 *                   type: boolean
 *                   example: false
 *                referralCode:
 *                   type: string
 *                   example: RTEdds
 *                outletId:
 *                  type: string
 *                  description: MongoDB ObjectId
 *                  example: 6675114f46df8aab8ab5389a
 *           required:
 *              -customerId
 *              -items
 *              -couponCode
 *              -shippingCharges
 *              -giftCardCode
 *              -useLoyaltyPoints
 *              -referralCode
 *              -outletId
 *     responses:
 *       '200':
 *         description: Successfull
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal Server Error
 */
router.post(
  "/preview",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(preview),
  previewInvoice
);

/**
 * @swagger
 * components:
 *   schemas:
 *     amountReceived:
 *        type: object
 *        properties:
 *           paymentModeId:
 *             type: string
 *             description: MongoDB ObjectId
 *             example: 667a8fd99235fc9b5d71a054
 *           amount:
 *             type: number
 *             example: 1
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     items:
 *       type: object
 *       properties:
 *         itemId:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: 667e4ef39dfbcbaee4e64fc8
 *         quantity:
 *           type: number
 *           example: 1
 *         itemType:
 *           type: string
 *           example: PRODUCT
 */

/**
 * @swagger
 * /invoice/add:
 *   post:
 *     summary: Create a new invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                customerId:
 *                  type: string
 *                  description: MongoDB ObjectId
 *                  example: 667d2b29f8e076a6e2307658
 *                items:
 *                  type: array
 *                  items:
 *                    $ref: "#/components/schemas/items"
 *                couponCode:
 *                   type: string
 *                   example: RTEd
 *                shippingCharges:
 *                   type: number
 *                   example: 100
 *                amountReceived:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/amountReceived"
 *                giftCardCode:
 *                   type: string
 *                   example: GIFT
 *                useLoyaltyPoints:
 *                   type: boolean
 *                   example: false
 *                referralCode:
 *                   type: string
 *                   example: RTEdds
 *                outletId:
 *                  type: string
 *                  description: MongoDB ObjectId
 *                  example: 6675114f46df8aab8ab5389a
 *           required:
 *              -customerId
 *              -items
 *              -couponCode
 *              -shippingCharges
 *              -amountReceived
 *              -giftCardCode
 *              -useLoyaltyPoints
 *              -referralCode
 *              -outletId
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
  createInvoice
);

/**
 * @swagger
 * /invoice/update-given-change/{id}:
 *   patch:
 *     summary: Update the givenChange value of an invoice
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 667d2b29f8e076a6e2307658
 *         description: MongoDB ObjectId of the invoice
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               operation:
 *                 type: string
 *                 enum: [add, subtract]
 *                 example: add
 *               value:
 *                 type: number
 *                 example: 20
 *             required:
 *               - operation
 *               - value
 *     responses:
 *       '200':
 *         description: givenChange updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: givenChange updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Invoice'
 *                 status:
 *                   type: boolean
 *                   example: true
 *       '400':
 *         description: Invalid request data
 *       '404':
 *         description: Invoice not found
 *       '500':
 *         description: Internal Server Error
 */
router.patch(
  '/update-given-change',
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(updateGivenChangeSchema),
  updateGivenChange
);


/**
 * @swagger
 * /invoice/pagination:
 *   get:
 *     summary: Get all invoices with pagination
 *     tags: [Invoices]
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
  getInvoices
);

/**
 * @swagger
 * /invoice/{invoiceId}:
 *   get:
 *     summary: Get a invoice by ID
 *     tags: [Invoices]
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
  getInvoice
);

/**
 * @swagger
 * /invoice/payment-in/{invoiceId}:
 *   put:
 *     summary: Payment in for due amount
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: invoiceId
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
 *                amountReceived:
 *                   type: array
 *                   items:
 *                      $ref: "#/components/schemas/amountReceived"
 *                remark:
 *                   type: string
 *           required:
 *              -amountReceived
 *              -remark
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Invoice not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/payment-in/:invoiceId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(paymentIn),
  paymentInInvoice
);
router.put(
  "/:invoiceId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(paymentIn),
  updateInvoice
);
router.get(
  "/booking/:bookingId",
  // authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  getInvoiceByBookingId
)
export default router;
