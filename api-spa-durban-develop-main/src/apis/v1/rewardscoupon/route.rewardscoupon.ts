import { Router } from "express";
import {
  createRewardsCoupon,
  getRewardsCoupons,
  getRewardsCoupon,
  updateRewardsCoupon,
  deleteRewardsCoupon,
  toggleRewardsCouponStatus,
} from "./controller.rewardscoupon";
import validate from "../../../middleware/validate";
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  toggleStatusDocument,
} from "./validation.rewardscoupon";
import { authenticate } from "../../../middleware/authentication";
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery";
import { UserEnum, TokenEnum } from "../../../utils/enumUtils";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: RewardsCoupon
 *   description: RewardsCoupon management endpoints
 */

/**
 * @swagger
 * /rewardscoupon/add:
 *   post:
 *     summary: Add a new rewardscoupon
 *     tags: [RewardsCoupon]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rewardsCouponRulesName:
 *                 type: string
 *               howMuchRewardsCoupon:
 *                 type: number
 *               rewardsCouponDate:
 *                 type: string
 *               serviceId:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - rewardsCouponRulesName
 *               - howMuchRewardsCoupon
 *               - rewardsCouponDate
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
  createRewardsCoupon
);

/**
 * @swagger
 * /rewardscoupon/pagination:
 *   get:
 *     summary: Get all rewardscoupon with pagination
 *     tags: [RewardsCoupon]
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
  getRewardsCoupons
);

/**
 * @swagger
 * /rewardscoupon/{rewardsCouponId}:
 *   get:
 *     summary: Get a rewardscoupon by ID
 *     tags: [RewardsCoupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rewardsCouponId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: RewardsCoupon not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:rewardsCouponId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getRewardsCoupon
);

/**
 * @swagger
 * /rewardscoupon/toggle-status/{rewardsCouponId}:
 *   put:
 *     summary: Toggle rewardscoupon status by ID
 *     tags: [RewardsCoupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rewardsCouponId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: RewardsCoupon not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/toggle-status/:rewardsCouponId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(toggleStatusDocument),
  toggleRewardsCouponStatus
);

/**
 * @swagger
 * /rewardscoupon/{rewardsCouponId}:
 *   put:
 *     summary: Update a rewardscoupon by ID
 *     tags: [RewardsCoupon]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rewardsCouponId
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
 *               rewardsCouponRulesName:
 *                 type: string
 *               howMuchRewardsCoupon:
 *                 type: number
 *               rewardsCouponDate:
 *                 type: string
 *               serviceId:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - rewardsCouponRulesName
 *               - howMuchRewardsCoupon
 *               - rewardsCouponDate
 *               - serviceId
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: RewardsCoupon not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:rewardsCouponId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(update),
  updateRewardsCoupon
);

router.delete(
  "/:rewardsCouponId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteRewardsCoupon
);

export default router;
