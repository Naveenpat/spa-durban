import { Router } from "express"
import {
  createSubCategory,
  getSubCategorys,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "./controller.subCategory"
import validate from "../../../middleware/validate"
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
} from "./validation.subCategory"

import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: SubCategorys
 *   description: SubCategory management endpoints
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
 * /subcategory/add:
 *   post:
 *     summary: Create a new subCategory
 *     tags: [SubCategorys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
  
*               categoryId:
*                   type: objectid
*               subCategoryName:
*                   type: string
*               description:
*                   type: string
 *           required:
  
*               -categoryId
*               -subCategoryName
*               -description
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
  createSubCategory
)

/**
 * @swagger
 * /subcategory/pagination:
 *   get:
 *     summary: Get all subCategorys with pagination
 *     tags: [SubCategorys]
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
  getSubCategorys
)
/**
 * @swagger
 * /subcategory/{subCategoryId}:
 *   get:
 *     summary: Get a subCategory by ID
 *     tags: [SubCategorys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subCategoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: SubCategory not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:subCategoryId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getSubCategory
)

/**
 * @swagger
 * /subcategory/{subCategoryId}:
 *   put:
 *     summary: Update a subCategory by ID
 *     tags: [SubCategorys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subCategoryId
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
 
*               categoryId:
*                   type: objectid
*               subCategoryName:
*                   type: string
*               description:
*                   type: string
 *           required:
 
*               -categoryId
*               -subCategoryName
*               -description
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: SubCategory not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:subCategoryId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updateSubCategory
)

/**
 * @swagger
 * /subcategory/{subCategoryId}:
 *   delete:
 *     summary: Delete a subCategory by ID
 *     tags: [SubCategorys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subCategoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: SubCategory not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:subCategoryId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteSubCategory
)

export default router
