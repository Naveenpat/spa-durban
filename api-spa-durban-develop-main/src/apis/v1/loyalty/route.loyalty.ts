import { Router } from "express"
import {
  createLoyalty,
  getLoyaltys,
  getLoyalty,
  updateLoyalty,
  deleteLoyalty,
  toggleLoyaltyStatus,
} from "./controller.loyalty"
import validate from "../../../middleware/validate"
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  toggleStatusDocument,
} from "./validation.loyalty"
import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Loyalty
 *   description: Loyalty management endpoints
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
 * /loyalty/add:
 *   post:
 *     summary: add a new loyalty
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               loyaltyProgramName:
 *                 type: string
 *               businessLocation:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     outletId:
 *                       type: string
 *                     earnPoint:
 *                       type: number
 *                     spentAmount:
 *                       type: number
 *                     mondaySpendAmount:
 *                       type: number
 *                     mondayEarnPoint:
 *                       type: number
 *                     tuesdaySpendAmount:
 *                       type: number
 *                     tuesdayEarnPoint:
 *                       type: number
 *                     wednesdaySpendAmount:
 *                       type: number
 *                     wednesdayEarnPoint:
 *                       type: number
 *                     thursdaySpendAmount:
 *                       type: number
 *                     thursdayEarnPoint:
 *                       type: number
 *                     fridaySpendAmount:
 *                       type: number
 *                     fridayEarnPoint:
 *                       type: number
 *                     saturdaySpendAmount:
 *                       type: number
 *                     saturdayEarnPoint:
 *                       type: number
 *                     sundaySpendAmount:
 *                       type: number
 *                     sundayEarnPoint:
 *                       type: number
 *             required:
 *               - loyaltyProgramName
 *               - businessLocation
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
  createLoyalty
)

/**
 * @swagger
 * /loyalty/pagination:
 *   get:
 *     summary: Get all loyalty with pagination
 *     tags: [Loyalty]
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
 *           items:
 *             type: string
 *           description: Valid keys are loyaltyProgramName
 *       - in: query
 *         name: dateFilter
 *         schema:
 *           type: object
 *       - in: query
 *         name: rangeFilterBy
 *         schema:
 *           type: object
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
  getLoyaltys
)

/**
 * @swagger
 * /loyalty/{loyaltyId}:
 *   get:
 *     summary: Get a loyalty by ID
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loyaltyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Loyalty not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:loyaltyId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getLoyalty
)

/**
 * @swagger
 * /loyalty/toggle-status/{loyaltyId}:
 *   put:
 *     summary: Toggle loyalty status by ID
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loyaltyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Loyalty not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/toggle-status/:loyaltyId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(toggleStatusDocument),
  toggleLoyaltyStatus
)

/**
 * @swagger
 * /loyalty/{loyaltyId}:
 *   put:
 *     summary: Update a loyalty by ID
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loyaltyId
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
 *               loyaltyProgramName:
 *                 type: string
 *               businessLocation:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     outletId:
 *                       type: string
 *                     earnPoint:
 *                       type: number
 *                     spentAmount:
 *                       type: number
 *                     mondaySpendAmount:
 *                       type: number
 *                     mondayEarnPoint:
 *                       type: number
 *                     tuesdaySpendAmount:
 *                       type: number
 *                     tuesdayEarnPoint:
 *                       type: number
 *                     wednesdaySpendAmount:
 *                       type: number
 *                     wednesdayEarnPoint:
 *                       type: number
 *                     thursdaySpendAmount:
 *                       type: number
 *                     thursdayEarnPoint:
 *                       type: number
 *                     fridaySpendAmount:
 *                       type: number
 *                     fridayEarnPoint:
 *                       type: number
 *                     saturdaySpendAmount:
 *                       type: number
 *                     saturdayEarnPoint:
 *                       type: number
 *                     sundaySpendAmount:
 *                       type: number
 *                     sundayEarnPoint:
 *                       type: number
 *             required:
 *               - loyaltyProgramName
 *               - businessLocation
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Loyalty not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:loyaltyId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updateLoyalty
)

/**
 * @swagger
 * /loyalty/{loyaltyId}:
 *   delete:
 *     summary: Delete a loyalty by ID
 *     tags: [Loyalty]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: loyaltyId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: Loyalty not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:loyaltyId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteLoyalty
)

export default router
