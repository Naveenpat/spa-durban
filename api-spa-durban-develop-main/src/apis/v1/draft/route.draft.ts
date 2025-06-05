import { Router } from "express"
import {
  createDraft,
  getDraft,
  getDraftsList,
  deleteDraft,
} from "./controller.draft"
import validate from "../../../middleware/validate"
import {
  create,
  getById,
  getAllFilter,
  deleteDocument,
} from "./validation.draft"
import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: Drafts
 *   description: Draft management endpoints
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
 * /draft/add:
 *   post:
 *     summary: Create a new Draft
 *     tags: [Drafts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *                customerId:
 *                  type: string
 *                  description: MongoDB ObjectId
 *                  example: 667d2b29f8e076a6e2307658
 *                items:
 *                  type: array
 *                  items:
 *                    $ref: "#/components/schemas/items"
 *                couponCode:
 *                   type: string
 *                   example: RTEd
 *                shippingCharges:
 *                   type: number
 *                   example: 100
 *                amountReceived:
 *                   type: array
 *                   items:
 *                     $ref: "#/components/schemas/amountReceived"
 *                giftCardCode:
 *                   type: string
 *                   example: GIFT
 *                useLoyaltyPoints:
 *                   type: boolean
 *                   example: false
 *                referralCode:
 *                   type: string
 *                   example: RTEdds
 *                outletId:
 *                  type: string
 *                  description: MongoDB ObjectId
 *                  example: 6675114f46df8aab8ab5389a
 *           required:
 *              -customerId

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
  createDraft
)

/**
 * @swagger
 * /draft/pagination:
 *   get:
 *     summary: Get all drafts with pagination
 *     tags: [Drafts]
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
  getDraftsList
)

/**
 * @swagger
 * /draft/{id}:
 *   get:
 *     summary: Get a draft by customerID
 *     tags: [Drafts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Draft not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:id",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getDraft
)

/**
 * @swagger
 * /draft/{draftId}:
 *   delete:
 *     summary: Delete a draft by ID
 *     tags: [Drafts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: draftId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: draft not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:draftId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteDraft
)

export default router
