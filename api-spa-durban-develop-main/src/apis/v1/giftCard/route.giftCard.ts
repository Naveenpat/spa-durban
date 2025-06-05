import { Router } from "express"
import {
  createGiftCard,
  getGiftCards,
  getGiftCard,
  updateGiftCard,
  deleteGiftCard,
  toggleGiftCardStatus,
} from "./controller.giftCard"
import validate from "../../../middleware/validate"
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  toggleStatusDocument,
} from "./validation.giftCard"
import { authenticate } from "../../../middleware/authentication"
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery"
import { UserEnum, TokenEnum } from "../../../utils/enumUtils"

const router = Router()

/**
 * @swagger
 * tags:
 *   name: GiftCards
 *   description: GiftCard management endpoints
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
 * /gift-card/add:
 *   post:
 *     summary: Create a new giftCard
 *     tags: [GiftCards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
  
*               type:
*                   type: string
*               customerId:
*                   type: objectid
*               giftCardAmount:
*                   type: number
*               giftCardName:
*                   type: string
*               giftCardExpiryDate:
*                   type: string
 *           required:
  
*               -type
*               -customerId
*               -giftCardAmount
*               -giftCardName
*               -giftCardExpiryDate
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
  createGiftCard
)

/**
 * @swagger
 * /gift-card/pagination:
 *   get:
 *     summary: Get all giftCards with pagination
 *     tags: [GiftCards]
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
  getGiftCards
)
/**
 * @swagger
 * /gift-card/{giftCardId}:
 *   get:
 *     summary: Get a giftCard by ID
 *     tags: [GiftCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: giftCardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: GiftCard not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:giftCardId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getGiftCard
)

/**
 * @swagger
 * /gift-card/{giftCardId}:
 *   put:
 *     summary: Update a giftCard by ID
 *     tags: [GiftCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: giftCardId
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
 
*               type:
*                   type: string
*               customerId:
*                   type: objectid
*               giftCardAmount:
*                   type: number
*               giftCardName:
*                   type: string
*               giftCardExpiryDate:
*                   type: string
 *           required:
 
*               -type
*               -customerId
*               -giftCardAmount
*               -giftCardName
*               -giftCardExpiryDate
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: GiftCard not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:giftCardId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updateGiftCard
)

/**
 * @swagger
 * /gift-card/{giftCardId}:
 *   delete:
 *     summary: Delete a giftCard by ID
 *     tags: [GiftCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: giftCardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: GiftCard not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:giftCardId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteGiftCard
)

/**
 * @swagger
 * /giftCard/toggle-status/{giftCardId}:
 *   put:
 *     summary: Toggle gift card status by ID
 *     tags: [GiftCards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: giftCardId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Gift card not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/toggle-status/:giftCardId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(toggleStatusDocument),
  toggleGiftCardStatus
)

export default router
