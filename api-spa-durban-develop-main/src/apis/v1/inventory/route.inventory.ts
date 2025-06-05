import { Router } from "express"
import {
  createInventory,
  getInventorys,
  getInventory,
  updateInventory,
  deleteInventory,
} from "./controller.inventory"
import validate from "../../../middleware/validate"
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  changeStatus,
} from "./validation.inventory"

import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Inventorys
 *   description: Inventory management endpoints
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
 * /inventory/add:
 *   post:
 *     summary: Create a new inventory
 *     tags: [Inventorys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inventoryData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       description: ObjectId of the product
 *                     quantity:
 *                       type: number
 *                       description: Quantity of the product
 *                     purchasePrice:
 *                       type: number
 *                       description: Purchase price of the product
 *                     POId:
 *                       type: string
 *                       description: ObjectId of the purchase order
 *                     outletId:
 *                       type: string
 *                       description: ObjectId of the outlet
 *                 required:
 *                   - productId
 *                   - quantity
 *                   - purchasePrice
 *                   - POId
 *                   - outletId
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
  createInventory
)

/**
 * @swagger
 * /inventory/pagination:
 *   get:
 *     summary: Get all inventorys with pagination
 *     tags: [Inventorys]
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
  getInventorys
)
/**
 * @swagger
 * /inventory/{inventoryId}:
 *   get:
 *     summary: Get a inventory by ID
 *     tags: [Inventorys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Inventory not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:inventoryId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getInventory
)

/**
 * @swagger
 * /inventory/{inventoryId}:
 *   put:
 *     summary: Update a inventory by ID
 *     tags: [Inventorys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryId
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
 
*               productId:
*                   type: objectid
*               quantity:
*                   type: number
*               purchasePrice:
*                   type: number
*               saleQuantity:
*                   type: number
*               createdById:
*                   type: objectid
*               POId:
*                   type: objectid
*               outletId:
*                   type: objectid
 *           required:
 
*               -productId
*               -quantity
*               -purchasePrice
*               -saleQuantity
*               -createdById
*               -POId
*               -outletId
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Inventory not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:inventoryId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updateInventory
)

/**
 * @swagger
 * /inventory/{inventoryId}:
 *   delete:
 *     summary: Delete a inventory by ID
 *     tags: [Inventorys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inventoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: Inventory not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:inventoryId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteInventory
)

export default router
