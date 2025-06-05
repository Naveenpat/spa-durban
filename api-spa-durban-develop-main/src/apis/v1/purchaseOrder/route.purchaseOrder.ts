import { Router } from "express"
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
  updatePurchaseOrderPayment,
} from "./controller.purchaseOrder"
import validate from "../../../middleware/validate"
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  updatePoPayment,
  changeStatus,
} from "./validation.purchaseOrder"
import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: PurchaseOrders
 *   description: PurchaseOrder management endpoints
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
 * /purchase-order/add:
 *   post:
 *     summary: Create a new purchaseOrder
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               supplierId:
 *                 type: string
 *               invoiceNumber:
 *                 type: string

 *               orderDate:
 *                 type: string

 *               discountType:
 *                 type: string
 *               amountPaid:
 *                 type: number
 *               payableAmount:
 *                 type: number
 *               shippingCharges:
 *                 type: number
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     rate:
 *                       type: number
 *                     tax:
 *                       type: string
 *                     discount:
 *                       type: number

 *             required:
 *               - supplierId
 *               - invoiceNumber
 *               - orderDate
 *               - dueDate
 *               - products
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
  createPurchaseOrder
)

/**
 * @swagger
 * /purchase-order/pagination:
 *   get:
 *     summary: Get all purchaseOrders with pagination
 *     tags: [PurchaseOrders]
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
  getPurchaseOrders
)
/**
 * @swagger
 * /purchase-order/{purchaseOrderId}:
 *   get:
 *     summary: Get a purchaseOrder by ID
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: purchaseOrderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: PurchaseOrder not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:purchaseOrderId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getPurchaseOrder
)

/**
 * @swagger
 * /purchase-order/{purchaseOrderId}:
 *   put:
 *     summary: Update a purchaseOrder by ID
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: purchaseOrderId
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
 *               supplierId:
 *                 type: string
 *               invoiceNumber:
 *                 type: string
 *               orderDate:
 *                 type: string
 *               discountType:
 *                 type: string
 *               amountPaid:
 *                 type: number
 *               payableAmount:
 *                 type: number
 *               shippingCharges:
 *                 type: number
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     rate:
 *                       type: number
 *                     tax:
 *                       type: string
 *                     discount:
 *                       type: number
 *             required:
 *               - supplierId
 *               - invoiceNumber
 *               - orderDate
 *               - dueDate
 *               - products
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: PurchaseOrder not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:purchaseOrderId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updatePurchaseOrder
)

/**
 * @swagger
 * /purchase-order/po-payment/{purchaseOrderId}:
 *   put:
 *     summary: Update a purchaseOrder by ID
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: purchaseOrderId
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
 *               amount:
 *                 type: number

 *             required:
 *               - amount

 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: PurchaseOrder not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/po-payment/:purchaseOrderId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(updatePoPayment),
  updatePurchaseOrderPayment
)
/**
 * @swagger
 * /purchase-order/{purchaseOrderId}:
 *   delete:
 *     summary: Delete a purchaseOrder by ID
 *     tags: [PurchaseOrders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: purchaseOrderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: PurchaseOrder not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:purchaseOrderId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deletePurchaseOrder
)

export default router
