import { Router } from "express";
import {
  createCashback,
  getCashbacks,
  getCashback,
  updateCashback,
  deleteCashback,
  toggleCashbackStatus,
} from "./controller.cashback";
import validate from "../../../middleware/validate";
import {
  create,
  update,
  getAllFilter,
  deleteDocument,
  getById,
  toggleStatusDocument,
} from "./validation.cashback";
import { authenticate } from "../../../middleware/authentication";
import { parseBodyAndQuery } from "../../../middleware/parseBodyAndQuery";
import { UserEnum, TokenEnum } from "../../../utils/enumUtils";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Cashback
 *   description: Cashback management endpoints
 */

/**
 * @swagger
 * /cashback/add:
 *   post:
 *     summary: Add a new cashback
 *     tags: [Cashback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cashBackRulesName:
 *                 type: string
 *               howMuchCashback:
 *                 type: number
 *               cashBackDate:
 *                 type: string
 *               serviceId:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - cashBackRulesName
 *               - howMuchCashback
 *               - cashBackDate
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
  // validate(create),
  createCashback
);

/**
 * @swagger
 * /cashback/pagination:
 *   get:
 *     summary: Get all cashback with pagination
 *     tags: [Cashback]
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
  getCashbacks
);

/**
 * @swagger
 * /cashback/{cashbackId}:
 *   get:
 *     summary: Get a cashback by ID
 *     tags: [Cashback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cashbackId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Cashback not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/:cashBackId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(getById),
  getCashback
);

/**
 * @swagger
 * /cashback/toggle-status/{cashbackId}:
 *   put:
 *     summary: Toggle cashback status by ID
 *     tags: [Cashback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cashbackId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: Cashback not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/toggle-status/:cashBackId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(toggleStatusDocument),
  toggleCashbackStatus
);

/**
 * @swagger
 * /cashback/{cashbackId}:
 *   put:
 *     summary: Update a cashback by ID
 *     tags: [Cashback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cashbackId
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
 *               cashBackRulesName:
 *                 type: string
 *               howMuchCashback:
 *                 type: number
 *               cashBackDate:
 *                 type: string
 *               serviceId:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - cashBackRulesName
 *               - howMuchCashback
 *               - cashBackDate
 *               - serviceId
 *     responses:
 *       '200':
 *         description: OK
 *       '400':
 *         description: Bad Request
 *       '404':
 *         description: Cashback not found
 *       '500':
 *         description: Internal Server Error
 */
router.put(
  "/:cashBackId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  // validate(update),
  updateCashback
);

/**
 * @swagger
 * /cashback/{cashbackId}:
 *   delete:
 *     summary: Delete a cashback by ID
 *     tags: [Cashback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cashbackId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: No Content
 *       '404':
 *         description: Cashback not found
 *       '500':
 *         description: Internal Server Error
 */
router.delete(
  "/:cashBackId",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  validate(deleteDocument),
  deleteCashback
);

export default router;
