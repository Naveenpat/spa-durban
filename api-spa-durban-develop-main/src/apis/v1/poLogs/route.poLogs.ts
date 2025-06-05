import { Request, Response, Router } from "express"
import { getPoLogss } from "./controller.poLogs"
import validate from "../../../middleware/validate"
import { getAllFilter } from "./validation.poLogs"

import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: PoLogss
 *   description: PoLogs management endpoints
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
 * /poLogs/pagination:
 *   get:
 *     summary: Get all poLogss with pagination
 *     tags: [PoLogss]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: header
 *         name: device-id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique device identifier
 *         example: '12345'
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
  authenticate(
    [UserEnum.Admin, UserEnum.Customer, UserEnum.Employee],
    TokenEnum.Access
  ),
  validate(getAllFilter),
  getPoLogss
)

export default router
