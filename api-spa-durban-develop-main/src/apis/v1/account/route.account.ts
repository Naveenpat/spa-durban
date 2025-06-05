import { Router } from "express"
import {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
  toggleAccountStatus,
} from "./controller.account"
import validate from "../../../middleware/validate"
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  toggleStatusDocument,
} from "./validation.account"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Accounts
 *   description: Account management endpoints
 */

/**
 * @swagger
 * /account/add:
 *   post:
 *     summary: Create a new account
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
  
*               accountName:
*                   type: string
*               accountNumber:
*                   type: string
*               note:
*                   type: string
 *           required:
  
*               -accountName
*               -accountNumber
*               -note
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
  createAccount
)

/**
 * @swagger
 * /account/pagination:
 *   get:
 *     summary: Get all accounts with pagination
 *     tags: [Accounts]
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
  getAccounts
)
/**
 * @swagger
 * /account/{accountId}:
 *   get:
 *     summary: Get a account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Account not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:accountId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getAccount
)

/**
 * @swagger
 * /account/{accountId}:
 *   put:
 *     summary: Update a account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountId
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
 
*               accountName:
*                   type: string
*               accountNumber:
*                   type: string
*               note:
*                   type: string
 *           required:
 
*               -accountName
*               -accountNumber
*               -note
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Account not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:accountId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updateAccount
)

/**
 * @swagger
 * /account/{accountId}:
 *   delete:
 *     summary: Delete a account by ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: Account not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:accountId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteAccount
)

/**
 * @swagger
 * /account/toggle-status/{accountId}:
 *   put:
 *     summary: Toggle account status by ID
 *     tags: [Accounts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Account not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/toggle-status/:accountId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(toggleStatusDocument),
  toggleAccountStatus
)

export default router
