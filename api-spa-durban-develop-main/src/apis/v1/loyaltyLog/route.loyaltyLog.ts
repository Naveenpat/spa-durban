import { Router } from "express"
import { getLoyaltyLogs } from "./controller.loyaltyLog"
import validate from "../../../middleware/validate"
import { getAllFilter } from "./validation.loyaltyLog"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: LoyaltyLogs
 *   description: LoyaltyLog management endpoints
 */

/**
 * @swagger
 * /loyaltyLog/pagination:
 *   get:
 *     summary: Get all loyaltyLogs with pagination
 *     tags: [LoyaltyLogs]
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
  validate(getAllFilter),
  getLoyaltyLogs
)

export default router
