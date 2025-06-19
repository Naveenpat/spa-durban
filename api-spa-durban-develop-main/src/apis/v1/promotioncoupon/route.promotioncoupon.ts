import { Router } from "express";
import {
  createPromotionCoupon,
  getPromotionCoupons,
  getPromotionCoupon,
  updatePromotionCoupon,
  deletePromotionCoupon,
  togglePromotionCouponStatus,
  getAllTypeCoupons,
} from "./controller.promotioncoupon";
import validate from "../../../middleware/validate";
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  toggleStatusDocument,
} from "./validation.promotioncoupon";
import { authenticate } from "../../../middleware/authentication";
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery";
import { UserEnum, TokenEnum } from "../../../utils/enumUtils";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: PromotionCoupon
 *   description: PromotionCoupon management endpoints
 */

/**
 * @swagger
 * /promotioncoupon/add:
 *   post:
 *     summary: Add a new promotioncoupon
 *     tags: [PromotionCoupon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               promotionCouponRulesName:
 *                 type: string
 *               howMuchPromotionCoupon:
 *                 type: number
 *               promotionCouponDate:
 *                 type: string
 *               serviceId:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - promotionCouponRulesName
 *               - howMuchPromotionCoupon
 *               - promotionCouponDate
 *               - serviceId
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
  createPromotionCoupon
);

/**
 * @swagger
 * /promotioncoupon/pagination:
 *   get:
 *     summary: Get all promotioncoupon with pagination
 *     tags: [PromotionCoupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           type: array
 *           items:
 *             type: object
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
  getPromotionCoupons
);

/**
 * @swagger
 * /promotioncoupon/{promotionCouponId}:
 *   get:
 *     summary: Get a promotioncoupon by ID
 *     tags: [PromotionCoupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promotionCouponId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: PromotionCoupon not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:promotionCouponId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getPromotionCoupon
);

/**
 * @swagger
 * /promotioncoupon/toggle-status/{promotionCouponId}:
 *   put:
 *     summary: Toggle promotioncoupon status by ID
 *     tags: [PromotionCoupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promotionCouponId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: PromotionCoupon not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/toggle-status/:promotionCouponId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(toggleStatusDocument),
  togglePromotionCouponStatus
);

/**
 * @swagger
 * /promotioncoupon/{promotionCouponId}:
 *   put:
 *     summary: Update a promotioncoupon by ID
 *     tags: [PromotionCoupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promotionCouponId
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
 *               promotionCouponRulesName:
 *                 type: string
 *               howMuchPromotionCoupon:
 *                 type: number
 *               promotionCouponDate:
 *                 type: string
 *               serviceId:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - promotionCouponRulesName
 *               - howMuchPromotionCoupon
 *               - promotionCouponDate
 *               - serviceId
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: PromotionCoupon not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:promotionCouponId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updatePromotionCoupon
);

router.delete(
  "/:promotionCouponId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deletePromotionCoupon
);

router.get(
  '/new/all-type-coupon',
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  getAllTypeCoupons
);


export default router;
