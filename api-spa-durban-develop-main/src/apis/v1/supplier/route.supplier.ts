import { Router } from "express"
import {
  createSupplier,
  getSuppliers,
  getSupplier,
  updateSupplier,
  deleteSupplier,
  toggleSupplierStatus,
} from "./controller.supplier"
import validate from "../../../middleware/validate"
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  toggleStatusDocument,
} from "./validation.supplier"
import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Suppliers
 *   description: Supplier management endpoints
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
 * /supplier/add:
 *   post:
 *     summary: Create a new supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
  
*               supplierName:
*                   type: string
*               phone:
*                   type: string
*               email:
*                   type: string
*               address:
*                   type: string
*               city:
*                   type: string
*               region:
*                   type: string
*               country:
*                   type: string
*               taxId:
*                   type: string
 *           required:
  
*               -supplierName
*               -phone
*               -email
*               -address
*               -city
*               -region
*               -country
*               -taxId
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
  createSupplier
)

/**
 * @swagger
 * /supplier/pagination:
 *   get:
 *     summary: Get all suppliers with pagination
 *     tags: [Suppliers]
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
  getSuppliers
)
/**
 * @swagger
 * /supplier/{supplierId}:
 *   get:
 *     summary: Get a supplier by ID
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Supplier not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:supplierId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getSupplier
)

/**
 * @swagger
 * /supplier/{supplierId}:
 *   put:
 *     summary: Update a supplier by ID
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: supplierId
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
 
*               supplierName:
*                   type: string
*               phone:
*                   type: string
*               email:
*                   type: string
*               address:
*                   type: string
*               city:
*                   type: string
*               region:
*                   type: string
*               country:
*                   type: string
*               taxId:
*                   type: string
 *           required:
 
*               -supplierName
*               -phone
*               -email
*               -address
*               -city
*               -region
*               -country
*               -taxId
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Supplier not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:supplierId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updateSupplier
)

/**
 * @swagger
 * /supplier/{supplierId}:
 *   delete:
 *     summary: Delete a supplier by ID
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: Supplier not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:supplierId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteSupplier
)

/**
 * @swagger
 * /supplier/toggle-status/{supplierId}:
 *   put:
 *     summary: Toggle supplier status by ID
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: supplierId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: supplier not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/toggle-status/:supplierId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(toggleStatusDocument),
  toggleSupplierStatus
)

export default router
