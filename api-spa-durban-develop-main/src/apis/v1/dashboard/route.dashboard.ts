import { Router } from "express";
import {
  getRecentBuyers,
  getRecentInvoice,
  getCounts,
  getMonthlyReport,
} from "./controller.dashboard";
import validate from "../../../middleware/validate";
import * as dashboardValidation from "./validation.dashboard";
import { authenticate } from "../../../middleware/authentication";
import { UserEnum, TokenEnum } from "../../../utils/enumUtils";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: dashboard
 *   description: dashboard endpoints
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
 * /dashboard/recent-buyers:
 *   get:
 *     summary: get recent buyers
 *     tags: [dashboard]
 *     security:
 *       - bearerAuth: []

 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: recent buyers not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/recent-buyers",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  getRecentBuyers
);

/**
 * @swagger
 * /dashboard/recent-invoice:
 *   get:
 *     summary: get recent invoice
 *     tags: [dashboard]
 *     security:
 *       - bearerAuth: []

 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: recent invoice not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/recent-invoice",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  getRecentInvoice
);

/**
 * @swagger
 * /dashboard/counts:
 *   get:
 *     summary: get recent invoice
 *     tags: [dashboard]
 *     security:
 *       - bearerAuth: []

 *     responses:
 *       '200':
 *         description: OK
 *       '404':
 *         description: recent invoice not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/counts",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  getCounts
);

/**
 * @swagger
 * /dashboard/get-monthly-report:
 *   get:
 *     summary: Get monthly report for specified year and month
 *     tags: [dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2024
 *         description: Year for which the monthly report is requested
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           example: 7
 *         description: Month (1-12) for which the monthly report is requested
 *     responses:
 *       '200':
 *         description: Successful operation
 *       '400':
 *         description: Invalid request parameters
 *       '404':
 *         description: Recent invoices not found
 *       '500':
 *         description: Internal Server Error
 */
router.get(
  "/get-monthly-report",
  authenticate([UserEnum.Admin, UserEnum.Employee], TokenEnum.Access),
  getMonthlyReport
);

export default router;
