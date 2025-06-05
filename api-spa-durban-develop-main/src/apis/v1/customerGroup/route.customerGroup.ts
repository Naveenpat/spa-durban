import { Router } from "express"
import {
  createCustomerGroup,
  getCustomerGroups,
  getCustomerGroup,
  updateCustomerGroup,
  deleteCustomerGroup,
} from "./controller.customerGroup"
import validate from "../../../middleware/validate"
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
} from "./validation.customerGroup"

import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: CustomerGroups
 *   description: CustomerGroup management endpoints
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
 * /customer-group/add:
 *   post:
 *     summary: Create a new customerGroup
 *     tags: [CustomerGroups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
  
*               customerGroupName:
*                   type: string
*               customers:
*                   type: array
*                   items:
*                      type: objectid
 *           required:
  
*               -customerGroupName
*               -customers
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
  createCustomerGroup
)

/**
 * @swagger
 * /customer-group/pagination:
 *   get:
 *     summary: Get all customerGroups with pagination
 *     tags: [CustomerGroups]
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
  getCustomerGroups
)
/**
 * @swagger
 * /customer-group/{customerGroupId}:
 *   get:
 *     summary: Get a customerGroup by ID
 *     tags: [CustomerGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerGroupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: CustomerGroup not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:customerGroupId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getCustomerGroup
)

/**
 * @swagger
 * /customer-group/{customerGroupId}:
 *   put:
 *     summary: Update a customerGroup by ID
 *     tags: [CustomerGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerGroupId
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
 
*               customerGroupName:
*                   type: string
*               customers:
*                   type: array
*                   items:
*                      type: objectid
 *           required:
 
*               -customerGroupName
*               -customers
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: CustomerGroup not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:customerGroupId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updateCustomerGroup
)

/**
 * @swagger
 * /customer-group/{customerGroupId}:
 *   delete:
 *     summary: Delete a customerGroup by ID
 *     tags: [CustomerGroups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerGroupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: CustomerGroup not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:customerGroupId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteCustomerGroup
)

export default router
