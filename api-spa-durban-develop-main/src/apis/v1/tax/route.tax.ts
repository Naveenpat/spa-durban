import { Router } from "express"
import {
  createTax,
  getTaxs,
  getTax,
  updateTax,
  deleteTax,
} from "./controller.tax"
import validate from "../../../middleware/validate"
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
} from "./validation.tax"

import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Taxs
 *   description: Tax management endpoints
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
 * /tax/add:
 *   post:
 *     summary: Create a new tax
 *     tags: [Taxs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               taxType:
 *                   type: string
 *               taxPercent:
 *                   type: number
 *           required:
 *               -taxType
 *               -taxPercent
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
  createTax
)

/**
 * @swagger
 * /tax/pagination:
 *   get:
 *     summary: Get all taxs with pagination
 *     tags: [Taxs]
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
  getTaxs
)
/**
 * @swagger
 * /tax/{taxId}:
 *   get:
 *     summary: Get a tax by ID
 *     tags: [Taxs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taxId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Tax not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:taxId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getTax
)

/**
 * @swagger
 * /tax/{taxId}:
 *   put:
 *     summary: Update a tax by ID
 *     tags: [Taxs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taxId
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
 
*               taxType:
*                   type: string
*               taxPercent:
*                   type: number
 *           required:
 
*               -taxType
*               -taxPercent
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Tax not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:taxId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updateTax
)

/**
 * @swagger
 * /tax/{taxId}:
 *   delete:
 *     summary: Delete a tax by ID
 *     tags: [Taxs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taxId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: Tax not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:taxId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteTax
)

export default router
