import { Router } from "express"
import {
  createMeasurementUnit,
  getMeasurementUnits,
  getMeasurementUnit,
  updateMeasurementUnit,
  deleteMeasurementUnit,
} from "./controller.measurementUnit"
import validate from "../../../middleware/validate"
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
} from "./validation.measurementUnit"

import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: MeasurementUnits
 *   description: MeasurementUnit management endpoints
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
 * /measurement-unit/add:
 *   post:
 *     summary: Create a new measurementUnit
 *     tags: [MeasurementUnits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
  
*               unitName:
*                   type: string
*               unitCode:
*                   type: string

 *           required:
  
*               -unitName
*               -unitCode
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
  createMeasurementUnit
)

/**
 * @swagger
 * /measurement-unit/pagination:
 *   get:
 *     summary: Get all measurementUnits with pagination
 *     tags: [MeasurementUnits]
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
  getMeasurementUnits
)
/**
 * @swagger
 * /measurement-unit/{measurementUnitId}:
 *   get:
 *     summary: Get a measurementUnit by ID
 *     tags: [MeasurementUnits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: measurementUnitId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: MeasurementUnit not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:measurementUnitId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getMeasurementUnit
)

/**
 * @swagger
 * /measurement-unit/{measurementUnitId}:
 *   put:
 *     summary: Update a measurementUnit by ID
 *     tags: [MeasurementUnits]
 *     security:
 *       - bearerAuth: []
 *     parameters:  
 *       - in: path
 *         name: measurementUnitId
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
 
*               unitName:
*                   type: string
*               unitCode:
*                   type: string

 *           required:
 
*               -unitName
*               -unitCode

 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: MeasurementUnit not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:measurementUnitId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updateMeasurementUnit
)

/**
 * @swagger
 * /measurement-unit/{measurementUnitId}:
 *   delete:
 *     summary: Delete a measurementUnit by ID
 *     tags: [MeasurementUnits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: measurementUnitId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: MeasurementUnit not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:measurementUnitId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteMeasurementUnit
)

export default router
