import { Router } from "express"
import { createUser, getUser } from "./controller.userRole"
import validate from "../../../middleware/validate"
import { createUserSchema, getUserSchema } from "./validation.userRole"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
const router = Router()

router.post(
  "/add",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(createUserSchema),
  createUser
)

router.get(
  "/get",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getUserSchema),
  getUser
)

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

/**
 * @swagger
 * /user-role/add:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleName:
 *                 type: string
 *               user:
 *                 type: string
 *             required:
 *               - userRole
 *               - user
 *     responses:
 *       '201':
 *         description: Created
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal Server Error
 */
/**
 * @swagger
 * /user-role/get:
 *   get:
 *     summary: get users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: roleName
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '500':
 *         description: Internal Server Error
 */

export default router
